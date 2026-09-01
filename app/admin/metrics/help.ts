export const METRIC_HELP_DESCRIPTION =
  "One row is one campaign's numbers for one day. Enter these by hand — impressions/clicks/spend from Meta Ads Manager, commission from Amazon Associates' reporting — until a later stage automates the import.";

export const METRIC_HELP_FIELDS = [
  { name: "Date / Campaign", help: "Required, and together must be unique — you can only have one row per campaign per day. Edit the existing row instead of adding a duplicate." },
  { name: "Impressions / Reach", help: "From Meta Ads Manager — how many times the ad was shown, and to how many distinct people." },
  { name: "Clicks / Landing page views", help: "Clicks: from Meta. Landing page views: cross-check against this app's own event count for the same day if you want a sanity check." },
  { name: "Affiliate clicks", help: "How many times someone clicked “Get the deal” and got redirected — this should roughly match this app's own affiliate_click events." },
  { name: "Purchases", help: "From Amazon Associates' reporting — qualifying orders attributed to your links (aggregate level; there's no 1:1 click-to-order mapping, see ARCHITECTURE.md)." },
  { name: "Spend / Revenue / Commission", help: "Spend: what you paid Meta, in ₹. Commission: what Amazon paid you. Revenue is optional, for if you ever sell something yourself rather than purely earning commission." },
  { name: "Notes", help: "Anything unusual about this day worth remembering." },
];
