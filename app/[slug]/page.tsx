import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { recordEvent, utmParamsFrom } from "@/lib/tracking/record-event";
import { getSessionId } from "@/lib/tracking/session";
import { PageShell } from "@/components/public/page-shell";
import { ProductView, type PreviewableProduct } from "@/components/public/product-view";
import { RelatedProductsLayout, type RelatedDeal } from "@/components/public/related-products";

// This reads cookies() (the session id) and hits the database on every
// request, and it's the whole point of the page (recording a product_view)
// — see app/[slug]/layout.tsx for why `instant = false` alone isn't
// enough for a dynamic [param] route and why that's fine here.
export const instant = false;

type LandingPageRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  product: PreviewableProduct & { id: string };
};

type RelatedRow = {
  slug: string;
  name: string;
  product: {
    name: string;
    brand: string | null;
    price: number | null;
    currency: string | null;
    image_url: string | null;
  } | null;
};

// Up to 12 other Live products in the same category, for the horizontally
// scrollable "More in category" shelf below the main product — see
// components/public/related-products.tsx.
async function getRelatedDeals(
  supabase: ReturnType<typeof createServiceClient>,
  category: string,
  excludeSlug: string,
): Promise<RelatedDeal[]> {
  const { data } = await supabase
    .from("landing_pages")
    .select("slug, name, product:products!inner(name, brand, price, currency, image_url, category, status)")
    .eq("status", "live")
    .eq("product.status", "live")
    .eq("product.category", category)
    .neq("slug", excludeSlug)
    .order("created_at", { ascending: false })
    .limit(12);
  const rows = data as unknown as RelatedRow[] | null;

  return (rows ?? []).map((row) => ({
    slug: row.slug,
    title: row.product?.name ?? row.name,
    brand: row.product?.brand ?? null,
    imageUrl: row.product?.image_url ?? null,
    price: row.product?.price ?? null,
    currency: row.product?.currency ?? null,
  }));
}

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

  // Reachable only once Live — a draft slug 404s exactly like one that
  // was never created, so there's no way to "preview" an unfinished page
  // just by guessing its slug (use /preview/[slug] as an admin instead).
  //
  // maybeSingle(), not single(): a slug not matching any Live landing page
  // is an expected, routine outcome here (typo, unpublished page), not an
  // error condition — single() would report it as a 406 in Supabase's
  // logs for no reason.
  const { data } = await supabase
    .from("landing_pages")
    .select(
      "id, name, slug, status, product:products(id, name, brand, category, price, currency, image_url, affiliate_url, paid_traffic_allowed, status)",
    )
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  // Supabase-js infers this embedded to-one relation as an array without
  // generated DB types — it's actually always a single object or null,
  // guaranteed by product_id being a required, plain foreign key.
  const landingPage = data as unknown as LandingPageRow | null;

  if (!landingPage) notFound();

  const sessionId = await getSessionId();
  const utm = utmParamsFrom(toSearchParams(search));

  await recordEvent({
    event_type: "product_view",
    session_id: sessionId,
    landing_page_id: landingPage.id,
    product_id: landingPage.product?.id ?? null,
    ...utm,
  });

  const related = landingPage.product?.category
    ? await getRelatedDeals(supabase, landingPage.product.category, landingPage.slug)
    : [];

  return (
    <PageShell>
      <RelatedProductsLayout related={related} categoryLabel={landingPage.product?.category ?? null}>
        <ProductView product={landingPage.product} slug={landingPage.slug} />
      </RelatedProductsLayout>
    </PageShell>
  );
}
