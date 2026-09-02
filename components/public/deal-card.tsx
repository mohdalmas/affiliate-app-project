import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { discountPercent } from "@/lib/pricing";
import { StarRating } from "./star-rating";

// The Template 3 "deal card" (dealsjunction-template3-toolkit): retailer
// badge, boxed thumbnail (with a discount badge pinned to its corner),
// two-line title, star rating, price + struck-through MRP, redirect CTA.
// Shared by the homepage sections, the related-products rails, and
// anywhere else a deal needs to render as a card.
export function DealCard({
  href,
  title,
  brand,
  imageUrl,
  price,
  currency,
  mrp,
  rating,
  reviewCount,
  highlight = false,
}: {
  href: string;
  title: string;
  brand?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  mrp?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  highlight?: boolean;
}) {
  const discount = discountPercent(price ?? null, mrp ?? null);

  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between bg-card border rounded-lg p-3 sm:p-4 shadow-card hover:shadow-hover hover:border-primary/40 transition-all ${highlight ? "border-primary/40" : ""}`}
    >
      <div>
        {brand && (
          <div className="flex justify-end mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
              {brand}
            </span>
          </div>
        )}
        <div className="relative w-full h-[130px] sm:h-[170px] bg-muted/60 rounded-md flex items-center justify-center overflow-hidden mb-3.5">
          {discount != null && (
            <span className="absolute top-1.5 right-1.5 z-10 bg-success text-success-foreground text-[11px] font-extrabold px-1.5 py-0.5 rounded-sm shadow-sm">
              -{discount}%
            </span>
          )}
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable product image URLs
            <img
              src={imageUrl}
              alt={title}
              className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No image</span>
          )}
        </div>
        <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2 mb-1.5 min-h-[2.5em]">
          {title}
        </h3>
        {rating != null && (
          <div className="mb-2">
            <StarRating rating={rating} reviewCount={reviewCount} />
          </div>
        )}
      </div>

      <div>
        {price != null && (
          <div className="flex items-baseline gap-1.5 mb-3 flex-wrap">
            <span className="font-heading text-lg font-extrabold text-primary">
              {currency ?? "INR"} {price}
            </span>
            {mrp != null && discount != null && (
              <span className="text-xs text-muted-foreground line-through">
                {currency ?? "INR"} {mrp}
              </span>
            )}
          </div>
        )}
        <span className="flex items-center justify-center gap-1.5 w-full bg-primary text-primary-foreground text-sm font-bold rounded-md py-2.5 group-hover:bg-secondary-foreground transition-colors">
          View Deal <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
