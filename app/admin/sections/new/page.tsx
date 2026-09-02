import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { getCategoryOptions } from "@/lib/admin/options";
import { createSection } from "../actions";
import { SECTION_HELP_DESCRIPTION, SECTION_HELP_FIELDS } from "../help";

// See the matching comment in app/admin/products/page.tsx — same reasoning
// (getCategoryOptions() below is always a fresh, uncached query).
export const instant = false;

const STATUS_OPTIONS = ["draft", "live"].map((value) => ({ value, label: value }));

export default async function NewSectionPage() {
  const categoryOptions = await getCategoryOptions();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add home section</h1>
        <form action={createSection} className="flex flex-col gap-4">
          <TextField name="title" label="Title" placeholder="Today's Verified Hot Deals" required />
          <TextField name="subtitle" label="Subtitle" placeholder="Curated daily with maximum savings" />
          <SelectField
            name="category"
            label="Category (optional — auto-fills the shelf)"
            options={categoryOptions}
            emptyLabel="— hand-pick items instead —"
          />
          <TextField name="position" label="Position" type="number" defaultValue={0} />
          <SelectField name="status" label="Status" defaultValue="draft" options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <SubmitButton pendingText="Creating…">Create section</SubmitButton>
            <Button asChild variant="outline">
              <Link href="/admin/sections">Cancel</Link>
            </Button>
          </div>
        </form>
        <p className="text-sm text-muted-foreground">
          You can hand-pick specific landing pages after creating the
          section, on its edit page — with or without a Category set here.
        </p>
      </div>
      <HelpPanel
        title="About Home sections"
        description={SECTION_HELP_DESCRIPTION}
        fields={SECTION_HELP_FIELDS}
      />
    </FormLayout>
  );
}
