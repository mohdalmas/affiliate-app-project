import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField, CheckboxField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { getProductOptions } from "@/lib/admin/options";
import { createOffer } from "../actions";
import { OFFER_HELP_DESCRIPTION, OFFER_HELP_FIELDS } from "../help";

const STATUS_OPTIONS = ["active", "paused", "expired"].map((value) => ({
  value,
  label: value,
}));

export default async function NewOfferPage() {
  const productOptions = await getProductOptions();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Add offer</h1>
        {productOptions.length === 0 && (
          <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
            No products yet —{" "}
            <Link href="/admin/products/new" className="underline">
              add one first
            </Link>
            , then come back here. You&apos;ll pick it from the dropdown
            below once it&apos;s saved.
          </p>
        )}
        <form action={createOffer} className="flex flex-col gap-4">
          <SelectField
            name="product_id"
            label="Product"
            options={productOptions}
            required
            emptyLabel="Select a product…"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="network" label="Network" placeholder="amazon" required />
            <TextField name="merchant" label="Merchant" placeholder="Amazon India" required />
          </div>
          <TextField name="affiliate_url" label="Affiliate URL" type="url" required placeholder="https://example.com" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="commission_percent" label="Commission %" type="number" step="0.001" />
            <TextField name="commission_fixed" label="Commission (fixed)" type="number" step="0.01" />
          </div>
          <TextField name="currency" label="Currency" defaultValue="INR" />
          <CheckboxField
            name="paid_traffic_allowed"
            label="Paid traffic (Meta ads) is confirmed allowed for this offer"
          />
          <p className="text-xs text-muted-foreground -mt-2">
            Leave unchecked until you&apos;ve actually confirmed this — see
            ARCHITECTURE.md&apos;s compliance findings and Stage 17.
          </p>
          <SelectField name="status" label="Status" defaultValue="active" options={STATUS_OPTIONS} required />
          <TextAreaField name="notes" label="Notes" />
          <div className="flex gap-2">
            <Button type="submit">Create offer</Button>
            <Button asChild variant="outline">
              <Link href="/admin/offers">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel title="About Offers" description={OFFER_HELP_DESCRIPTION} fields={OFFER_HELP_FIELDS} />
    </FormLayout>
  );
}
