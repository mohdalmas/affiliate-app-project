// Pure parsing + validation for the combined Product+Landing-page CSV —
// no Supabase calls here, so this is fully unit-testable. The actual
// database writes live in combined-import-action.ts, which calls this
// per row.
//
// One row = one product, optionally with one landing page attached
// (leave every landing_page_* column blank to skip the landing page for
// that row — useful for a pure product-only bulk edit).

export const STATUS_VALUES = ["draft", "live", "archived"];
const TRUTHY_VALUES = ["true", "1", "yes", "y"];

export type ParsedProductFields = {
  id: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  paid_traffic_allowed: boolean;
  status: string;
};

export type ParsedLandingPageFields = {
  id: string | null;
  name: string;
  slug: string;
  status: string;
};

export type ParsedRow =
  | { ok: true; product: ParsedProductFields; landingPage: ParsedLandingPageFields | null }
  | { ok: false; error: string };

function cell(header: string[], row: string[], column: string): string {
  const index = header.indexOf(column);
  return index === -1 ? "" : (row[index] ?? "").trim();
}

export function parseCombinedRow(header: string[], row: string[]): ParsedRow {
  const get = (column: string) => cell(header, row, column);

  const productName = get("product_name");
  if (!productName) return { ok: false, error: "product_name is required" };

  const productStatus = get("product_status").toLowerCase() || "draft";
  if (!STATUS_VALUES.includes(productStatus)) {
    return {
      ok: false,
      error: `product_status must be one of ${STATUS_VALUES.join("/")}, got "${get("product_status")}"`,
    };
  }

  const priceRaw = get("product_price");
  const price = priceRaw === "" ? null : Number(priceRaw);
  if (price != null && Number.isNaN(price)) {
    return { ok: false, error: `product_price "${priceRaw}" isn't a number` };
  }

  const product: ParsedProductFields = {
    id: get("product_id") || null,
    name: productName,
    brand: get("product_brand") || null,
    category: get("product_category") || null,
    price,
    currency: get("product_currency") || "INR",
    image_url: get("product_image_url") || null,
    affiliate_url: get("product_affiliate_url") || null,
    paid_traffic_allowed: TRUTHY_VALUES.includes(
      get("product_paid_traffic_allowed").toLowerCase(),
    ),
    status: productStatus,
  };

  const slug = get("landing_page_slug");
  if (!slug) {
    // No slug = this row doesn't touch a landing page at all. Any stray
    // landing_page_id/name/status values are ignored rather than guessed at.
    return { ok: true, product, landingPage: null };
  }

  const landingPageStatus = get("landing_page_status").toLowerCase() || "draft";
  if (!STATUS_VALUES.includes(landingPageStatus)) {
    return {
      ok: false,
      error: `landing_page_status must be one of ${STATUS_VALUES.join("/")}, got "${get("landing_page_status")}"`,
    };
  }

  const landingPage: ParsedLandingPageFields = {
    id: get("landing_page_id") || null,
    name: get("landing_page_name") || productName,
    slug,
    status: landingPageStatus,
  };

  return { ok: true, product, landingPage };
}
