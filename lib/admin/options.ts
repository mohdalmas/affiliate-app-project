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
