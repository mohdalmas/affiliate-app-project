import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/admin/list-ui";
import { createClient } from "@/lib/supabase/server";
import { getLandingPageOptions, getCategoryOptions } from "@/lib/admin/options";
import {
  updateSection,
  addSectionItem,
  updateSectionItemPosition,
  removeSectionItem,
} from "../../actions";
import { SECTION_HELP_DESCRIPTION, SECTION_HELP_FIELDS } from "../../help";

// Same reasoning as app/admin/landing-pages/[id]/edit/page.tsx — the
// section-by-id lookup, its items, and getLandingPageOptions() below are
// always fresh, never cached.
export const instant = false;

const STATUS_OPTIONS = ["draft", "live"].map((value) => ({ value, label: value }));

type SectionItemRow = {
  id: string;
  position: number;
  landing_page: {
    name: string;
    slug: string;
    status: string;
    product: { name: string; status: string } | null;
  } | null;
};

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: section }, { data: itemsData }, landingPageOptions, categoryOptions] =
    await Promise.all([
      supabase.from("home_sections").select("*").eq("id", id).single(),
      supabase
        .from("home_section_items")
        .select(
          "id, position, landing_page:landing_pages(name, slug, status, product:products(name, status))",
        )
        .eq("section_id", id)
        .order("position", { ascending: true }),
      getLandingPageOptions(),
      getCategoryOptions(),
    ]);

  if (!section) notFound();

  const items = itemsData as unknown as SectionItemRow[] | null;
  const updateSectionWithId = updateSection.bind(null, id);
  const addSectionItemWithId = addSectionItem.bind(null, id);
  const nextPosition = (items?.length ?? 0) > 0
    ? Math.max(...(items ?? []).map((i) => i.position)) + 1
    : 0;

  return (
    <FormLayout>
      <div className="flex flex-col gap-8 max-w-2xl flex-1">
        <div className="flex flex-col gap-6">
          <h1 className="font-bold text-2xl">Edit home section</h1>
          <form action={updateSectionWithId} className="flex flex-col gap-4">
            <TextField name="title" label="Title" defaultValue={section.title} required />
            <TextField name="subtitle" label="Subtitle" defaultValue={section.subtitle} />
            <SelectField
              name="category"
              label="Category (optional — auto-fills the shelf)"
              defaultValue={section.category}
              options={categoryOptions}
              emptyLabel="— hand-pick items instead —"
            />
            <TextField
              name="position"
              label="Position"
              type="number"
              defaultValue={section.position}
            />
            <SelectField
              name="status"
              label="Status"
              defaultValue={section.status}
              options={STATUS_OPTIONS}
              required
            />
            <div className="flex gap-2">
              <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
              <Button asChild variant="outline">
                <Link href="/admin/sections">Back to sections</Link>
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-3 border-t pt-6">
          <h2 className="font-semibold text-lg">Hand-picked items</h2>
          <p className="text-sm text-muted-foreground -mt-2">
            {section.category
              ? `Shown first, before the rest of the "${section.category}" category this section auto-fills with.`
              : "This section has no Category set, so it only shows what you add here."}
          </p>
          {!items?.length ? (
            <EmptyState message="No hand-picked landing pages yet — add one below." />
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">Landing page</th>
                    <th className="p-3 font-medium">Position</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">
                          {item.landing_page?.product?.name ?? item.landing_page?.name ?? "—"}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          /{item.landing_page?.slug}
                          {item.landing_page?.status !== "live" && (
                            <> — page is {item.landing_page?.status}</>
                          )}
                          {item.landing_page?.product && item.landing_page.product.status !== "live" && (
                            <> — product is {item.landing_page.product.status}</>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <form
                          action={updateSectionItemPosition.bind(null, item.id, id)}
                          className="flex items-center gap-2"
                        >
                          <Input
                            name="position"
                            type="number"
                            defaultValue={item.position}
                            className="h-8 w-20"
                          />
                          <SubmitButton size="sm" variant="outline" pendingText="…">
                            Save
                          </SubmitButton>
                        </form>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end">
                          <DeleteButton
                            onDelete={removeSectionItem.bind(null, item.id, id)}
                            label="Remove"
                            confirmMessage="Remove this landing page from the section? The landing page itself is untouched."
                            successMessage="Removed from section"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form action={addSectionItemWithId} className="flex items-end gap-2 pt-2">
            <div className="flex-1">
              <SelectField
                name="landing_page_id"
                label="Add a landing page"
                options={landingPageOptions}
                required
                emptyLabel="Select a landing page…"
              />
            </div>
            <Input
              name="position"
              type="number"
              defaultValue={nextPosition}
              className="h-9 w-20"
              aria-label="Position"
            />
            <SubmitButton pendingText="Adding…">Add</SubmitButton>
          </form>
        </div>
      </div>
      <HelpPanel
        title="About Home sections"
        description={SECTION_HELP_DESCRIPTION}
        fields={SECTION_HELP_FIELDS}
      />
    </FormLayout>
  );
}
