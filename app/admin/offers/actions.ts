"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num, bool } from "@/lib/admin/form-data";

function offerPayload(formData: FormData) {
  return {
    product_id: str(formData, "product_id"),
    network: str(formData, "network"),
    merchant: str(formData, "merchant"),
    affiliate_url: str(formData, "affiliate_url"),
    commission_percent: num(formData, "commission_percent"),
    commission_fixed: num(formData, "commission_fixed"),
    currency: str(formData, "currency") ?? "INR",
    // Defaults to false — see ARCHITECTURE.md's compliance table. Never
    // flip this to true for an offer you haven't actually confirmed allows
    // paid Meta traffic.
    paid_traffic_allowed: bool(formData, "paid_traffic_allowed"),
    notes: str(formData, "notes"),
    status: str(formData, "status") ?? "active",
  };
}

export async function createOffer(formData: FormData) {
  const payload = offerPayload(formData);
  if (!payload.product_id || !payload.network || !payload.merchant || !payload.affiliate_url) {
    throw new Error("Product, network, merchant, and affiliate URL are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("affiliate_offers").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

export async function updateOffer(id: string, formData: FormData) {
  const payload = offerPayload(formData);
  if (!payload.product_id || !payload.network || !payload.merchant || !payload.affiliate_url) {
    throw new Error("Product, network, merchant, and affiliate URL are required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("affiliate_offers")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

export async function deleteOffer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("affiliate_offers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/offers");
}
