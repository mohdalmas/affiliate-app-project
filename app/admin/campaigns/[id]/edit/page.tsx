import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { getProductOptions, getCreativeOptions, getAudienceOptions } from "@/lib/admin/options";
import { updateCampaign } from "../../actions";
import { CAMPAIGN_HELP_DESCRIPTION, CAMPAIGN_HELP_FIELDS } from "../../help";

const STATUS_OPTIONS = ["draft", "active", "paused", "completed"].map((value) => ({
  value,
  label: value,
}));

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: campaign }, productOptions, creativeOptions, audienceOptions] = await Promise.all([
    supabase.from("campaigns").select("*").eq("id", id).single(),
    getProductOptions(),
    getCreativeOptions(),
    getAudienceOptions(),
  ]);

  if (!campaign) notFound();

  const updateCampaignWithId = updateCampaign.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit campaign</h1>
        <form action={updateCampaignWithId} className="flex flex-col gap-4">
          <TextField name="name" label="Name" defaultValue={campaign.name} required />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="platform" label="Platform" defaultValue={campaign.platform} />
            <TextField name="external_campaign_id" label="Meta campaign ID" defaultValue={campaign.external_campaign_id} />
          </div>
          <SelectField name="product_id" label="Product" defaultValue={campaign.product_id} options={productOptions} emptyLabel="— none —" />
          <SelectField name="creative_id" label="Creative" defaultValue={campaign.creative_id} options={creativeOptions} emptyLabel="— none —" />
          <SelectField name="audience_id" label="Audience" defaultValue={campaign.audience_id} options={audienceOptions} emptyLabel="— none —" />
          <TextField name="daily_budget" label="Daily budget (₹)" type="number" step="0.01" defaultValue={campaign.daily_budget} />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="start_date" label="Start date" type="date" defaultValue={campaign.start_date} />
            <TextField name="end_date" label="End date" type="date" defaultValue={campaign.end_date} />
          </div>
          <SelectField name="status" label="Status" defaultValue={campaign.status} options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
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
