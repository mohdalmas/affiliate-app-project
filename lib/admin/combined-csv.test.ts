import { describe, it, expect } from "vitest";
import { parseCombinedRow } from "./combined-csv";

const HEADER = [
  "product_id",
  "product_name",
  "product_brand",
  "product_category",
  "product_price",
  "product_currency",
  "product_mrp",
  "product_rating",
  "product_review_count",
  "product_image_url",
  "product_affiliate_url",
  "product_paid_traffic_allowed",
  "product_status",
  "product_commission_percentage",
  "product_commission_notes",
  "landing_page_id",
  "landing_page_name",
  "landing_page_slug",
  "landing_page_status",
];

function row(overrides: Record<string, string>): string[] {
  const values = Object.fromEntries(HEADER.map((h) => [h, ""]));
  Object.assign(values, overrides);
  return HEADER.map((h) => values[h]);
}

describe("parseCombinedRow", () => {
  it("fails without a product_name", () => {
    const result = parseCombinedRow(HEADER, row({}));
    expect(result).toEqual({ ok: false, error: "product_name is required" });
  });

  it("a blank landing_page_slug means product-only — no landing page for this row", () => {
    const result = parseCombinedRow(HEADER, row({ product_name: "Trimmer" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.name).toBe("Trimmer");
      expect(result.landingPage).toBeNull();
    }
  });

  it("a non-blank slug produces a landing page, defaulting its name to the product's", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", landing_page_slug: "trimmer-a" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.landingPage).toEqual({
        id: null,
        name: "Trimmer",
        slug: "trimmer-a",
        status: "draft",
      });
    }
  });

  it("passes through explicit ids for updating existing rows", () => {
    const result = parseCombinedRow(
      HEADER,
      row({
        product_id: "prod-1",
        product_name: "Trimmer",
        landing_page_id: "lp-1",
        landing_page_slug: "trimmer-a",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.id).toBe("prod-1");
      expect(result.landingPage?.id).toBe("lp-1");
    }
  });

  it("rejects an invalid product_status", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", product_status: "banana" }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'product_status must be one of draft/live/archived, got "banana"',
    });
  });

  it("rejects an invalid landing_page_status", () => {
    const result = parseCombinedRow(
      HEADER,
      row({
        product_name: "Trimmer",
        landing_page_slug: "trimmer-a",
        landing_page_status: "banana",
      }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'landing_page_status must be one of draft/live/archived, got "banana"',
    });
  });

  it("rejects a non-numeric price", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", product_price: "expensive" }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'product_price "expensive" isn\'t a number',
    });
  });

  it("parses a valid commission_percentage and notes", () => {
    const result = parseCombinedRow(
      HEADER,
      row({
        product_name: "Trimmer",
        product_commission_percentage: "4.5",
        product_commission_notes: "Amazon Associates, Home & Kitchen",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.commission_percentage).toBe(4.5);
      expect(result.product.commission_notes).toBe("Amazon Associates, Home & Kitchen");
    }
  });

  it("blank commission fields default to null, not 0", () => {
    const result = parseCombinedRow(HEADER, row({ product_name: "Trimmer" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.commission_percentage).toBeNull();
      expect(result.product.commission_notes).toBeNull();
    }
  });

  it("rejects a non-numeric commission_percentage", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", product_commission_percentage: "high" }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'product_commission_percentage "high" isn\'t a number',
    });
  });

  it("rejects a commission_percentage outside 0-100", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", product_commission_percentage: "150" }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'product_commission_percentage "150" must be between 0 and 100',
    });
  });

  it("parses mrp, rating, and review_count", () => {
    const result = parseCombinedRow(
      HEADER,
      row({
        product_name: "Trimmer",
        product_mrp: "1799",
        product_rating: "4.3",
        product_review_count: "1250",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.mrp).toBe(1799);
      expect(result.product.rating).toBe(4.3);
      expect(result.product.review_count).toBe(1250);
    }
  });

  it("blank mrp/rating/review_count default to null, not 0", () => {
    const result = parseCombinedRow(HEADER, row({ product_name: "Trimmer" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.mrp).toBeNull();
      expect(result.product.rating).toBeNull();
      expect(result.product.review_count).toBeNull();
    }
  });

  it("rejects a rating outside 0-5", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", product_rating: "5.5" }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'product_rating "5.5" must be between 0 and 5',
    });
  });

  it("rejects a negative review_count", () => {
    const result = parseCombinedRow(
      HEADER,
      row({ product_name: "Trimmer", product_review_count: "-5" }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'product_review_count "-5" must be at least 0',
    });
  });

  it("treats paid_traffic_allowed leniently (true/1/yes, case-insensitive)", () => {
    for (const truthy of ["true", "TRUE", "1", "yes", "Y"]) {
      const result = parseCombinedRow(
        HEADER,
        row({ product_name: "Trimmer", product_paid_traffic_allowed: truthy }),
      );
      expect(result.ok && result.product.paid_traffic_allowed).toBe(true);
    }
    const blank = parseCombinedRow(HEADER, row({ product_name: "Trimmer" }));
    expect(blank.ok && blank.product.paid_traffic_allowed).toBe(false);
  });
});
