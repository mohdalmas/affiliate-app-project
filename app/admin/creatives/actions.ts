"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/admin/form-data";

function creativePayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    product_id: str(formData, "product_id"),
    platform: str(formData, "platform") ?? "meta",
    format: str(formData, "format"),
    hook: str(formData, "hook"),
    angle: str(formData, "angle"),
    call_to_action: str(formData, "call_to_action"),
    media_url: str(formData, "media_url"),
    status: str(formData, "status") ?? "draft",
  };
}

export async function createCreative(formData: FormData) {
  const payload = creativePayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("creatives").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/creatives");
  redirect("/admin/creatives");
}

export async function updateCreative(id: string, formData: FormData) {
  const payload = creativePayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("creatives")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/creatives");
  redirect("/admin/creatives");
}

export async function deleteCreative(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("creatives").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/creatives");
}
