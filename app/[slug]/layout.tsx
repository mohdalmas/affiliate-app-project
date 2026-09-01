// This route always shows "◐ Partial Prerender" in `next build`'s output,
// even with `instant = false` here and on the page itself — confirmed
// that's just how Next.js 16's Cache Components labels any dynamic
// `[param]` route with no `generateStaticParams` (it can't build a real
// static shell without knowing valid slugs ahead of time, which we
// deliberately don't do — landing pages are created dynamically in the
// admin). It is NOT evidence of unwanted caching: confirmed in production
// that each request gets a fresh session cookie and correct per-slug
// content. `instant = false` stays here anyway, for the same explicit
// "this is never static" intent as app/admin/layout.tsx.
//
// One real, separate, low-severity thing this route inherits from Next.js
// itself (not specific to this app): a notFound() call can't always force
// a genuine HTTP 404 once the response has started streaming — Next.js
// documents this and mitigates it by injecting a noindex meta tag instead
// (see node_modules/next/dist/docs/01-app/02-guides/streaming.md,
// "Status codes"). Search engines won't index a missing slug; a script
// checking the raw status code might see 200. Not chased further here.
export const instant = false;

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
