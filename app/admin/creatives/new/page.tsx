import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { getProductOptions } from "@/lib/admin/options";
import { createCreative } from "../actions";
import { CREATIVE_HELP_DESCRIPTION, CREATIVE_HELP_FIELDS } from "../help";

const FORMAT_OPTIONS = ["video", "image", "carousel", "ugc", "other"].map((value) => ({
  value,
  label: value,
}));
const STATUS_OPTIONS = ["draft", "ready", "testing", "winner", "killed", "archived"].map(
  (value) => ({ value, label: value }),
);

export default async function NewCreativePage() {
  const productOptions = await getProductOptions();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add creative</h1>
        <form action={createCreative} className="flex flex-col gap-4">
          <TextField name="name" label="Name" required />
          <SelectField name="product_id" label="Product" options={productOptions} emptyLabel="— none —" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="platform" label="Platform" defaultValue="meta" />
            <SelectField name="format" label="Format" options={FORMAT_OPTIONS} />
          </div>
          <TextField name="hook" label="Hook" />
          <TextField name="angle" label="Angle" />
          <TextField name="call_to_action" label="Call to action" />
          <TextField name="media_url" label="Media URL" type="url" />
          <SelectField name="status" label="Status" defaultValue="draft" options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Create creative</Button>
            <Button asChild variant="outline">
              <Link href="/admin/creatives">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel title="About Creatives" description={CREATIVE_HELP_DESCRIPTION} fields={CREATIVE_HELP_FIELDS} />
    </FormLayout>
  );
}
