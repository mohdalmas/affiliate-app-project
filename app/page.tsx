import { PageShell } from "@/components/public/page-shell";
import { HomeSections } from "@/components/public/home-sections";

// Same reasoning as app/[slug]/layout.tsx — this reads from the database
// on every request (which sections/products currently exist), so there's
// nothing to gain from Next.js trying to prerender it as static.
export const instant = false;

// This used to be the unmodified Next.js + Supabase starter template
// homepage (Sign in/Sign up buttons, "Next steps" checklist), then a
// single flat product grid — now a stack of admin-curated shelves (see
// app/admin/sections and components/public/home-sections.tsx). Admin
// login isn't linked from here at all; it's reachable at /admin for the
// one person who needs it.
export default function HomePage() {
  return (
    <PageShell>
      <HomeSections />
    </PageShell>
  );
}
