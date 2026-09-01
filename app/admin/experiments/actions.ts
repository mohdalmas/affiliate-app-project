"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/admin/form-data";

function experimentPayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    hypothesis: str(formData, "hypothesis"),
    primary_metric: str(formData, "primary_metric"),
    secondary_metrics: str(formData, "secondary_metrics"),
    control_description: str(formData, "control_description"),
    variant_description: str(formData, "variant_description"),
    product_id: str(formData, "product_id"),
    audience_id: str(formData, "audience_id"),
    status: str(formData, "status") ?? "planned",
    result: str(formData, "result"),
    conclusion: str(formData, "conclusion"),
  };
}

export async function createExperiment(formData: FormData) {
  const payload = experimentPayload(formData);
  if (!payload.name || !payload.hypothesis) {
    throw new Error("Name and hypothesis are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("experiments").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/experiments");
  redirect("/admin/experiments");
}

export async function updateExperiment(id: string, formData: FormData) {
  const payload = experimentPayload(formData);
  if (!payload.name || !payload.hypothesis) {
    throw new Error("Name and hypothesis are required");
  }

  const supabase = await createClient();

  // If this save is what marks it completed, stamp completed_at once —
  // don't overwrite it on every later edit.
  const updates: Record<string, unknown> = { ...payload };
  if (payload.status === "completed") {
    const { data: existing } = await supabase
      .from("experiments")
      .select("completed_at")
      .eq("id", id)
      .single();
    if (!existing?.completed_at) {
      updates.completed_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("experiments")
    .update(updates)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/experiments");
  redirect("/admin/experiments");
}

export async function deleteExperiment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("experiments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/experiments");
}
