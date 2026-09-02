// Pure aggregation for the Dashboard — counts views/clicks per product
// straight from the events table. No manual data entry, nothing to
// configure; kept separate from the page so the actual math is easy to
// read and easy to unit test.

export type EventForStats = {
  product_id: string | null;
  event_type: "product_view" | "affiliate_click";
};

export type ProductCounts = { views: number; clicks: number };

export function countEventsByProduct(
  events: EventForStats[],
): Map<string, ProductCounts> {
  const counts = new Map<string, ProductCounts>();

  for (const event of events) {
    if (!event.product_id) continue;
    const acc = counts.get(event.product_id) ?? { views: 0, clicks: 0 };
    if (event.event_type === "product_view") acc.views += 1;
    else if (event.event_type === "affiliate_click") acc.clicks += 1;
    counts.set(event.product_id, acc);
  }

  return counts;
}

export type ProductRow = { id: string; name: string; status: string };

export type DashboardRow = ProductRow & {
  views: number;
  clicks: number;
  clickRate: number | null; // null when there are no views yet — avoids a 0/0 = NaN
};

export function buildDashboardRows(
  products: ProductRow[],
  events: EventForStats[],
): DashboardRow[] {
  const counts = countEventsByProduct(events);

  return products
    .map((product) => {
      const { views, clicks } = counts.get(product.id) ?? { views: 0, clicks: 0 };
      return {
        ...product,
        views,
        clicks,
        clickRate: views > 0 ? clicks / views : null,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.views - a.views);
}
