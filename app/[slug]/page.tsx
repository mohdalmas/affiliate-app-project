import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { recordEvent, utmParamsFrom } from "@/lib/tracking/record-event";
import { getSessionId } from "@/lib/tracking/session";
import { PageShell } from "@/components/public/page-shell";
import { ProductView, type PreviewableProduct } from "@/components/public/product-view";

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

  return (
    <PageShell>
      <ProductView product={landingPage.product} slug={landingPage.slug} />
    </PageShell>
  );
}
