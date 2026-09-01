"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num } from "@/lib/admin/form-data";

function productPayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    brand: str(formData, "brand"),
    category: str(formData, "category"),
    subcategory: str(formData, "subcategory"),
    product_url: str(formData, "product_url"),
    image_url: str(formData, "image_url"),
    price: num(formData, "price"),
    currency: str(formData, "currency") ?? "INR",
    rating: num(formData, "rating"),
    review_count: num(formData, "review_count"),
    status: str(formData, "status") ?? "research",
    hypothesis: str(formData, "hypothesis"),
  };
}

export async function createProduct(formData: FormData) {
  const payload = productPayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
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

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
}
