import { DealCard } from "./deal-card";
import { DealSection } from "./deal-section";

export type RelatedDeal = {
  slug: string;
  title: string;
  brand: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  mrp: number | null;
  rating: number | null;
  reviewCount: number | null;
};

// The single product card, plus a horizontally-scrollable "More in
// category" shelf underneath (see DealSection) — not side rails, so this
// stays a single centered column like the rest of the product page.
export function RelatedProductsLayout({
  children,
  related,
  categoryLabel,
}: {
  children: React.ReactNode;
  related: RelatedDeal[];
  categoryLabel: string | null;
}) {
  return (
    <div className="flex flex-col gap-10">
      {children}
      {related.length > 0 && (
        <DealSection title={categoryLabel ? `More in ${categoryLabel}` : "More like this"}>
          {related.map((item) => (
            <DealCard
              key={item.slug}
              href={`/${item.slug}`}
              title={item.title}
              brand={item.brand}
              imageUrl={item.imageUrl}
              price={item.price}
              currency={item.currency}
              mrp={item.mrp}
              rating={item.rating}
              reviewCount={item.reviewCount}
            />
          ))}
        </DealSection>
      )}
    </div>
  );
}
