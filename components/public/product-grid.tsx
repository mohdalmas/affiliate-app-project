import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

type ProductGridEntry = {
  slug: string;
  name: string;
  // Supabase-js infers embedded to-one relations as arrays without
  // generated DB types — this is actually always a single object (or
  // null), guaranteed by product_id being a plain foreign key.
  product: {
    name: string;
    price: number | null;
    currency: string | null;
    image_url: string | null;
  } | null;
};

// Shared between the homepage and any "collection"-type landing page —
// both show the same grid of every published product page. Kept in one
// place so the two can't quietly drift apart.
export async function ProductGrid({
  excludeLandingPageId,
}: {
  excludeLandingPageId?: string;
}) {
  const supabase = createServiceClient();
  let query = supabase
    .from("landing_pages")
    .select("slug, name, product:products(name, price, currency, image_url)")
    .eq("page_type", "product")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (excludeLandingPageId) {
    query = query.neq("id", excludeLandingPageId);
  }

  const { data } = await query;
  const pages = data as unknown as ProductGridEntry[] | null;

  if (!pages?.length) {
    return (
      <p className="text-muted-foreground">
        Nothing published yet — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {pages.map((page) => (
        <Link
          key={page.slug}
          href={`/${page.slug}`}
          className="border rounded-md p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow"
        >
          {page.product?.image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable product image URLs
            <img
              src={page.product.image_url}
              alt={page.product?.name ?? page.name}
              className="rounded-md aspect-square object-cover"
            />
          )}
          <div className="font-medium">{page.product?.name ?? page.name}</div>
          {page.product?.price != null && (
            <div className="text-sm text-muted-foreground">
              {page.product.currency ?? "INR"} {page.product.price}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
