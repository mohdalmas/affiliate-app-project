import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { getProductOptions } from "@/lib/admin/options";
import { updateLandingPage } from "../../actions";
import { LANDING_PAGE_HELP_DESCRIPTION, LANDING_PAGE_HELP_FIELDS } from "../../help";

const PAGE_TYPE_OPTIONS = ["product", "collection", "comparison"].map((value) => ({
  value,
  label: value,
}));
const STATUS_OPTIONS = ["draft", "published", "archived"].map((value) => ({
  value,
  label: value,
}));

export default async function EditLandingPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: landingPage }, productOptions] = await Promise.all([
    supabase.from("landing_pages").select("*").eq("id", id).single(),
    getProductOptions(),
  ]);

  if (!landingPage) notFound();

  const updateLandingPageWithId = updateLandingPage.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit landing page</h1>
        <form action={updateLandingPageWithId} className="flex flex-col gap-4">
          <TextField name="name" label="Name" defaultValue={landingPage.name} required />
          <TextField name="slug" label="Slug" defaultValue={landingPage.slug} required />
          <SelectField
            name="page_type"
            label="Page type"
            defaultValue={landingPage.page_type}
            options={PAGE_TYPE_OPTIONS}
            required
          />
          <SelectField
            name="product_id"
            label="Product"
            defaultValue={landingPage.product_id}
            options={productOptions}
            emptyLabel="— none —"
          />
          <SelectField name="status" label="Status" defaultValue={landingPage.status} options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
            <Button asChild variant="outline">
              <Link href="/admin/landing-pages">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel
        title="About Landing pages"
        description={LANDING_PAGE_HELP_DESCRIPTION}
        fields={LANDING_PAGE_HELP_FIELDS}
      />
    </FormLayout>
  );
}
