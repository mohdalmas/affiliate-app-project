import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteSection } from "./actions";

// Same reasoning as app/admin/landing-pages/page.tsx — this reads from the
// database on every request, nothing to gain from prerendering it.
export const instant = false;

type SectionRow = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  position: number;
  status: string;
  items: { count: number }[];
};

export default async function SectionsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_sections")
    .select("id, title, subtitle, category, position, status, items:home_section_items(count)")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load home sections: {error.message}
      </p>
    );
  }

  const sections = data as unknown as SectionRow[] | null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Home sections"
        description="Named shelves on the public homepage — each an ordered pick of landing pages. Drag order isn't built in; use Position (lower shows first) instead."
        addHref="/admin/sections/new"
      />

      {!sections?.length ? (
        <EmptyState message="No home sections yet. Add one, then add landing pages to it, and set it Live." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Position</th>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id} className="border-t">
                  <td className="p-3 text-muted-foreground">{section.position}</td>
                  <td className="p-3">
                    <div className="font-medium">{section.title}</div>
                    {section.subtitle && (
                      <div className="text-muted-foreground text-xs">{section.subtitle}</div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {section.category && (
                      <div className="text-xs">
                        Category: <span className="font-medium text-foreground">{section.category}</span>
                      </div>
                    )}
                    <div className="text-xs">
                      {section.items?.[0]?.count ?? 0} hand-picked
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={section.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/sections/${section.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        onDelete={deleteSection.bind(null, section.id)}
                        confirmMessage="Delete this section? Its items are removed too — the landing pages themselves are untouched."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
