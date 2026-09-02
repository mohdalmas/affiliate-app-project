// Same reasoning as app/[slug]/layout.tsx and app/admin/layout.tsx — this
// reads a live session + queries the database on every request, so
// there's nothing to gain from Next.js trying to prerender it.
export const instant = false;

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
