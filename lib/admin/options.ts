// Shared "give me a dropdown list" helpers for relation selects
// (Offers/Creatives/Campaigns/Experiments all need to pick a product;
// Campaigns/Experiments also need an audience; Campaigns needs a creative).
// Plain server-side data fetchers, called directly from Server Component
// pages — not Server Actions, so no "use server" here.
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

export async function getAudienceOptions(): Promise<Option[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audiences")
    .select("id, name")
    .order("name");

  return (data ?? []).map((a) => ({ value: a.id, label: a.name }));
}

export async function getCreativeOptions(): Promise<Option[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creatives")
    .select("id, name")
    .order("name");

  return (data ?? []).map((c) => ({ value: c.id, label: c.name }));
}

export async function getCampaignOptions(): Promise<Option[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("name");

  return (data ?? []).map((c) => ({ value: c.id, label: c.name }));
}
