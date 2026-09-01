import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct } from "./actions";

// Server Component: reads straight from Supabase on the server, using your
// logged-in session's cookies — the RLS policy from Stage 2 ("authenticated
// full access") is what actually allows this query to return rows.
export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

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
        description="Everything you're considering promoting, tracked through a research pipeline. Every Offer, Creative, Campaign, and Experiment links back to a product here."
        addHref="/admin/products/new"
      />

      {!products?.length ? (
        <EmptyState message="No products yet. Add your first one to start tracking it through research → shortlisted → testing → winner." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{product.name}</div>
                    {product.brand && (
                      <div className="text-muted-foreground text-xs">
                        {product.brand}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {[product.category, product.subcategory]
                      .filter(Boolean)
                      .join(" / ") || "—"}
                  </td>
                  <td className="p-3">
                    {product.price != null
                      ? `${product.currency ?? "INR"} ${product.price}`
                      : "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        onDelete={deleteProduct.bind(null, product.id)}
                        confirmMessage={`Delete "${product.name}"? Its affiliate offers will be deleted too.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
