"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num } from "@/lib/admin/form-data";

function campaignPayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    platform: str(formData, "platform") ?? "meta",
    external_campaign_id: str(formData, "external_campaign_id"),
    product_id: str(formData, "product_id"),
    creative_id: str(formData, "creative_id"),
    audience_id: str(formData, "audience_id"),
    daily_budget: num(formData, "daily_budget"),
    start_date: str(formData, "start_date"),
    end_date: str(formData, "end_date"),
    status: str(formData, "status") ?? "draft",
  };
}

export async function createCampaign(formData: FormData) {
  const payload = campaignPayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}

export async function updateCampaign(id: string, formData: FormData) {
  const payload = campaignPayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("campaigns")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/campaigns");
}
