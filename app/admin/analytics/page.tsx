import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState } from "@/components/admin/list-ui";
import {
  totalsByCampaign,
  groupTotals,
  countEventsByProduct,
  type GroupedTotal,
  type CampaignForAnalytics,
} from "@/lib/admin/analytics";

function money(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}₹${value.toFixed(2)}`;
}

function GroupedTable({ title, rows }: { title: string; rows: GroupedTotal[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Spend</th>
                <th className="p-3 font-medium">Commission</th>
                <th className="p-3 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t">
                  <td className="p-3">{row.label}</td>
                  <td className="p-3 text-muted-foreground">₹{row.spend.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">₹{row.commission.toFixed(2)}</td>
                  <td className={`p-3 font-medium ${row.profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {money(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [{ data: campaigns, error: campaignsError }, { data: metrics, error: metricsError }, { data: events, error: eventsError }, { data: products }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select("id, name, product_id, creative_id, audience_id, product:products(name), creative:creatives(name), audience:audiences(name)"),
      supabase
        .from("daily_metrics")
        .select("campaign_id, spend, commission, affiliate_clicks, purchases"),
      supabase.from("events").select("product_id, event_type"),
      supabase.from("products").select("id, name"),
    ]);

  const error = campaignsError ?? metricsError ?? eventsError;
  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load analytics: {error.message}
      </p>
    );
  }

  // Supabase-js infers embedded to-one relations (product/creative/audience
  // here) as arrays without generated DB types — each is actually a single
  // object or null, guaranteed by the *_id columns being plain foreign keys.
  const campaignRows = (campaigns ?? []) as unknown as CampaignForAnalytics[];
  const campaignTotals = totalsByCampaign(campaignRows, metrics ?? []);
  const hasAnyMetrics = (metrics ?? []).length > 0;

  const byProduct = groupTotals(
    campaignTotals,
    (c) => c.product_id,
    (c) => c.product?.name ?? null,
  );
  const byCreative = groupTotals(
    campaignTotals,
    (c) => c.creative_id,
    (c) => c.creative?.name ?? null,
  );
  const byAudience = groupTotals(
    campaignTotals,
    (c) => c.audience_id,
    (c) => c.audience?.name ?? null,
  );

  const eventCounts = countEventsByProduct(events ?? []);
  const productNameById = new Map((products ?? []).map((p) => [p.id, p.name]));
  const funnelRows = [...eventCounts.entries()].map(([productId, counts]) => ({
    productId,
    name: productNameById.get(productId) ?? "Unknown product",
    views: (counts.product_view ?? 0) + (counts.landing_view ?? 0),
    clicks: counts.affiliate_click ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Analytics"
        description="Profit per product/creative/audience, rolled up from Metrics (spend/commission) joined through Campaigns — plus a simple view→click funnel from the events this app records itself."
        addHref="/admin/metrics/new"
        addLabel="Add metrics row"
      />

      {!hasAnyMetrics ? (
        <EmptyState message="No metrics entered yet — add rows in Metrics to see profit broken down here." />
      ) : (
        <div className="flex flex-col gap-8">
          <GroupedTable title="Profit by product" rows={byProduct} />
          <GroupedTable title="Profit by creative" rows={byCreative} />
          <GroupedTable title="Profit by audience" rows={byAudience} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">View → click funnel by product</h2>
        <p className="text-sm text-muted-foreground -mt-2">
          From this app&apos;s own event data (Stage 11/12) — page views and
          affiliate-link clicks, independent of the manually entered
          Metrics above.
        </p>
        {funnelRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No page views recorded yet — this fills in once a landing page
            is published and gets real visits.
          </p>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Views</th>
                  <th className="p-3 font-medium">Affiliate clicks</th>
                  <th className="p-3 font-medium">Click rate</th>
                </tr>
              </thead>
              <tbody>
                {funnelRows.map((row) => (
                  <tr key={row.productId} className="border-t">
                    <td className="p-3">{row.name}</td>
                    <td className="p-3 text-muted-foreground">{row.views}</td>
                    <td className="p-3 text-muted-foreground">{row.clicks}</td>
                    <td className="p-3 text-muted-foreground">
                      {row.views > 0 ? `${((row.clicks / row.views) * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
