"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { str, num } from "@/lib/admin/form-data";

function metricPayload(formData: FormData) {
  return {
    date: str(formData, "date"),
    campaign_id: str(formData, "campaign_id"),
    impressions: num(formData, "impressions") ?? 0,
    reach: num(formData, "reach") ?? 0,
    clicks: num(formData, "clicks") ?? 0,
    landing_page_views: num(formData, "landing_page_views") ?? 0,
    affiliate_clicks: num(formData, "affiliate_clicks") ?? 0,
    purchases: num(formData, "purchases") ?? 0,
    spend: num(formData, "spend") ?? 0,
    revenue: num(formData, "revenue") ?? 0,
    commission: num(formData, "commission") ?? 0,
    notes: str(formData, "notes"),
  };
}

// (date, campaign_id) is unique — hitting that is a beginner-friendly
// mistake ("I already entered today's numbers for this campaign"), not a
// bug, so turn it into a clear message instead of a raw Postgres error.
function friendlyError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") {
    return new Error(
      "There's already a metrics row for this campaign on this date — edit that one instead of adding another.",
    );
  }
  return new Error(error.message);
}

export async function createDailyMetric(formData: FormData) {
  const payload = metricPayload(formData);
  if (!payload.date || !payload.campaign_id) {
    throw new Error("Date and campaign are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("daily_metrics").insert(payload);
  if (error) throw friendlyError(error);

  revalidatePath("/admin/metrics");
  revalidatePath("/admin/analytics");
  redirect("/admin/metrics");
}

export async function updateDailyMetric(id: string, formData: FormData) {
  const payload = metricPayload(formData);
  if (!payload.date || !payload.campaign_id) {
    throw new Error("Date and campaign are required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_metrics")
    .update(payload)
    .eq("id", id);
  if (error) throw friendlyError(error);

  revalidatePath("/admin/metrics");
  revalidatePath("/admin/analytics");
  redirect("/admin/metrics");
}

export async function deleteDailyMetric(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_metrics").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/metrics");
  revalidatePath("/admin/analytics");
}
