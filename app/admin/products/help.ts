export const PRODUCT_HELP_DESCRIPTION =
  "A product is one thing you're promoting — its affiliate link and the compliance flag live directly here, no separate Offer to manage.";

export const PRODUCT_HELP_FIELDS = [
  { name: "Name", help: "Required. What you'd call it, e.g. “Philips Beard Trimmer”." },
  { name: "Brand / Category", help: "Optional, just for your own reference." },
  { name: "Price / Currency", help: "What it actually sells for — defaults to INR." },
  { name: "MRP (original price)", help: "Optional. The \"was\" price a discount is measured against — set higher than Price to show a struck-through MRP and a \"-X% OFF\" badge on the deal card and product page. Leave blank (or ≤ Price) to show no discount badge." },
  { name: "Rating (0–5)", help: "Optional. Shows as filled stars (partial fill for e.g. 4.3). Leave blank to show no stars at all — don't guess a number just to fill it in." },
  { name: "Review count", help: "Optional. Shown in parentheses next to the stars, e.g. \"(1,250)\". Only shown if Rating is also set." },
  { name: "Image URL", help: "Optional link to a product photo, shown on its public page." },
  { name: "Affiliate URL", help: "The real tracked link. Use https://example.com as a placeholder until Stage 17 in ARCHITECTURE.md is fully closed out." },
  { name: "Paid traffic allowed", help: "Leave this OFF until you've actually confirmed, in writing from Amazon Associates support, that Meta ads are allowed for this product. This is the real safety switch — see ARCHITECTURE.md's compliance findings. /go/[slug] will refuse to redirect while this is off." },
  { name: "Status", help: "Draft: hidden everywhere. Live: shows up on the homepage and any Landing page pointing at it. Archived: hidden again, without deleting it." },
  { name: "Commission %", help: "Your own estimate of the payout rate for this product (e.g. 4 for 4%). Amazon doesn't expose real per-sale commission via API, so this only powers the Dashboard's estimated-commission numbers — never treat it as confirmed earnings." },
  { name: "Commission notes", help: "Optional — anything worth remembering about the rate, e.g. “Amazon Associates, Home & Kitchen category” or “rate drops to 1% after ₹50k/month”." },
];
