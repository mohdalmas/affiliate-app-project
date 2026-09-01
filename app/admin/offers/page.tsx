import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { deleteOffer } from "./actions";

export default async function OffersPage() {
  const supabase = await createClient();
  const { data: offers, error } = await supabase
    .from("affiliate_offers")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load offers: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Offers"
        description="The real merchant links for each product — one product can have several (Amazon, Flipkart, ...). The “Paid traffic” column is the compliance flag from ARCHITECTURE.md, stored per offer."
        addHref="/admin/offers/new"
      />

      {!offers?.length ? (
        <EmptyState message="No affiliate offers yet. Add one to link a product to a real merchant URL." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Merchant</th>
                <th className="p-3 font-medium">Commission</th>
                <th className="p-3 font-medium">Paid traffic?</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">
                      {offer.product?.name ?? "—"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {offer.network}
                    </div>
                  </td>
                  <td className="p-3">{offer.merchant}</td>
                  <td className="p-3 text-muted-foreground">
                    {offer.commission_percent != null
                      ? `${offer.commission_percent}%`
                      : offer.commission_fixed != null
                        ? `${offer.currency ?? "INR"} ${offer.commission_fixed}`
                        : "—"}
                  </td>
                  <td className="p-3">
                    <Badge variant={offer.paid_traffic_allowed ? "default" : "outline"}>
                      {offer.paid_traffic_allowed ? "Allowed" : "Not allowed"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={offer.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/offers/${offer.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteOffer.bind(null, offer.id)} />
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
