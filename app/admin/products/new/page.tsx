import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createProduct } from "../actions";
import { PRODUCT_HELP_DESCRIPTION, PRODUCT_HELP_FIELDS } from "../help";

// Keep this in sync with the `status` check constraint in
// supabase/migrations/0001_init.sql.
const STATUS_OPTIONS = [
  "research",
  "shortlisted",
  "testing",
  "winner",
  "killed",
  "archived",
].map((value) => ({ value, label: value }));

export default function NewProductPage() {
  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add product</h1>
        <form action={createProduct} className="flex flex-col gap-4">
          <TextField name="name" label="Name" required />
          <TextField name="brand" label="Brand" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="category" label="Category" />
            <TextField name="subcategory" label="Subcategory" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="price" label="Price" type="number" step="0.01" />
            <TextField name="currency" label="Currency" defaultValue="INR" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="rating" label="Rating (0–5)" type="number" step="0.01" />
            <TextField name="review_count" label="Review count" type="number" />
          </div>
          <TextField name="product_url" label="Product URL" type="url" />
          <TextField name="image_url" label="Image URL" type="url" />
          <SelectField
            name="status"
            label="Status"
            defaultValue="research"
            options={STATUS_OPTIONS}
            required
          />
          <TextAreaField name="hypothesis" label="Hypothesis" />
          <div className="flex gap-2">
            <Button type="submit">Create product</Button>
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
