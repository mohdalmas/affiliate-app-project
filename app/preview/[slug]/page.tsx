import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/public/page-shell";
import { ProductView, type PreviewableProduct } from "@/components/public/product-view";

// Admin-only (see lib/supabase/proxy.ts — /preview requires login, same as
// /admin). Shows a landing page's product regardless of status, so you can
// see what a draft will look like before setting it Live. Uses the normal
// authenticated client (not the service-role one) since this only ever
// runs for a logged-in admin — no need to bypass RLS here.
export const instant = false;

type LandingPageRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  product: PreviewableProduct | null;
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("landing_pages")
    .select(
      "id, name, slug, status, product:products(name, brand, category, price, currency, image_url, affiliate_url, paid_traffic_allowed, status)",
    )
    .eq("slug", slug)
    .maybeSingle();
  // Same Supabase-js embedded-relation typing quirk as the public page.
  const landingPage = data as unknown as LandingPageRow | null;

  if (!landingPage) notFound();

  return (
    <PageShell>
      <ProductView product={landingPage.product} slug={landingPage.slug} preview />
    </PageShell>
  );
}
