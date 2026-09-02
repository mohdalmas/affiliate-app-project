import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

type ProductGridEntry = {
  slug: string;
  name: string;
  // Supabase-js infers embedded to-one relations as arrays without
  // generated DB types — this is actually always a single object (or
  // null), guaranteed by product_id being a required, plain foreign key.
  product: {
    name: string;
    price: number | null;
    currency: string | null;
    image_url: string | null;
  } | null;
};

// The homepage's product grid: every Live landing page whose product is
// also Live.
export async function ProductGrid() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("slug, name, product:products!inner(name, price, currency, image_url)")
    .eq("status", "live")
    .eq("product.status", "live")
    .order("created_at", { ascending: false });
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
