"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { str } from "@/lib/admin/form-data";
import { redirectWithToast } from "@/lib/admin/toast-redirect";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "default",
    announcement_prefix: str(formData, "announcement_prefix"),
    announcement_highlight: str(formData, "announcement_highlight"),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirectWithToast("/admin/settings", "Settings saved");
}
