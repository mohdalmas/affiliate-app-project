import { describe, it, expect } from "vitest";
import { countEventsByProduct, buildDashboardRows } from "./dashboard-stats";

describe("countEventsByProduct", () => {
  it("counts views and clicks separately, per product", () => {
    const counts = countEventsByProduct([
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "affiliate_click" },
      { product_id: "p2", event_type: "product_view" },
    ]);

    expect(counts.get("p1")).toEqual({ views: 2, clicks: 1 });
    expect(counts.get("p2")).toEqual({ views: 1, clicks: 0 });
  });

  it("ignores events with no product_id", () => {
    const counts = countEventsByProduct([
      { product_id: null, event_type: "product_view" },
    ]);
    expect(counts.size).toBe(0);
  });
});

describe("buildDashboardRows", () => {
  const products = [
    { id: "p1", name: "Trimmer", status: "live", price: 1000, commission_percentage: 5 },
    { id: "p2", name: "Never viewed", status: "draft", price: null, commission_percentage: null },
  ];

  it("includes every product, even ones with zero events", () => {
    const rows = buildDashboardRows(products, []);
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.views === 0 && r.clicks === 0)).toBe(true);
  });

  it("click rate is null (not NaN/Infinity) when there are no views yet", () => {
    const rows = buildDashboardRows(products, [
      { product_id: "p1", event_type: "affiliate_click" },
    ]);
    const trimmer = rows.find((r) => r.id === "p1")!;
    expect(trimmer.clicks).toBe(1);
    expect(trimmer.views).toBe(0);
    expect(trimmer.clickRate).toBeNull();
  });

  it("computes a real click rate when there are views", () => {
    const rows = buildDashboardRows(products, [
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "product_view" },
      { product_id: "p1", event_type: "affiliate_click" },
    ]);
    const trimmer = rows.find((r) => r.id === "p1")!;
    expect(trimmer.clickRate).toBeCloseTo(1 / 3);
  });

  it("sorts by clicks, then views, descending", () => {
    const rows = buildDashboardRows(
      [
        { id: "a", name: "A", status: "live", price: null, commission_percentage: null },
        { id: "b", name: "B", status: "live", price: null, commission_percentage: null },
      ],
      [
        { product_id: "a", event_type: "product_view" },
        { product_id: "b", event_type: "product_view" },
        { product_id: "b", event_type: "affiliate_click" },
      ],
    );
    expect(rows.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("estimates commission as clicks × price × commission %", () => {
    const rows = buildDashboardRows(products, [
      { product_id: "p1", event_type: "affiliate_click" },
      { product_id: "p1", event_type: "affiliate_click" },
    ]);
    const trimmer = rows.find((r) => r.id === "p1")!;
    // 2 clicks × ₹1000 × 5% = ₹100
    expect(trimmer.estimatedCommission).toBeCloseTo(100);
  });

  it("estimated commission is null when price or commission % is missing", () => {
    const rows = buildDashboardRows(products, [
      { product_id: "p2", event_type: "affiliate_click" },
    ]);
    const noPrice = rows.find((r) => r.id === "p2")!;
    expect(noPrice.estimatedCommission).toBeNull();
  });
});
