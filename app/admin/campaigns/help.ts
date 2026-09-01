export const CAMPAIGN_HELP_DESCRIPTION =
  "A campaign is what you'd actually run in Meta Ads Manager — tracking it here links it to the product/creative/audience it uses, so it can later be joined with real spend and commission numbers in Metrics.";

export const CAMPAIGN_HELP_FIELDS = [
  { name: "Name", help: "Internal label." },
  { name: "Platform / Meta campaign ID", help: "Defaults to “meta”; paste the real Meta campaign ID once it exists, so you can cross-reference it later." },
  { name: "Product / Creative / Audience", help: "What this campaign promotes, using which ad, to whom. All optional, but the more filled in, the more useful Analytics becomes later." },
  { name: "Daily budget", help: "What you plan to spend per day, in ₹." },
  { name: "Start date / End date", help: "When it runs (or ran)." },
  { name: "Status", help: "draft → active → paused → completed." },
];
