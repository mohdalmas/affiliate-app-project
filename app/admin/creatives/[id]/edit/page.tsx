import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { getProductOptions } from "@/lib/admin/options";
import { updateCreative } from "../../actions";
import { CREATIVE_HELP_DESCRIPTION, CREATIVE_HELP_FIELDS } from "../../help";

const FORMAT_OPTIONS = ["video", "image", "carousel", "ugc", "other"].map((value) => ({
  value,
  label: value,
}));
const STATUS_OPTIONS = ["draft", "ready", "testing", "winner", "killed", "archived"].map(
  (value) => ({ value, label: value }),
);

export default async function EditCreativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: creative }, productOptions] = await Promise.all([
    supabase.from("creatives").select("*").eq("id", id).single(),
    getProductOptions(),
  ]);

  if (!creative) notFound();

  const updateCreativeWithId = updateCreative.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit creative</h1>
        <form action={updateCreativeWithId} className="flex flex-col gap-4">
          <TextField name="name" label="Name" defaultValue={creative.name} required />
          <SelectField
            name="product_id"
            label="Product"
            defaultValue={creative.product_id}
            options={productOptions}
            emptyLabel="— none —"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="platform" label="Platform" defaultValue={creative.platform} />
            <SelectField name="format" label="Format" defaultValue={creative.format} options={FORMAT_OPTIONS} />
          </div>
          <TextField name="hook" label="Hook" defaultValue={creative.hook} />
          <TextField name="angle" label="Angle" defaultValue={creative.angle} />
          <TextField name="call_to_action" label="Call to action" defaultValue={creative.call_to_action} />
          <TextField name="media_url" label="Media URL" type="url" defaultValue={creative.media_url} />
          <SelectField name="status" label="Status" defaultValue={creative.status} options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
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
