import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { getProductOptions, getAudienceOptions } from "@/lib/admin/options";
import { createExperiment } from "../actions";
import { EXPERIMENT_HELP_DESCRIPTION, EXPERIMENT_HELP_FIELDS } from "../help";

const STATUS_OPTIONS = ["planned", "running", "completed", "cancelled"].map(
  (value) => ({ value, label: value }),
);

export default async function NewExperimentPage() {
  const [productOptions, audienceOptions] = await Promise.all([
    getProductOptions(),
    getAudienceOptions(),
  ]);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add experiment</h1>
        <form action={createExperiment} className="flex flex-col gap-4">
          <TextField name="name" label="Name" placeholder="Convenience vs Price Messaging" required />
          <TextAreaField name="hypothesis" label="Hypothesis" required />
          <SelectField name="product_id" label="Product" options={productOptions} emptyLabel="— none —" />
          <SelectField name="audience_id" label="Audience" options={audienceOptions} emptyLabel="— none —" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="primary_metric" label="Primary metric" placeholder="Purchase conversion rate" />
            <TextField name="secondary_metrics" label="Secondary metrics" />
          </div>
          <TextAreaField name="control_description" label="Control" />
          <TextAreaField name="variant_description" label="Variant" />
          <SelectField name="status" label="Status" defaultValue="planned" options={STATUS_OPTIONS} required />
          <TextAreaField name="result" label="Result" />
          <TextAreaField name="conclusion" label="Conclusion" />
          <div className="flex gap-2">
            <Button type="submit">Create experiment</Button>
            <Button asChild variant="outline">
              <Link href="/admin/experiments">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel title="About Experiments" description={EXPERIMENT_HELP_DESCRIPTION} fields={EXPERIMENT_HELP_FIELDS} />
    </FormLayout>
  );
}
