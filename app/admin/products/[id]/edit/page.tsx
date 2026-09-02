import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, SelectField, CheckboxField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../../actions";
import { PRODUCT_HELP_DESCRIPTION, PRODUCT_HELP_FIELDS } from "../../help";

const STATUS_OPTIONS = ["draft", "live", "archived"].map((value) => ({
  value,
  label: value,
}));

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
          <div className="grid grid-cols-2 gap-4">
            <TextField name="brand" label="Brand" defaultValue={product.brand} />
            <TextField name="category" label="Category" defaultValue={product.category} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="price" label="Price" type="number" step="0.01" defaultValue={product.price} />
            <TextField name="currency" label="Currency" defaultValue={product.currency} />
          </div>
          <TextField name="image_url" label="Image URL" type="url" defaultValue={product.image_url} />
          <TextField name="affiliate_url" label="Affiliate URL" type="url" defaultValue={product.affiliate_url} />
          <CheckboxField
            name="paid_traffic_allowed"
            label="Paid traffic (Meta ads) is confirmed allowed for this product"
            defaultChecked={product.paid_traffic_allowed}
          />
          <SelectField
            name="status"
            label="Status"
            defaultValue={product.status}
            options={STATUS_OPTIONS}
            required
          />
          <div className="flex gap-2">
            <SubmitButton>Save changes</SubmitButton>
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
