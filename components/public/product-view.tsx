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
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      {preview && (
        <div className="bg-accent text-sm p-3 rounded-md text-center font-medium">
          Preview — product is <strong>{product.status}</strong>, not visible
          to real visitors yet
        </div>
      )}
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable product image URLs
        <img
          src={product.image_url}
          alt={product.name}
          className="rounded-md w-full object-cover"
        />
      )}
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-muted-foreground text-sm">
        {[product.brand, product.category].filter(Boolean).join(" · ") || " "}
      </p>
      {product.price != null && (
        <p className="text-xl font-semibold">
          {product.currency ?? "INR"} {product.price}
        </p>
      )}
      {canRedirect ? (
        preview ? (
          <div className="inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground px-6 py-3 font-medium cursor-not-allowed">
            Get the deal (preview — not a real link)
          </div>
        ) : (
          <a
            href={`/go/${slug}`}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90"
          >
            Get the deal
          </a>
        )
      ) : (
        <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
          This deal isn&apos;t live yet — check back soon.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Paid link — we may earn a commission if you buy through this page.
      </p>
    </div>
  );
}
