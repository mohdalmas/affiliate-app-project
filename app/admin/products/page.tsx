import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ListToolbar, ListPagination } from "@/components/admin/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { deleteProduct } from "./actions";

// Server Component: reads straight from Supabase on the server, using your
// logged-in session's cookies — the RLS policy from the schema ("authenticated
// full access") is what actually allows this query to return rows.
type ProductWithPages = {
  [key: string]: unknown;
  id: string;
  name: string;
  brand: string | null;
  price: number | null;
  currency: string | null;
  paid_traffic_allowed: boolean;
  status: string;
  // Reverse relation (landing_pages.product_id -> products.id) — genuinely
  // one-to-many, so this one really is an array, unlike the to-one embeds
  // elsewhere in this app.
  landing_pages: { slug: string; status: string }[];
};

const PAGE_SIZE_OPTIONS = [10, 50, 100];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}) {
  const { q, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(pageSizeParam))
    ? Number(pageSizeParam)
    : 10;

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, landing_pages(slug, status)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    // Search across name/brand/category — ilike is case-insensitive.
    query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,category.ilike.%${q}%`);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  const products = data as ProductWithPages[] | null;

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load products: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Products"
        description="What you're promoting — the affiliate link and the compliance flag live directly on the product. Set status to Live once a Landing page for it is also Live."
        addHref="/admin/products/new"
      />

      <p className="text-sm text-muted-foreground -mt-4">
        Bulk add/update via CSV? Head to{" "}
        <Link href="/admin/import-export" className="underline">
          Import / Export
        </Link>
        .
      </p>

      <Suspense>
        <ListToolbar searchPlaceholder="Search by name, brand, category…" />
      </Suspense>

      {!products?.length ? (
        <EmptyState
          message={
            q
              ? `No products match "${q}".`
              : "No products yet. Add one — name and a status is all that's required to start."
          }
        />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Paid traffic?</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const livePage = product.landing_pages.find((p) => p.status === "live");
                const isFullyLive = !!livePage && product.status === "live";
                const previewablePage = livePage ?? product.landing_pages[0];

                return (
                  <tr key={product.id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{product.name}</div>
                      {product.brand && (
                        <div className="text-muted-foreground text-xs">
                          {product.brand}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {product.price != null
                        ? `${product.currency ?? "INR"} ${product.price}`
                        : "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant={product.paid_traffic_allowed ? "default" : "outline"}>
                        {product.paid_traffic_allowed ? "Allowed" : "Not allowed"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end items-center gap-4">
                        {isFullyLive ? (
                          <Link
                            href={`/${livePage.slug}`}
                            target="_blank"
                            className="text-sm hover:underline"
                          >
                            View
                          </Link>
                        ) : (
                          previewablePage && (
                            <Link
                              href={`/preview/${previewablePage.slug}`}
                              target="_blank"
                              className="text-sm hover:underline"
                            >
                              Preview
                            </Link>
                          )
                        )}
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          onDelete={deleteProduct.bind(null, product.id)}
                          confirmMessage={`Delete "${product.name}"? Any landing pages pointing at it will stop working.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!!products?.length && (
        <Suspense>
          <ListPagination page={page} pageSize={pageSize} totalCount={count ?? 0} />
        </Suspense>
      )}
    </div>
  );
}
