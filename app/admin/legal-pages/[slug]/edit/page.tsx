import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { getLegalPage, type LegalPageSlug } from "@/lib/legal-pages";
import { updateLegalPage } from "../../actions";

// Same reasoning as app/admin/landing-pages/[id]/edit/page.tsx — the
// page-by-slug lookup below is always fresh, never cached.
export const instant = false;

const VALID_SLUGS: LegalPageSlug[] = ["privacy", "affiliate-disclosure"];

export default async function EditLegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug as LegalPageSlug)) notFound();

  const page = await getLegalPage(slug as LegalPageSlug);
  const updateLegalPageWithSlug = updateLegalPage.bind(null, page.slug);

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-2xl flex-1">
        <h1 className="font-bold text-2xl">Edit /{page.slug}</h1>
        <form action={updateLegalPageWithSlug} className="flex flex-col gap-4">
          <TextField name="title" label="Title" defaultValue={page.title} required />
          <TextAreaField name="body" label="Body" defaultValue={page.body} rows={18} required />
          <div className="flex gap-2">
            <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
            <Button asChild variant="outline">
              <Link href="/admin/legal-pages">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
      <HelpPanel
        title="About Legal pages"
        description="Plain text, not full markdown or HTML — an admin textarea shouldn't be able to inject arbitrary markup into a public page."
        fields={[
          { name: "Title", help: "The page's <h1>, shown at the top." },
          { name: "Body", help: "Separate paragraphs with a blank line. A line starting with \"## \" (two hashes, then a space) renders as a subheading — everything else renders as a paragraph." },
        ]}
      />
    </FormLayout>
  );
}
