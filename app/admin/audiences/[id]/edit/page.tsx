import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { updateAudience } from "../../actions";
import { AUDIENCE_HELP_DESCRIPTION, AUDIENCE_HELP_FIELDS } from "../../help";

const STATUS_OPTIONS = ["active", "paused", "archived"].map((value) => ({
  value,
  label: value,
}));

export default async function EditAudiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: audience } = await supabase
    .from("audiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!audience) notFound();

  const updateAudienceWithId = updateAudience.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit audience</h1>
        <form action={updateAudienceWithId} className="flex flex-col gap-4">
          <TextField name="name" label="Name" defaultValue={audience.name} required />
          <div className="grid grid-cols-3 gap-4">
            <TextField name="gender" label="Gender" defaultValue={audience.gender} />
            <TextField name="age_min" label="Age min" type="number" defaultValue={audience.age_min} />
            <TextField name="age_max" label="Age max" type="number" defaultValue={audience.age_max} />
          </div>
          <TextField name="location" label="Location" defaultValue={audience.location} />
          <TextField name="interests" label="Interests" defaultValue={audience.interests} />
          <TextAreaField name="hypothesis" label="Hypothesis" defaultValue={audience.hypothesis} />
          <SelectField name="status" label="Status" defaultValue={audience.status} options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
            <Button asChild variant="outline">
              <Link href="/admin/audiences">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel title="About Audiences" description={AUDIENCE_HELP_DESCRIPTION} fields={AUDIENCE_HELP_FIELDS} />
    </FormLayout>
  );
}
