"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { str, num, bool } from "@/lib/admin/form-data";
import { redirectWithToast } from "@/lib/admin/toast-redirect";

function productPayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    brand: str(formData, "brand"),
    category: str(formData, "category"),
    price: num(formData, "price"),
    currency: str(formData, "currency") ?? "INR",
    image_url: str(formData, "image_url"),
    affiliate_url: str(formData, "affiliate_url"),
    // Defaults to false — see ARCHITECTURE.md's compliance findings. Never
    // flip this to true for a product you haven't actually confirmed
    // allows paid Meta traffic.
    paid_traffic_allowed: bool(formData, "paid_traffic_allowed"),
    status: str(formData, "status") ?? "draft",
    commission_percentage: num(formData, "commission_percentage"),
    commission_notes: str(formData, "commission_notes"),
  };
}

export async function createProduct(formData: FormData) {
  const payload = productPayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  redirectWithToast("/admin/products", "Product created");
}

export async function updateProduct(id: string, formData: FormData) {
  const payload = productPayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  redirectWithToast("/admin/products", "Product saved");
}

// A duplicate slug, or a not-null violation from a landing page's product
// FK — turn either into something an admin can actually act on instead of
// a raw Postgres error.
function friendlyError(error: { code?: string; message: string }): Error {
  if (error.code === "23502" && error.message.includes("product_id")) {
    return new Error(
      "Couldn't delete — a landing page pointing at this product still needs it. Set that landing page to Draft or delete it first, then try again.",
    );
  }
  return new Error(error.message);
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  // The actual rule: a product with a Live landing page can't be deleted
  // out from under it — that landing page (and its /go/[slug] redirect)
  // would break for anyone who already has the link. Draft/Archived
  // landing pages don't block deletion; they cascade-delete along with
  // the product (migrations/0003_fix_landing_page_delete.sql).
  const { data: livePages } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("product_id", id)
    .eq("status", "live")
    .limit(1);

  if (livePages?.length) {
    throw new Error(
      `Can't delete — its landing page "/${livePages[0].slug}" is Live. Set that landing page to Draft (or delete it) first, then delete the product.`,
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw friendlyError(error);

  revalidatePath("/admin", "layout");
}

// Bulk create/update via CSV — see lib/admin/combined-import-action.ts
// (shared with Landing pages, since one CSV covers both entities together).
