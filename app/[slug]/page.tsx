import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { recordEvent, utmParamsFrom } from "@/lib/tracking/record-event";
import { getSessionId } from "@/lib/tracking/session";
import { PageShell } from "@/components/public/page-shell";

// This reads cookies() (the session id) and hits the database on every
// request, and it's the whole point of the page (Stage 11's tracking) —
// there's nothing to prerender. Same reasoning as app/admin/layout.tsx;
// see ARCHITECTURE.md's "Cache Components" caution.
export const instant = false;

type LandingPageRow = {
  id: string;
  name: string;
  slug: string;
  page_type: "product" | "collection" | "comparison";
  product_id: string | null;
  status: string;
};

function toSearchParams(
  search: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value == null) continue;
    params.set(key, Array.isArray(value) ? value[0] : value);
  }
  return params;
}

export default async function PublicLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const supabase = createServiceClient();

  // Reachable only once published — a draft slug 404s exactly like one
  // that was never created, so there's no way to "preview" an unfinished
  // page just by guessing its slug.
  const { data: landingPage } = await supabase
    .from("landing_pages")
    .select("id, name, slug, page_type, product_id, status")
    .eq("slug", slug)
    .eq("status", "published")
    .single<LandingPageRow>();

  if (!landingPage) notFound();

  const sessionId = await getSessionId();
  const utm = utmParamsFrom(toSearchParams(search));

  await recordEvent({
    event_type: landingPage.page_type === "product" ? "product_view" : "landing_view",
    session_id: sessionId,
    landing_page_id: landingPage.id,
    product_id: landingPage.product_id,
    ...utm,
  });

  if (landingPage.page_type === "product" && landingPage.product_id) {
    return <ProductView landingPage={landingPage} />;
  }

  return <CollectionView landingPage={landingPage} />;
}

async function ProductView({ landingPage }: { landingPage: LandingPageRow }) {
  const supabase = createServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name, brand, category, price, currency, rating, review_count, image_url")
    .eq("id", landingPage.product_id!)
    .single();

  if (!product) {
    return (
      <PageShell>
        <p className="text-muted-foreground">
          This page isn&apos;t set up yet — check back soon.
        </p>
      </PageShell>
    );
  }

  // The compliance gate lives here, not just in a doc: never show a "get
  // the deal" link unless there's an offer that's both active and
  // confirmed to allow paid traffic. See ARCHITECTURE.md's compliance
  // findings and app/go/[slug]/route.ts, which enforces the same check
  // again before actually redirecting.
  const { data: offer } = await supabase
    .from("affiliate_offers")
    .select("id")
    .eq("product_id", product.id)
    .eq("status", "active")
    .eq("paid_traffic_allowed", true)
    .limit(1)
    .maybeSingle();

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable product image URLs
          <img
            src={product.image_url}
            alt={product.name}
            className="rounded-md w-full object-cover"
          />
        )}
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-muted-foreground text-sm">
          {[product.brand, product.category].filter(Boolean).join(" · ") || " "}
        </p>
        {product.price != null && (
          <p className="text-xl font-semibold">
            {product.currency ?? "INR"} {product.price}
          </p>
        )}
        {product.rating != null && (
          <p className="text-sm text-muted-foreground">
            ⭐ {product.rating}
            {product.review_count != null && ` (${product.review_count} reviews)`}
          </p>
        )}
        {offer ? (
          <a
            href={`/go/${landingPage.slug}`}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90"
          >
            Get the deal
          </a>
        ) : (
          <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
            This deal isn&apos;t live yet — check back soon.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Paid link — we may earn a commission if you buy through this page.
        </p>
      </div>
    </PageShell>
  );
}

type CollectionEntry = {
  slug: string;
  name: string;
  // Supabase-js infers embedded to-one relations as arrays without
  // generated DB types — this is actually always a single object (or
  // null), guaranteed by product_id being a plain foreign key.
  product: {
    name: string;
    price: number | null;
    currency: string | null;
    image_url: string | null;
  } | null;
};

async function CollectionView({ landingPage }: { landingPage: LandingPageRow }) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("slug, name, product:products(name, price, currency, image_url)")
    .eq("page_type", "product")
    .eq("status", "published")
    .neq("id", landingPage.id)
    .order("created_at", { ascending: false });
  const pages = data as unknown as CollectionEntry[] | null;

  return (
    <PageShell>
      <h1 className="text-2xl font-bold mb-6">{landingPage.name}</h1>
      {!pages?.length ? (
        <p className="text-muted-foreground">
          Nothing published yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="border rounded-md p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow"
            >
              {page.product?.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable product image URLs
                <img
                  src={page.product.image_url}
                  alt={page.product?.name ?? page.name}
                  className="rounded-md aspect-square object-cover"
                />
              )}
              <div className="font-medium">{page.product?.name ?? page.name}</div>
              {page.product?.price != null && (
                <div className="text-sm text-muted-foreground">
                  {page.product.currency ?? "INR"} {page.product.price}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
