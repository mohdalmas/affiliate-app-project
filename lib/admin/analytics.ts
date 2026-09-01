// Pure aggregation helpers for /admin/analytics — kept separate from
// the page so the actual math (sum this, group by that) is easy to read
// without wading through JSX and Supabase calls.

export type CampaignForAnalytics = {
  id: string;
  name: string;
  product_id: string | null;
  creative_id: string | null;
  audience_id: string | null;
  product: { name: string } | null;
  creative: { name: string } | null;
  audience: { name: string } | null;
};

export type MetricForAnalytics = {
  campaign_id: string;
  spend: number | null;
  commission: number | null;
  affiliate_clicks: number | null;
  purchases: number | null;
};

export type CampaignTotals = CampaignForAnalytics & {
  spend: number;
  commission: number;
  affiliateClicks: number;
  purchases: number;
  profit: number;
};

export function totalsByCampaign(
  campaigns: CampaignForAnalytics[],
  metrics: MetricForAnalytics[],
): CampaignTotals[] {
  const totals = new Map<
    string,
    { spend: number; commission: number; affiliateClicks: number; purchases: number }
  >();

  for (const metric of metrics) {
    const acc = totals.get(metric.campaign_id) ?? {
      spend: 0,
      commission: 0,
      affiliateClicks: 0,
      purchases: 0,
    };
    acc.spend += Number(metric.spend ?? 0);
    acc.commission += Number(metric.commission ?? 0);
    acc.affiliateClicks += Number(metric.affiliate_clicks ?? 0);
    acc.purchases += Number(metric.purchases ?? 0);
    totals.set(metric.campaign_id, acc);
  }

  return campaigns.map((campaign) => {
    const acc = totals.get(campaign.id) ?? {
      spend: 0,
      commission: 0,
      affiliateClicks: 0,
      purchases: 0,
    };
    return { ...campaign, ...acc, profit: acc.commission - acc.spend };
  });
}

export type GroupedTotal = {
  label: string;
  spend: number;
  commission: number;
  profit: number;
};

// Rolls campaign-level totals up by whatever key you pick (product,
// creative, or audience) — campaigns with no value for that key land in
// a single "— unassigned —" bucket rather than being dropped.
export function groupTotals(
  campaigns: CampaignTotals[],
  keyOf: (c: CampaignTotals) => string | null,
  labelOf: (c: CampaignTotals) => string | null,
): GroupedTotal[] {
  const groups = new Map<string, GroupedTotal>();

  for (const campaign of campaigns) {
    const key = keyOf(campaign) ?? "__unassigned";
    const label = labelOf(campaign) ?? "— unassigned —";
    const acc = groups.get(key) ?? { label, spend: 0, commission: 0, profit: 0 };
    acc.spend += campaign.spend;
    acc.commission += campaign.commission;
    acc.profit += campaign.profit;
    groups.set(key, acc);
  }

  return [...groups.values()].sort((a, b) => b.profit - a.profit);
}

// event_type -> count, per product_id — used for the simple view/click
// funnel table. Events with no product_id (a collection-page view, say)
// are excluded since there's nothing to attribute them to.
export function countEventsByProduct(
  events: { product_id: string | null; event_type: string }[],
): Map<string, Record<string, number>> {
  const counts = new Map<string, Record<string, number>>();
  for (const event of events) {
    if (!event.product_id) continue;
    const forProduct = counts.get(event.product_id) ?? {};
    forProduct[event.event_type] = (forProduct[event.event_type] ?? 0) + 1;
    counts.set(event.product_id, forProduct);
  }
  return counts;
}
