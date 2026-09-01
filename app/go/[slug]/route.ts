import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { recordEvent, utmParamsFrom } from "@/lib/tracking/record-event";
import { getSessionId } from "@/lib/tracking/session";

// The whole point of this app. Meta → /[slug] (the page) or straight here
// → record the click → 302 to the real Amazon Special Link.
//
// The compliance gate is enforced HERE, in code, not just documented: this
// only ever redirects to an offer that is both `status = 'active'` AND
// `paid_traffic_allowed = true`. If neither exists, it sends the visitor
// back to the info page instead of either 404ing (wastes the ad click) or
// picking some other, unconfirmed offer (see ARCHITECTURE.md's compliance
// findings — never send paid Meta traffic to an offer you haven't
// confirmed allows it).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: landingPage } = await supabase
    .from("landing_pages")
    .select("id, product_id, status")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!landingPage?.product_id) {
    return NextResponse.redirect(new URL(`/${slug}`, request.url));
  }

  const { data: offer } = await supabase
    .from("affiliate_offers")
    .select("id, affiliate_url")
    .eq("product_id", landingPage.product_id)
    .eq("status", "active")
    .eq("paid_traffic_allowed", true)
    .order("commission_percent", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!offer) {
    // No confirmed-compliant offer yet — bounce to the info page rather
    // than send anyone to Amazon on an offer nobody's actually cleared.
    return NextResponse.redirect(new URL(`/${slug}`, request.url));
  }

  const sessionId = await getSessionId();
  const utm = utmParamsFrom(request.nextUrl.searchParams);

  await recordEvent({
    event_type: "affiliate_click",
    session_id: sessionId,
    product_id: landingPage.product_id,
    landing_page_id: landingPage.id,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
    ...utm,
  });

  return NextResponse.redirect(offer.affiliate_url, { status: 302 });
}
