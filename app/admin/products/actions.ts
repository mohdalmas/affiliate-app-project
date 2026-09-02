"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num, bool } from "@/lib/admin/form-data";

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
  };
}

export async function createProduct(formData: FormData) {
  const payload = productPayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  redirect("/admin/products");
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
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

// Bulk create/update via CSV — see lib/admin/combined-import-action.ts
// (shared with Landing pages, since one CSV covers both entities together).
