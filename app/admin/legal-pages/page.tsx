import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/admin/list-ui";
import type { LegalPageSlug } from "@/lib/legal-pages";

// Same reasoning as app/admin/landing-pages/page.tsx — reads the database
// on every request, nothing to gain from prerendering it.
export const instant = false;

const PAGES: { slug: LegalPageSlug; description: string }[] = [
  {
    slug: "privacy",
    description: "Shown at /privacy, and linked from every public page's footer.",
  },
  {
    slug: "affiliate-disclosure",
    description: "Shown at /affiliate-disclosure, and linked from every public page's footer.",
  },
];

export default async function LegalPagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("legal_pages")
    .select("slug, title, updated_at");
  const bySlug = new Map((data ?? []).map((row) => [row.slug, row]));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Legal pages"
        description="The public /privacy and /affiliate-disclosure pages — edit their copy here instead of in code. Still worth an actual legal review before this site takes real traffic; see ARCHITECTURE.md, Stage 17."
      />

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Page</th>
              <th className="p-3 font-medium">Last updated</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PAGES.map(({ slug, description }) => {
              const row = bySlug.get(slug);
              return (
                <tr key={slug} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">/{slug}</div>
                    <div className="text-muted-foreground text-xs">{description}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row?.updated_at
                      ? new Date(row.updated_at).toLocaleString()
                      : "— using default draft copy —"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link href={`/${slug}`} target="_blank" className="text-sm hover:underline">
                        View
                      </Link>
                      <Link
                        href={`/admin/legal-pages/${slug}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
