export const OFFER_HELP_DESCRIPTION =
  "An offer connects a Product to a specific place someone can actually buy it. This is where the real affiliate URL goes — and where you record whether paid (Meta) traffic is actually confirmed allowed for it.";

export const OFFER_HELP_FIELDS = [
  { name: "Product", help: "Required. Which product this offer is for — add the product first if it's not in the list." },
  { name: "Network / Merchant", help: "Which affiliate program (e.g. “amazon”) and which storefront (e.g. “Amazon India”)." },
  { name: "Affiliate URL", help: "The real tracked link. Use https://example.com as a placeholder until Stage 17 — see ARCHITECTURE.md." },
  { name: "Commission % / fixed", help: "What you earn per sale, from the affiliate program's terms — fill in whichever applies." },
  { name: "Currency", help: "Defaults to INR." },
  { name: "Paid traffic allowed", help: "Leave this OFF until you've actually confirmed, in writing from Amazon Associates support, that Meta ads are allowed for this specific offer. This is the real safety switch — see ARCHITECTURE.md's compliance findings." },
  { name: "Status", help: "active / paused / expired." },
  { name: "Notes", help: "Anything else worth remembering about this offer." },
];
