import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// The Template 3 "deal card" (dealsjunction-template3-toolkit): retailer
// badge, boxed thumbnail, two-line title, price, redirect CTA. Shared by
// the homepage sections, the related-products rails, and anywhere else a
// deal needs to render as a card.
export function DealCard({
  href,
  title,
  brand,
  imageUrl,
  price,
  currency,
  highlight = false,
}: {
  href: string;
  title: string;
  brand?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  highlight?: boolean;
}) {
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
        <div className="w-full h-[130px] sm:h-[170px] bg-muted/60 rounded-md flex items-center justify-center overflow-hidden mb-3.5">
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
        <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2 mb-2 min-h-[2.5em]">
          {title}
        </h3>
      </div>

      <div>
        {price != null && (
          <p className="font-heading text-lg font-extrabold text-primary mb-3">
            {currency ?? "INR"} {price}
          </p>
        )}
        <span className="flex items-center justify-center gap-1.5 w-full bg-primary text-primary-foreground text-sm font-bold rounded-md py-2.5 group-hover:bg-secondary-foreground transition-colors">
          View Deal <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
