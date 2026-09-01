import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { getProductOptions } from "@/lib/admin/options";
import { createLandingPage } from "../actions";
import { LANDING_PAGE_HELP_DESCRIPTION, LANDING_PAGE_HELP_FIELDS } from "../help";

const PAGE_TYPE_OPTIONS = ["product", "collection", "comparison"].map((value) => ({
  value,
  label: value,
}));
const STATUS_OPTIONS = ["draft", "published", "archived"].map((value) => ({
  value,
  label: value,
}));

export default async function NewLandingPagePage() {
  const productOptions = await getProductOptions();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add landing page</h1>
        <form action={createLandingPage} className="flex flex-col gap-4">
          <TextField name="name" label="Name" required />
          <TextField name="slug" label="Slug" placeholder="trimmer-a" required />
          <SelectField
            name="page_type"
            label="Page type"
            defaultValue="product"
            options={PAGE_TYPE_OPTIONS}
            required
          />
          <SelectField name="product_id" label="Product" options={productOptions} emptyLabel="— none —" />
          <SelectField name="status" label="Status" defaultValue="draft" options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <Button type="submit">Create landing page</Button>
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
