import { createServiceClient } from "@/lib/supabase/service";

export type SiteSettings = {
  announcement_prefix: string | null;
  announcement_highlight: string | null;
};

// Same draft copy the site originally shipped with — used only if
// migrations/0009_site_settings.sql hasn't been run yet (or its seed row
// was deleted), so the announcement bar never just goes blank.
const DEFAULTS: SiteSettings = {
  announcement_prefix: "Fresh deals, verified daily —",
  announcement_highlight: "Shop smart. Save big.",
};

// Public-facing read — no logged-in session on the homepage, so this goes
// through the service-role client like every other public page (see
// lib/supabase/service.ts).
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("site_settings")
    .select("announcement_prefix, announcement_highlight")
    .eq("id", "default")
    .maybeSingle();

  return (data as SiteSettings | null) ?? DEFAULTS;
}
