import { ArrowUpRight } from "lucide-react";

export type PreviewableProduct = {
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  paid_traffic_allowed: boolean;
  status: string;
};

// The actual product page markup — shared between the real public page
// (app/[slug]/page.tsx, live-only, records a view) and the admin preview
// (app/preview/[slug]/page.tsx, any status, no tracking) so the two can
// never visually drift apart. `preview` swaps in a banner and turns the
// CTA into inert text instead of a real link, since a preview's own
// /go/[slug] wouldn't actually redirect unless everything is already Live
// — nothing to usefully click through to yet.
//
// A single, centered card — see app/[slug]/page.tsx for the "More in
// category" shelf rendered below it.
export function ProductView({
  product,
  slug,
  preview = false,
}: {
  product: PreviewableProduct | null;
  slug: string;
  preview?: boolean;
}) {
  if (!product || (!preview && product.status !== "live")) {
    return (
      <p className="text-muted-foreground">
        This page isn&apos;t set up yet — check back soon.
      </p>
    );
  }

  const canRedirect = product.paid_traffic_allowed && !!product.affiliate_url;

  return (
    <div className="max-w-lg mx-auto bg-card border rounded-lg shadow-card p-5 flex flex-col gap-4">
      {preview && (
        <div className="bg-secondary text-secondary-foreground text-sm p-3 rounded-md text-center font-medium">
          Preview — product is <strong>{product.status}</strong>, not visible
          to real visitors yet
        </div>
      )}
      {/* min-h-* is a fallback for browsers/webviews that don't support the
          `aspect-ratio` CSS property (some older Android WebViews, older
          in-app browsers) — without it, this box collapses to 0 height
          there instead of just losing the exact 1:1 ratio. */}
      <div className="w-full aspect-square min-h-[260px] sm:min-h-[320px] bg-muted/60 rounded-md flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable product image URLs
          <img
            src={product.image_url}
            alt={product.name}
            className="max-w-[85%] max-h-[85%] object-contain"
          />
        ) : (
          <span className="text-sm text-muted-foreground">No image</span>
        )}
      </div>
      {product.brand && (
        <span className="self-start text-[11px] font-bold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
          {product.brand}
        </span>
      )}
      <h1 className="font-heading text-2xl font-bold leading-snug">
        {product.name}
      </h1>
      <p className="text-muted-foreground text-sm">
        {[product.brand, product.category].filter(Boolean).join(" · ") || " "}
      </p>
      {product.price != null && (
        <p className="font-heading text-2xl font-extrabold text-primary">
          {product.currency ?? "INR"} {product.price}
        </p>
      )}
      {canRedirect ? (
        preview ? (
          <div className="inline-flex items-center justify-center gap-1.5 rounded-md bg-muted text-muted-foreground px-6 py-3 font-bold cursor-not-allowed">
            View Deal (preview — not a real link)
          </div>
        ) : (
          <a
            href={`/go/${slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground px-6 py-3 font-bold hover:bg-secondary-foreground transition-colors"
          >
            View Deal <ArrowUpRight className="size-4" />
          </a>
        )
      ) : (
        <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">
          This deal isn&apos;t live yet — check back soon.
        </p>
      )}
    </div>
  );
}
