import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCreative } from "./actions";

export default async function CreativesPage() {
  const supabase = await createClient();
  const { data: creatives, error } = await supabase
    .from("creatives")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load creatives: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Creatives"
        description="Ad variants — the actual hook, angle, and call to action you'd test in a Meta ad — each linked to a product."
        addHref="/admin/creatives/new"
      />

      {!creatives?.length ? (
        <EmptyState message="No creatives yet. Add an ad variant — its hook, angle, and CTA — linked to a product." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Format</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creatives.map((creative) => (
                <tr key={creative.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{creative.name}</div>
                    {creative.hook && (
                      <div className="text-muted-foreground text-xs">
                        {creative.hook}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {creative.product?.name ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {creative.format ?? "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={creative.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/creatives/${creative.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteCreative.bind(null, creative.id)} />
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
