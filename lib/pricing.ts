// Shared "is there a real discount to show" logic — a product's `mrp`
// only counts if it's actually higher than `price`; a bad data entry
// (mrp <= price, or either missing) just means no badge, not a 0%/
// negative one. Used by both the deal-card grid and the product page so
// they can never disagree on what counts as "on sale."
export function discountPercent(price: number | null, mrp: number | null): number | null {
  if (price == null || mrp == null || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}
