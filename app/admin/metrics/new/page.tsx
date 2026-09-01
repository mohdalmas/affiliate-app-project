import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { getCampaignOptions } from "@/lib/admin/options";
import { createDailyMetric } from "../actions";
import { METRIC_HELP_DESCRIPTION, METRIC_HELP_FIELDS } from "../help";

export default async function NewMetricPage() {
  const campaignOptions = await getCampaignOptions();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add metrics row</h1>
        {campaignOptions.length === 0 && (
          <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
            No campaigns yet —{" "}
            <Link href="/admin/campaigns/new" className="underline">
              add one first
            </Link>
            .
          </p>
        )}
        <form action={createDailyMetric} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField name="date" label="Date" type="date" required />
            <SelectField
              name="campaign_id"
              label="Campaign"
              options={campaignOptions}
              required
              emptyLabel="Select a campaign…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="impressions" label="Impressions" type="number" />
            <TextField name="reach" label="Reach" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="clicks" label="Clicks" type="number" />
            <TextField name="landing_page_views" label="Landing page views" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="affiliate_clicks" label="Affiliate clicks" type="number" />
            <TextField name="purchases" label="Purchases" type="number" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <TextField name="spend" label="Spend (₹)" type="number" step="0.01" />
            <TextField name="revenue" label="Revenue (₹)" type="number" step="0.01" />
            <TextField name="commission" label="Commission (₹)" type="number" step="0.01" />
          </div>
          <TextAreaField name="notes" label="Notes" />
          <div className="flex gap-2">
            <Button type="submit">Create metrics row</Button>
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
