import { describe, it, expect } from "vitest";
import { discountPercent } from "./pricing";

describe("discountPercent", () => {
  it("computes a rounded percentage off", () => {
    expect(discountPercent(699, 999)).toBe(30);
  });

  it("returns null when mrp is missing", () => {
    expect(discountPercent(699, null)).toBeNull();
  });

  it("returns null when price is missing", () => {
    expect(discountPercent(null, 999)).toBeNull();
  });

  it("returns null when mrp is equal to price (no real discount)", () => {
    expect(discountPercent(999, 999)).toBeNull();
  });

  it("returns null when mrp is less than price (bad data, not a discount)", () => {
    expect(discountPercent(999, 500)).toBeNull();
  });
});
