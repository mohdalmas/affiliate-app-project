export const PRODUCT_HELP_DESCRIPTION =
  "A product is one thing you're promoting — its affiliate link and the compliance flag live directly here, no separate Offer to manage.";

export const PRODUCT_HELP_FIELDS = [
  { name: "Name", help: "Required. What you'd call it, e.g. “Philips Beard Trimmer”." },
  { name: "Brand / Category", help: "Optional, just for your own reference." },
  { name: "Price / Currency", help: "What it sells for — defaults to INR." },
  { name: "Image URL", help: "Optional link to a product photo, shown on its public page." },
  { name: "Affiliate URL", help: "The real tracked link. Use https://example.com as a placeholder until Stage 17 in ARCHITECTURE.md is fully closed out." },
  { name: "Paid traffic allowed", help: "Leave this OFF until you've actually confirmed, in writing from Amazon Associates support, that Meta ads are allowed for this product. This is the real safety switch — see ARCHITECTURE.md's compliance findings. /go/[slug] will refuse to redirect while this is off." },
  { name: "Status", help: "Draft: hidden everywhere. Live: shows up on the homepage and any Landing page pointing at it. Archived: hidden again, without deleting it." },
];
