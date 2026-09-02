import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, SelectField, CheckboxField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { createProduct } from "../actions";
import { PRODUCT_HELP_DESCRIPTION, PRODUCT_HELP_FIELDS } from "../help";

// Keep this in sync with the `status` check constraint in
// supabase/migrations/0002_simplify.sql.
const STATUS_OPTIONS = ["draft", "live", "archived"].map((value) => ({
  value,
  label: value,
}));

export default function NewProductPage() {
  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add product</h1>
        <form action={createProduct} className="flex flex-col gap-4">
          <TextField name="name" label="Name" required />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="brand" label="Brand" />
            <TextField name="category" label="Category" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="price" label="Price" type="number" step="0.01" />
            <TextField name="currency" label="Currency" defaultValue="INR" />
          </div>
          <TextField name="image_url" label="Image URL" type="url" />
          <TextField name="affiliate_url" label="Affiliate URL" type="url" placeholder="https://example.com" />
          <CheckboxField
            name="paid_traffic_allowed"
            label="Paid traffic (Meta ads) is confirmed allowed for this product"
          />
          <p className="text-xs text-muted-foreground -mt-2">
            Leave unchecked until you&apos;ve actually confirmed this — see
            ARCHITECTURE.md&apos;s compliance findings.
          </p>
          <SelectField
            name="status"
            label="Status"
            defaultValue="draft"
            options={STATUS_OPTIONS}
            required
          />
          <div className="flex gap-2">
            <SubmitButton pendingText="Creating…">Create product</SubmitButton>
            <Button asChild variant="outline">
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel
        title="About Products"
        description={PRODUCT_HELP_DESCRIPTION}
        fields={PRODUCT_HELP_FIELDS}
      />
    </FormLayout>
  );
}
