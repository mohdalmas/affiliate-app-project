import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/admin/csv";

// Column order here is the contract with importCombinedCsv
// (lib/admin/combined-import-action.ts) — keep them in sync. Every
// product gets at least one row, even with no landing page (the
// landing_page_* columns are just blank in that case); a product with
// more than one landing page gets one row per landing page, repeating the
// product's own fields.
const COLUMNS = [
  "product_id",
  "product_name",
  "product_brand",
  "product_category",
  "product_price",
  "product_currency",
  "product_image_url",
  "product_affiliate_url",
  "product_paid_traffic_allowed",
  "product_status",
  "product_commission_percentage",
  "product_commission_notes",
  "landing_page_id",
  "landing_page_name",
  "landing_page_slug",
  "landing_page_status",
] as const;

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  paid_traffic_allowed: boolean;
  status: string;
  commission_percentage: number | null;
  commission_notes: string | null;
};

type LandingPageRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  product_id: string;
};

export async function GET() {
  const supabase = await createClient();

  const [{ data: products, error: productsError }, { data: landingPages, error: landingPagesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, brand, category, price, currency, image_url, affiliate_url, paid_traffic_allowed, status, commission_percentage, commission_notes",
        )
        .order("name"),
      supabase.from("landing_pages").select("id, name, slug, status, product_id").order("name"),
    ]);

  const error = productsError ?? landingPagesError;
  if (error) {
    return new Response(`Couldn't export: ${error.message}`, { status: 500 });
  }

  const landingPagesByProduct = new Map<string, LandingPageRow[]>();
  for (const page of (landingPages ?? []) as LandingPageRow[]) {
    landingPagesByProduct.set(page.product_id, [
      ...(landingPagesByProduct.get(page.product_id) ?? []),
      page,
    ]);
  }

  const rows: (string | number | boolean | null)[][] = [[...COLUMNS]];

  for (const product of (products ?? []) as ProductRow[]) {
    const pages = landingPagesByProduct.get(product.id) ?? [null];
    for (const page of pages) {
      rows.push([
        product.id,
        product.name,
        product.brand,
        product.category,
        product.price,
        product.currency,
        product.image_url,
        product.affiliate_url,
        product.paid_traffic_allowed,
        product.status,
        product.commission_percentage,
        product.commission_notes,
        page?.id ?? null,
        page?.name ?? null,
        page?.slug ?? null,
        page?.status ?? null,
      ]);
    }
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="products-and-landing-pages.csv"',
    },
  });
}
