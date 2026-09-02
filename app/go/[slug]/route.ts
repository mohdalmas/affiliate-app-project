import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { recordEvent, utmParamsFrom } from "@/lib/tracking/record-event";
import { getSessionId } from "@/lib/tracking/session";

type LandingPageForRedirect = {
  id: string;
  slug: string;
  status: string;
  product: {
    id: string;
    affiliate_url: string | null;
    paid_traffic_allowed: boolean;
    status: string;
  } | null;
};

// The whole point of this app. Meta → /[slug] (the page) or straight here
// → record the click → 302 to the real affiliate link.
//
// The compliance gate is enforced HERE, in code, not just documented: this
// only ever redirects when the product is `status = 'live'` AND
// `paid_traffic_allowed = true` AND actually has an `affiliate_url` set.
// If any of those isn't true, it sends the visitor back to the info page
// instead of either 404ing (wastes the ad click) or redirecting to a link
// nobody's confirmed is allowed to receive paid traffic (see
// ARCHITECTURE.md's compliance findings).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  // maybeSingle(), not single(): a slug not matching any Live landing page
  // is an expected outcome here (typo, unpublished page), not an error —
  // see app/[slug]/page.tsx for the same fix and why.
  const { data } = await supabase
    .from("landing_pages")
    .select("id, slug, status, product:products(id, affiliate_url, paid_traffic_allowed, status)")
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  // Same Supabase-js embedded-relation typing quirk as app/[slug]/page.tsx.
  const landingPage = data as unknown as LandingPageForRedirect | null;

  const product = landingPage?.product;
  const canRedirect =
    !!product &&
    product.status === "live" &&
    product.paid_traffic_allowed &&
    !!product.affiliate_url;

  if (!canRedirect) {
    // No confirmed-compliant product yet — bounce to the info page rather
    // than send anyone to Amazon on a link nobody's actually cleared, or
    // 404 and waste the ad click entirely.
    return NextResponse.redirect(new URL(`/${slug}`, request.url));
  }

  const sessionId = await getSessionId();
  const utm = utmParamsFrom(request.nextUrl.searchParams);

  await recordEvent({
    event_type: "affiliate_click",
    session_id: sessionId,
    product_id: product.id,
    landing_page_id: landingPage!.id,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
    ...utm,
  });

  return NextResponse.redirect(product.affiliate_url!, { status: 302 });
}
