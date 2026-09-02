import { PageShell } from "@/components/public/page-shell";
import { getLegalPage, parseLegalBody } from "@/lib/legal-pages";

// Content lives in the `legal_pages` table now, editable from
// /admin/legal-pages — see lib/legal-pages.ts. Still worth an actual
// legal review before this site takes real traffic (see ARCHITECTURE.md,
// Stage 17) — that's now a content edit in the admin, not a code change.
export const instant = false;

export default async function AffiliateDisclosurePage() {
  const page = await getLegalPage("affiliate-disclosure");
  const blocks = parseLegalBody(page.body);

  return (
    <PageShell>
      <div className="prose prose-sm max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{page.title}</h1>
        {blocks.map((block, i) =>
          block.type === "heading" ? (
            <h2 key={i} className="text-lg font-semibold">
              {block.text}
            </h2>
          ) : (
            <p key={i}>{block.text}</p>
          ),
        )}
      </div>
    </PageShell>
  );
}
