"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num } from "@/lib/admin/form-data";

function audiencePayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    gender: str(formData, "gender"),
    age_min: num(formData, "age_min"),
    age_max: num(formData, "age_max"),
    location: str(formData, "location"),
    interests: str(formData, "interests"),
    hypothesis: str(formData, "hypothesis"),
    status: str(formData, "status") ?? "active",
  };
}

export async function createAudience(formData: FormData) {
  const payload = audiencePayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("audiences").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/audiences");
  redirect("/admin/audiences");
}

export async function updateAudience(id: string, formData: FormData) {
  const payload = audiencePayload(formData);
  if (!payload.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("audiences")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/audiences");
  redirect("/admin/audiences");
}

export async function deleteAudience(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("audiences").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/audiences");
}
