import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteDailyMetric } from "./actions";

export default async function MetricsPage() {
  const supabase = await createClient();
  const { data: metrics, error } = await supabase
    .from("daily_metrics")
    .select("*, campaign:campaigns(name)")
    .order("date", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load metrics: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Metrics"
        description="One row per campaign per day — enter these by hand from Meta Ads Manager (spend, clicks) and Amazon Associates (commission) until Stage 17+ automates the import. Analytics rolls these up by product/creative/audience."
        addHref="/admin/metrics/new"
      />

      {!metrics?.length ? (
        <EmptyState message="No metrics entered yet. Add a row once you have real spend/commission numbers for a campaign and date." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Campaign</th>
                <th className="p-3 font-medium">Spend</th>
                <th className="p-3 font-medium">Commission</th>
                <th className="p-3 font-medium">Profit</th>
                <th className="p-3 font-medium">Affiliate clicks</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const profit = Number(metric.commission ?? 0) - Number(metric.spend ?? 0);
                return (
                  <tr key={metric.id} className="border-t">
                    <td className="p-3">{metric.date}</td>
                    <td className="p-3 text-muted-foreground">
                      {metric.campaign?.name ?? "—"}
                    </td>
                    <td className="p-3">₹{metric.spend}</td>
                    <td className="p-3">₹{metric.commission}</td>
                    <td className={`p-3 font-medium ${profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {profit >= 0 ? "+" : ""}
                      {profit.toFixed(2)}
                    </td>
                    <td className="p-3 text-muted-foreground">{metric.affiliate_clicks}</td>
                    <td className="p-3">
                      <div className="flex justify-end items-center gap-4">
                        <Link
                          href={`/admin/metrics/${metric.id}/edit`}
                          className="text-sm hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteButton onDelete={deleteDailyMetric.bind(null, metric.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
