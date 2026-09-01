import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { getCampaignOptions } from "@/lib/admin/options";
import { updateDailyMetric } from "../../actions";
import { METRIC_HELP_DESCRIPTION, METRIC_HELP_FIELDS } from "../../help";

export default async function EditMetricPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: metric }, campaignOptions] = await Promise.all([
    supabase.from("daily_metrics").select("*").eq("id", id).single(),
    getCampaignOptions(),
  ]);

  if (!metric) notFound();

  const updateDailyMetricWithId = updateDailyMetric.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit metrics row</h1>
        <form action={updateDailyMetricWithId} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField name="date" label="Date" type="date" defaultValue={metric.date} required />
            <SelectField
              name="campaign_id"
              label="Campaign"
              defaultValue={metric.campaign_id}
              options={campaignOptions}
              required
              emptyLabel="Select a campaign…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="impressions" label="Impressions" type="number" defaultValue={metric.impressions} />
            <TextField name="reach" label="Reach" type="number" defaultValue={metric.reach} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="clicks" label="Clicks" type="number" defaultValue={metric.clicks} />
            <TextField name="landing_page_views" label="Landing page views" type="number" defaultValue={metric.landing_page_views} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="affiliate_clicks" label="Affiliate clicks" type="number" defaultValue={metric.affiliate_clicks} />
            <TextField name="purchases" label="Purchases" type="number" defaultValue={metric.purchases} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <TextField name="spend" label="Spend (₹)" type="number" step="0.01" defaultValue={metric.spend} />
            <TextField name="revenue" label="Revenue (₹)" type="number" step="0.01" defaultValue={metric.revenue} />
            <TextField name="commission" label="Commission (₹)" type="number" step="0.01" defaultValue={metric.commission} />
          </div>
          <TextAreaField name="notes" label="Notes" defaultValue={metric.notes} />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
            <Button asChild variant="outline">
              <Link href="/admin/metrics">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel title="About Metrics" description={METRIC_HELP_DESCRIPTION} fields={METRIC_HELP_FIELDS} />
    </FormLayout>
  );
}
