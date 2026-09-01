import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SelectField, CheckboxField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { createClient } from "@/lib/supabase/server";
import { getProductOptions } from "@/lib/admin/options";
import { updateOffer } from "../../actions";
import { OFFER_HELP_DESCRIPTION, OFFER_HELP_FIELDS } from "../../help";

const STATUS_OPTIONS = ["active", "paused", "expired"].map((value) => ({
  value,
  label: value,
}));

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: offer }, productOptions] = await Promise.all([
    supabase.from("affiliate_offers").select("*").eq("id", id).single(),
    getProductOptions(),
  ]);

  if (!offer) notFound();

  const updateOfferWithId = updateOffer.bind(null, id);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Edit offer</h1>
        <form action={updateOfferWithId} className="flex flex-col gap-4">
          <SelectField
            name="product_id"
            label="Product"
            defaultValue={offer.product_id}
            options={productOptions}
            required
            emptyLabel="Select a product…"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="network" label="Network" defaultValue={offer.network} required />
            <TextField name="merchant" label="Merchant" defaultValue={offer.merchant} required />
          </div>
          <TextField name="affiliate_url" label="Affiliate URL" type="url" defaultValue={offer.affiliate_url} required />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="commission_percent" label="Commission %" type="number" step="0.001" defaultValue={offer.commission_percent} />
            <TextField name="commission_fixed" label="Commission (fixed)" type="number" step="0.01" defaultValue={offer.commission_fixed} />
          </div>
          <TextField name="currency" label="Currency" defaultValue={offer.currency} />
          <CheckboxField
            name="paid_traffic_allowed"
            label="Paid traffic (Meta ads) is confirmed allowed for this offer"
            defaultChecked={offer.paid_traffic_allowed}
          />
          <SelectField name="status" label="Status" defaultValue={offer.status} options={STATUS_OPTIONS} required />
          <TextAreaField name="notes" label="Notes" defaultValue={offer.notes} />
          <div className="flex gap-2">
            <Button type="submit">Save changes</Button>
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
