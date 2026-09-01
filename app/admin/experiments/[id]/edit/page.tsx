import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { getProductOptions, getAudienceOptions } from "@/lib/admin/options";
import { updateExperiment } from "../../actions";
import { EXPERIMENT_HELP_DESCRIPTION, EXPERIMENT_HELP_FIELDS } from "../../help";

const STATUS_OPTIONS = ["planned", "running", "completed", "cancelled"].map(
  (value) => ({ value, label: value }),
);

export default async function EditExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: experiment }, productOptions, audienceOptions] = await Promise.all([
    supabase.from("experiments").select("*").eq("id", id).single(),
    getProductOptions(),
    getAudienceOptions(),
  ]);

  if (!experiment) notFound();

  const updateExperimentWithId = updateExperiment.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit experiment</h1>
        <form action={updateExperimentWithId} className="flex flex-col gap-4">
          <TextField name="name" label="Name" defaultValue={experiment.name} required />
          <TextAreaField name="hypothesis" label="Hypothesis" defaultValue={experiment.hypothesis} required />
          <SelectField name="product_id" label="Product" defaultValue={experiment.product_id} options={productOptions} emptyLabel="— none —" />
          <SelectField name="audience_id" label="Audience" defaultValue={experiment.audience_id} options={audienceOptions} emptyLabel="— none —" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="primary_metric" label="Primary metric" defaultValue={experiment.primary_metric} />
            <TextField name="secondary_metrics" label="Secondary metrics" defaultValue={experiment.secondary_metrics} />
          </div>
          <TextAreaField name="control_description" label="Control" defaultValue={experiment.control_description} />
          <TextAreaField name="variant_description" label="Variant" defaultValue={experiment.variant_description} />
          <SelectField name="status" label="Status" defaultValue={experiment.status} options={STATUS_OPTIONS} required />
          <TextAreaField name="result" label="Result" defaultValue={experiment.result} />
          <TextAreaField name="conclusion" label="Conclusion" defaultValue={experiment.conclusion} />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
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
