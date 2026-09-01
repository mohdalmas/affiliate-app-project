import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createAudience } from "../actions";
import { AUDIENCE_HELP_DESCRIPTION, AUDIENCE_HELP_FIELDS } from "../help";

const STATUS_OPTIONS = ["active", "paused", "archived"].map((value) => ({
  value,
  label: value,
}));

export default function NewAudiencePage() {
  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add audience</h1>
        <form action={createAudience} className="flex flex-col gap-4">
          <TextField name="name" label="Name" placeholder="Men 25-34" required />
          <div className="grid grid-cols-3 gap-4">
            <TextField name="gender" label="Gender" placeholder="men" />
            <TextField name="age_min" label="Age min" type="number" />
            <TextField name="age_max" label="Age max" type="number" />
          </div>
          <TextField name="location" label="Location" placeholder="India" />
          <TextField name="interests" label="Interests" placeholder="Men's grooming, convenience" />
          <TextAreaField name="hypothesis" label="Hypothesis" />
          <SelectField name="status" label="Status" defaultValue="active" options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Create audience</Button>
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
