"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "./csv";
import { parseCombinedRow } from "./combined-csv";
import { buildImportSummaryMessage } from "./import-summary";

// A duplicate slug hits Postgres's unique constraint (code 23505) — turn
// that into something a beginner can actually act on instead of a raw
// Postgres error message. Same helper as landing-pages/actions.ts, kept
// local here since it's a one-line function, not worth sharing a module for.
function friendlyMessage(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "that slug is already used by another landing page";
  }
  return error.message;
}

// Import/Export lives on its own admin tab now (see app/admin/import-export),
// so this normally always redirects back there — but the "returnTo" field
// is still whitelisted rather than trusted outright, since it's user input.
const KNOWN_RETURN_PATHS = ["/admin/import-export", "/admin/products", "/admin/landing-pages"];

function returnPath(formData: FormData): string {
  const value = formData.get("returnTo");
  return typeof value === "string" && KNOWN_RETURN_PATHS.includes(value)
    ? value
    : "/admin/import-export";
}

// One CSV, one row = a product and (optionally) the landing page for it —
// see lib/admin/combined-csv.ts for the row format and validation, and
// app/admin/export/route.ts for the matching export. Replaced the earlier
// separate Products-only / Landing-pages-only importers: a product-only
// bulk edit still works fine here (just leave every landing_page_* column
// blank), so there's no need for three overlapping ways to do this.
export async function importCombinedCsv(formData: FormData) {
  const redirectPath = returnPath(formData);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${redirectPath}?importSummary=${encodeURIComponent("No file selected.")}`);
  }

  const rows = parseCsv(await file.text());
  if (rows.length < 2) {
    redirect(
      `${redirectPath}?importSummary=${encodeURIComponent(
        "File has no data rows — nothing to import.",
      )}`,
    );
  }

  const header = rows[0].map((c) => c.trim().toLowerCase());
  const dataRows = rows.slice(1);
  const supabase = await createClient();

  let productsCreated = 0;
  let productsUpdated = 0;
  let landingPagesCreated = 0;
  let landingPagesUpdated = 0;
  const errors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rowNumber = i + 2; // +1 for the header row, +1 for 1-indexing
    const parsed = parseCombinedRow(header, dataRows[i]);

    if (!parsed.ok) {
      errors.push(`row ${rowNumber}: ${parsed.error}`);
      continue;
    }

    const { product, landingPage } = parsed;
    const productPayload = {
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      currency: product.currency,
      mrp: product.mrp,
      rating: product.rating,
      review_count: product.review_count,
      image_url: product.image_url,
      affiliate_url: product.affiliate_url,
      paid_traffic_allowed: product.paid_traffic_allowed,
      status: product.status,
      commission_percentage: product.commission_percentage,
      commission_notes: product.commission_notes,
    };

    let productId = product.id;

    if (productId) {
      const { data, error } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", productId)
        .select("id");
      if (error) {
        errors.push(`row ${rowNumber}: ${error.message}`);
        continue;
      }
      if (!data?.length) {
        errors.push(`row ${rowNumber}: no product found with id "${productId}"`);
        continue;
      }
      productsUpdated += 1;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productPayload)
        .select("id")
        .single();
      if (error || !data) {
        errors.push(`row ${rowNumber}: ${error?.message ?? "product insert failed"}`);
        continue;
      }
      productId = data.id;
      productsCreated += 1;
    }

    if (!landingPage) continue;

    const landingPagePayload = {
      name: landingPage.name,
      slug: landingPage.slug,
      product_id: productId,
      status: landingPage.status,
    };

    if (landingPage.id) {
      const { data, error } = await supabase
        .from("landing_pages")
        .update(landingPagePayload)
        .eq("id", landingPage.id)
        .select("id");
      if (error) {
        errors.push(`row ${rowNumber}: landing page — ${friendlyMessage(error)}`);
      } else if (!data?.length) {
        errors.push(`row ${rowNumber}: no landing page found with id "${landingPage.id}"`);
      } else {
        landingPagesUpdated += 1;
      }
    } else {
      const { error } = await supabase.from("landing_pages").insert(landingPagePayload);
      if (error) {
        errors.push(`row ${rowNumber}: landing page — ${friendlyMessage(error)}`);
      } else {
        landingPagesCreated += 1;
      }
    }
  }

  revalidatePath("/admin", "layout");

  const summary = buildImportSummaryMessage(
    [
      { label: "products created", count: productsCreated },
      { label: "products updated", count: productsUpdated },
      { label: "landing pages created", count: landingPagesCreated },
      { label: "landing pages updated", count: landingPagesUpdated },
    ],
    errors,
  );
  redirect(`${redirectPath}?importSummary=${encodeURIComponent(summary)}`);
}
