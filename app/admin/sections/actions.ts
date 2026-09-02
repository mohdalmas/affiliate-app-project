"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num } from "@/lib/admin/form-data";
import { redirectWithToast } from "@/lib/admin/toast-redirect";

function sectionPayload(formData: FormData) {
  return {
    title: str(formData, "title"),
    subtitle: str(formData, "subtitle"),
    category: str(formData, "category"),
    position: num(formData, "position") ?? 0,
    status: str(formData, "status") ?? "draft",
  };
}

export async function createSection(formData: FormData) {
  const payload = sectionPayload(formData);
  if (!payload.title) throw new Error("Title is required");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_sections")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/sections");
  // Not redirectWithToast: the destination itself doesn't exist yet at
  // call time (its id just got created above), and this file's own
  // toastless `redirect` import is only for this one case.
  redirect(`/admin/sections/${data.id}/edit?toast=${encodeURIComponent("Section created")}`);
}

export async function updateSection(id: string, formData: FormData) {
  const payload = sectionPayload(formData);
  if (!payload.title) throw new Error("Title is required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("home_sections")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/sections");
  redirectWithToast(`/admin/sections/${id}/edit`, "Section saved");
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/sections");
}

// A duplicate (section, landing page) pair, or two items in the same
// section sharing a position, both hit a unique constraint (23505) — tell
// the admin which one, instead of a raw Postgres error.
function friendlyItemError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") {
    if (error.message.includes("position")) {
      return new Error(
        "Another item in this section already uses that position — pick a different number.",
      );
    }
    return new Error("That landing page is already in this section.");
  }
  return new Error(error.message);
}

export async function addSectionItem(sectionId: string, formData: FormData) {
  const landing_page_id = str(formData, "landing_page_id");
  if (!landing_page_id) throw new Error("Pick a landing page to add");

  const supabase = await createClient();
  const { error } = await supabase.from("home_section_items").insert({
    section_id: sectionId,
    landing_page_id,
    position: num(formData, "position") ?? 0,
  });
  if (error) throw friendlyItemError(error);

  revalidatePath("/", "layout");
  revalidatePath(`/admin/sections/${sectionId}/edit`);
  redirectWithToast(`/admin/sections/${sectionId}/edit`, "Added to section");
}

export async function updateSectionItemPosition(
  itemId: string,
  sectionId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_section_items")
    .update({ position: num(formData, "position") ?? 0 })
    .eq("id", itemId);
  if (error) throw friendlyItemError(error);

  revalidatePath("/", "layout");
  revalidatePath(`/admin/sections/${sectionId}/edit`);
  redirectWithToast(`/admin/sections/${sectionId}/edit`, "Position updated");
}

export async function removeSectionItem(itemId: string, sectionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_section_items")
    .delete()
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath(`/admin/sections/${sectionId}/edit`);
}
