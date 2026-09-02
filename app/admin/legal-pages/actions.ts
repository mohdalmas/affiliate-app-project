"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/admin/form-data";
import { redirectWithToast } from "@/lib/admin/toast-redirect";
import type { LegalPageSlug } from "@/lib/legal-pages";

export async function updateLegalPage(slug: LegalPageSlug, formData: FormData) {
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!title || !body) throw new Error("Title and body are required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("legal_pages")
    .upsert({ slug, title, body, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}`);
  revalidatePath("/admin/legal-pages");
  redirectWithToast("/admin/legal-pages", "Saved");
}
