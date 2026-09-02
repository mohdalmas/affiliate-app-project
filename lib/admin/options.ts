// "Give me a dropdown list" helper for relation selects — Landing pages
// need to pick a product. A plain server-side data fetcher, called
// directly from Server Component pages — not a Server Action, so no
// "use server" here.
import { createClient } from "@/lib/supabase/server";

export type Option = { value: string; label: string };

export async function getProductOptions(): Promise<Option[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name")
    .order("name");

  return (data ?? []).map((p) => ({ value: p.id, label: p.name }));
}

// Home sections pick landing pages, not products directly — the label
// spells out status so it's obvious in the dropdown that adding a Draft
// page won't actually show up publicly until it (and its product) go Live.
export async function getLandingPageOptions(): Promise<Option[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("id, name, slug, status")
    .order("name");

  return (data ?? []).map((lp) => ({
    value: lp.id,
    label: lp.status === "live" ? `${lp.name} (/${lp.slug})` : `${lp.name} (/${lp.slug}) — ${lp.status}`,
  }));
}

// Distinct product categories, for a home section's "auto-pull this whole
// category" option. Supabase-js has no SELECT DISTINCT — products is small
// enough (admin-curated) to just fetch and dedupe in JS.
export async function getCategoryOptions(): Promise<Option[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .order("category");

  const categories = Array.from(new Set((data ?? []).map((p) => p.category as string)));
  return categories.map((category) => ({ value: category, label: category }));
}
