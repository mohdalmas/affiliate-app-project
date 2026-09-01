import { describe, it, expect } from "vitest";
import {
  totalsByCampaign,
  groupTotals,
  countEventsByProduct,
  type CampaignForAnalytics,
  type MetricForAnalytics,
} from "./analytics";

function campaign(overrides: Partial<CampaignForAnalytics>): CampaignForAnalytics {
  return {
    id: "camp-1",
    name: "Campaign",
    product_id: null,
    creative_id: null,
    audience_id: null,
    product: null,
    creative: null,
    audience: null,
    ...overrides,
  };
}

describe("totalsByCampaign", () => {
  it("sums multiple metric rows for the same campaign", () => {
    const campaigns = [campaign({ id: "camp-1" })];
    const metrics: MetricForAnalytics[] = [
      { campaign_id: "camp-1", spend: 100, commission: 40, affiliate_clicks: 5, purchases: 1 },
      { campaign_id: "camp-1", spend: 50, commission: 20, affiliate_clicks: 3, purchases: 0 },
    ];

    const [result] = totalsByCampaign(campaigns, metrics);

    expect(result.spend).toBe(150);
    expect(result.commission).toBe(60);
    expect(result.affiliateClicks).toBe(8);
    expect(result.purchases).toBe(1);
  });

  it("profit is commission minus spend, and can go negative", () => {
    const campaigns = [campaign({ id: "camp-1" })];
    const metrics: MetricForAnalytics[] = [
      { campaign_id: "camp-1", spend: 100, commission: 40, affiliate_clicks: 0, purchases: 0 },
    ];

    const [result] = totalsByCampaign(campaigns, metrics);
    expect(result.profit).toBe(-60);
  });

  it("defaults a campaign with no matching metrics to all zeros, not undefined/NaN", () => {
    const campaigns = [campaign({ id: "camp-no-data" })];
    const [result] = totalsByCampaign(campaigns, []);

    expect(result).toMatchObject({ spend: 0, commission: 0, profit: 0, affiliateClicks: 0, purchases: 0 });
  });

  it("ignores metrics for a campaign that no longer exists in the campaigns list", () => {
    const campaigns = [campaign({ id: "camp-1" })];
    const metrics: MetricForAnalytics[] = [
      { campaign_id: "some-other-campaign", spend: 999, commission: 999, affiliate_clicks: 0, purchases: 0 },
    ];

    const [result] = totalsByCampaign(campaigns, metrics);
    expect(result.spend).toBe(0);
  });

  it("treats a null spend/commission on a metric row as 0, not NaN", () => {
    const campaigns = [campaign({ id: "camp-1" })];
    const metrics: MetricForAnalytics[] = [
      { campaign_id: "camp-1", spend: null, commission: null, affiliate_clicks: null, purchases: null },
    ];

    const [result] = totalsByCampaign(campaigns, metrics);
    expect(result).toMatchObject({ spend: 0, commission: 0, profit: 0 });
  });
});

describe("groupTotals", () => {
  it("groups campaigns sharing a key and sums their totals", () => {
    const campaigns = totalsByCampaign(
      [
        campaign({ id: "a", product_id: "prod-1", product: { name: "Trimmer" } }),
        campaign({ id: "b", product_id: "prod-1", product: { name: "Trimmer" } }),
      ],
      [
        { campaign_id: "a", spend: 100, commission: 50, affiliate_clicks: 0, purchases: 0 },
        { campaign_id: "b", spend: 20, commission: 10, affiliate_clicks: 0, purchases: 0 },
      ],
    );

    const [result] = groupTotals(
      campaigns,
      (c) => c.product_id,
      (c) => c.product?.name ?? null,
    );

    expect(result).toMatchObject({ label: "Trimmer", spend: 120, commission: 60, profit: -60 });
  });

  it("buckets campaigns with no key into a single '— unassigned —' group instead of dropping them", () => {
    const campaigns = totalsByCampaign(
      [campaign({ id: "a", product_id: null }), campaign({ id: "b", product_id: null })],
      [
        { campaign_id: "a", spend: 10, commission: 0, affiliate_clicks: 0, purchases: 0 },
        { campaign_id: "b", spend: 5, commission: 0, affiliate_clicks: 0, purchases: 0 },
      ],
    );

    const result = groupTotals(campaigns, (c) => c.product_id, () => null);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ label: "— unassigned —", spend: 15 });
  });

  it("sorts by profit descending, most profitable first", () => {
    const campaigns = totalsByCampaign(
      [
        campaign({ id: "loser", product_id: "p1", product: { name: "Loser" } }),
        campaign({ id: "winner", product_id: "p2", product: { name: "Winner" } }),
      ],
      [
        { campaign_id: "loser", spend: 100, commission: 10, affiliate_clicks: 0, purchases: 0 },
        { campaign_id: "winner", spend: 10, commission: 100, affiliate_clicks: 0, purchases: 0 },
      ],
    );

    const result = groupTotals(campaigns, (c) => c.product_id, (c) => c.product?.name ?? null);

    expect(result.map((r) => r.label)).toEqual(["Winner", "Loser"]);
  });
});

describe("countEventsByProduct", () => {
  it("counts events per product, per event type", () => {
    const counts = countEventsByProduct([
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "affiliate_click" },
      { product_id: "p2", event_type: "product_view" },
    ]);

    expect(counts.get("p1")).toEqual({ product_view: 2, affiliate_click: 1 });
    expect(counts.get("p2")).toEqual({ product_view: 1 });
  });

  it("excludes events with no product_id (e.g. a collection-page view)", () => {
    const counts = countEventsByProduct([
      { product_id: null, event_type: "landing_view" },
    ]);

    expect(counts.size).toBe(0);
  });
});
