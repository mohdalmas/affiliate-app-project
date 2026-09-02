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

export type ProductRow = {
  id: string;
  name: string;
  status: string;
  price: number | null;
  commission_percentage: number | null;
};

export type DashboardRow = ProductRow & {
  views: number;
  clicks: number;
  clickRate: number | null; // null when there are no views yet — avoids a 0/0 = NaN
  // A rough, best-case estimate only — assumes every recorded click turns
  // into a sale at the product's price, which is never actually true. Real
  // Amazon Associates commission isn't available via API, so this is just
  // "clicks × price × your commission %", purely to make the admin-entered
  // rate visible somewhere useful. null when price or commission % is unset.
  estimatedCommission: number | null;
};

export function buildDashboardRows(
  products: ProductRow[],
  events: EventForStats[],
): DashboardRow[] {
  const counts = countEventsByProduct(events);

  return products
    .map((product) => {
      const { views, clicks } = counts.get(product.id) ?? { views: 0, clicks: 0 };
      const estimatedCommission =
        product.price != null && product.commission_percentage != null
          ? clicks * product.price * (product.commission_percentage / 100)
          : null;
      return {
        ...product,
        views,
        clicks,
        clickRate: views > 0 ? clicks / views : null,
        estimatedCommission,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.views - a.views);
}
