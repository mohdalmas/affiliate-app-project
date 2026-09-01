import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { getProductOptions, getCreativeOptions, getAudienceOptions } from "@/lib/admin/options";
import { createCampaign } from "../actions";
import { CAMPAIGN_HELP_DESCRIPTION, CAMPAIGN_HELP_FIELDS } from "../help";

const STATUS_OPTIONS = ["draft", "active", "paused", "completed"].map((value) => ({
  value,
  label: value,
}));

export default async function NewCampaignPage() {
  const [productOptions, creativeOptions, audienceOptions] = await Promise.all([
    getProductOptions(),
    getCreativeOptions(),
    getAudienceOptions(),
  ]);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add campaign</h1>
        <form action={createCampaign} className="flex flex-col gap-4">
          <TextField name="name" label="Name" required />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="platform" label="Platform" defaultValue="meta" />
            <TextField name="external_campaign_id" label="Meta campaign ID" />
          </div>
          <SelectField name="product_id" label="Product" options={productOptions} emptyLabel="— none —" />
          <SelectField name="creative_id" label="Creative" options={creativeOptions} emptyLabel="— none —" />
          <SelectField name="audience_id" label="Audience" options={audienceOptions} emptyLabel="— none —" />
          <TextField name="daily_budget" label="Daily budget (₹)" type="number" step="0.01" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="start_date" label="Start date" type="date" />
            <TextField name="end_date" label="End date" type="date" />
          </div>
          <SelectField name="status" label="Status" defaultValue="draft" options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Create campaign</Button>
            <Button asChild variant="outline">
              <Link href="/admin/campaigns">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel title="About Campaigns" description={CAMPAIGN_HELP_DESCRIPTION} fields={CAMPAIGN_HELP_FIELDS} />
    </FormLayout>
  );
}
