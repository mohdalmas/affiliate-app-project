import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type EventType =
  | "landing_view"
  | "product_view"
  | "affiliate_click"
  | "redirect";

export type RecordEventInput = {
  event_type: EventType;
  session_id?: string | null;
  product_id?: string | null;
  campaign_id?: string | null;
  creative_id?: string | null;
  audience_id?: string | null;
  landing_page_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
};

// Fire-and-forget by design: a tracking failure (a bad env var, a Supabase
// hiccup) should never take down a real visitor's page load or their
// redirect to Amazon. Logs to the server console instead of throwing.
export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("events").insert(input);
    if (error) {
      console.error("recordEvent failed:", error.message);
    }
  } catch (err) {
    console.error("recordEvent threw:", err);
  }
}

// Pulls the standard UTM params (plus our own campaign/creative/audience
// ids, for when an ad URL includes them directly) off any URL's search
// params — used by both the public page views and the /go/[slug] redirect
// so a Meta ad URL like
// yourdomain.com/trimmer-a?utm_source=meta&campaign_id=<uuid>
// gets captured the same way in both places.
export function utmParamsFrom(searchParams: URLSearchParams) {
  return {
    utm_source: searchParams.get("utm_source"),
    utm_medium: searchParams.get("utm_medium"),
    utm_campaign: searchParams.get("utm_campaign"),
    utm_content: searchParams.get("utm_content"),
    utm_term: searchParams.get("utm_term"),
    campaign_id: searchParams.get("campaign_id"),
    creative_id: searchParams.get("creative_id"),
    audience_id: searchParams.get("audience_id"),
  };
}
