import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { getProductOptions } from "@/lib/admin/options";
import { createLandingPage } from "../actions";
import { LANDING_PAGE_HELP_DESCRIPTION, LANDING_PAGE_HELP_FIELDS } from "../help";

// See the matching comment in app/admin/products/page.tsx — same reasoning
// (getProductOptions() below is always a fresh, uncached query).
export const instant = false;

const STATUS_OPTIONS = ["draft", "live", "archived"].map((value) => ({
  value,
  label: value,
}));

export default async function NewLandingPagePage() {
  const productOptions = await getProductOptions();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add landing page</h1>
        {productOptions.length === 0 && (
          <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
            No products yet —{" "}
            <Link href="/admin/products/new" className="underline">
              add one first
            </Link>
            .
          </p>
        )}
        <form action={createLandingPage} className="flex flex-col gap-4">
          <TextField name="name" label="Name" required />
          <TextField name="slug" label="Slug" placeholder="trimmer-a" required />
          <SelectField
            name="product_id"
            label="Product"
            options={productOptions}
            required
            emptyLabel="Select a product…"
          />
          <SelectField name="status" label="Status" defaultValue="draft" options={STATUS_OPTIONS} required />
          <div className="flex gap-2">
            <SubmitButton pendingText="Creating…">Create landing page</SubmitButton>
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
