"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/admin/form-data";
import { redirectWithToast } from "@/lib/admin/toast-redirect";

function landingPagePayload(formData: FormData) {
  return {
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    product_id: str(formData, "product_id"),
    status: str(formData, "status") ?? "draft",
  };
}

// A duplicate slug hits Postgres's unique constraint (code 23505) — turn
// that into something a beginner can actually act on instead of a raw
// Postgres error message.
function friendlyError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") {
    return new Error(
      "That slug is already used by another landing page — pick a different one.",
    );
  }
  return new Error(error.message);
}

export async function createLandingPage(formData: FormData) {
  const payload = landingPagePayload(formData);
  if (!payload.name || !payload.slug || !payload.product_id) {
    throw new Error("Name, slug, and product are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("landing_pages").insert(payload);
  if (error) throw friendlyError(error);

  revalidatePath("/admin", "layout");
  redirectWithToast("/admin/landing-pages", "Landing page created");
}

export async function updateLandingPage(id: string, formData: FormData) {
  const payload = landingPagePayload(formData);
  if (!payload.name || !payload.slug || !payload.product_id) {
    throw new Error("Name, slug, and product are required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("landing_pages")
    .update(payload)
    .eq("id", id);
  if (error) throw friendlyError(error);

  revalidatePath("/admin", "layout");
  redirectWithToast("/admin/landing-pages", "Landing page saved");
}

export async function deleteLandingPage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("landing_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

// Bulk create/update via CSV — see lib/admin/combined-import-action.ts
// (shared with Products, since one CSV covers both entities together).
