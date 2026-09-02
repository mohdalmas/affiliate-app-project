import { PageShell } from "@/components/public/page-shell";
import { ProductGrid } from "@/components/public/product-grid";

// Same reasoning as app/[slug]/layout.tsx — this reads from the database
// on every request (which published products currently exist), so there's
// nothing to gain from Next.js trying to prerender it as static.
export const instant = false;

// This used to be the unmodified Next.js + Supabase starter template
// homepage (Sign in/Sign up buttons, "Next steps" checklist) — replaced
// now that there's a real public site. Admin login isn't linked from
// here at all; it's reachable at /admin for the one person who needs it.
export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Deals Junction</h1>
          <p className="text-muted-foreground">
            Smart picks for everyday products.
          </p>
        </div>
        <ProductGrid />
      </div>
    </PageShell>
  );
}
