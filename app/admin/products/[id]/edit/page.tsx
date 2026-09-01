import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../../actions";
import { PRODUCT_HELP_DESCRIPTION, PRODUCT_HELP_FIELDS } from "../../help";

const STATUS_OPTIONS = [
  "research",
  "shortlisted",
  "testing",
  "winner",
  "killed",
  "archived",
].map((value) => ({ value, label: value }));

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit product</h1>
        <form action={updateProductWithId} className="flex flex-col gap-4">
          <TextField name="name" label="Name" defaultValue={product.name} required />
          <TextField name="brand" label="Brand" defaultValue={product.brand} />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="category" label="Category" defaultValue={product.category} />
            <TextField name="subcategory" label="Subcategory" defaultValue={product.subcategory} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="price" label="Price" type="number" step="0.01" defaultValue={product.price} />
            <TextField name="currency" label="Currency" defaultValue={product.currency} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="rating" label="Rating (0–5)" type="number" step="0.01" defaultValue={product.rating} />
            <TextField name="review_count" label="Review count" type="number" defaultValue={product.review_count} />
          </div>
          <TextField name="product_url" label="Product URL" type="url" defaultValue={product.product_url} />
          <TextField name="image_url" label="Image URL" type="url" defaultValue={product.image_url} />
          <SelectField
            name="status"
            label="Status"
            defaultValue={product.status}
            options={STATUS_OPTIONS}
            required
          />
          <TextAreaField name="hypothesis" label="Hypothesis" defaultValue={product.hypothesis} />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
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
