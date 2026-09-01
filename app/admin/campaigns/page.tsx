import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCampaign } from "./actions";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*, product:products(name), creative:creatives(name), audience:audiences(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load campaigns: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Campaigns"
        description="Real (or planned) Meta campaigns — tying a product, creative, and audience together with a budget and dates."
        addHref="/admin/campaigns/new"
      />

      {!campaigns?.length ? (
        <EmptyState message="No campaigns yet. Link a product, creative, and audience together, plus budget and dates." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Product / Creative / Audience</th>
                <th className="p-3 font-medium">Daily budget</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {campaign.platform}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {[campaign.product?.name, campaign.creative?.name, campaign.audience?.name]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="p-3">
                    {campaign.daily_budget != null ? `₹${campaign.daily_budget}` : "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/campaigns/${campaign.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteCampaign.bind(null, campaign.id)} />
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
