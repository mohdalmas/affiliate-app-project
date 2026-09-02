import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  AdminNavProvider,
  AdminNavTrigger,
  AdminNavDrawer,
  AdminNavLinks,
} from "@/components/admin/admin-nav";
import { ToastProvider } from "@/components/admin/toast-provider";
import { Logo } from "@/components/logo";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

// Everything under /admin is admin-only. `lib/supabase/proxy.ts` already
// redirects logged-out visitors to /auth/login for any path outside "/",
// "/login" and "/auth" — this layout is just the shared header + nav shell
// for every admin page.
//
// Layout shape: a fixed-height sticky header (never grows/overflows —
// see AuthButton below for why that used to break on a long email) above
// a two-column area — a permanent sidebar from `lg` up, replaced by
// AdminNavDrawer's slide-in panel (opened via AdminNavTrigger's hamburger,
// in the header) below `lg`. Both read the same `AdminNavLinks` list, so
// there's exactly one place that defines the nav.
//
// `instant = false`: Next.js 16's "Cache Components" tries to prerender
// every route into a static shell at build time by default, which fails
// for anything reading a live session/cookies/params outside a <Suspense>
// boundary (usePathname() in the nav, every page's DB read keyed by the
// logged-in user, edit pages' dynamic [id]). None of that should ever be
// static for a single-admin dashboard, so this opts the whole /admin
// subtree out of that validation instead of wrapping ~20 pages in
// Suspense for no real benefit. See ARCHITECTURE.md and
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md.
export const instant = false;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminNavProvider>
        <div className="min-h-screen flex flex-col">
          {/* Fixed height, not just a min-height — a header that grows with
              its content (a long email address, a wrapped "Admin" label)
              is exactly what made this look broken before. Anything that
              doesn't fit at any width truncates or hides instead.
              Taller from `sm` up (h-20) to fit the same-size logo as the
              public site (height=56, same as PageShell) — the header also
              carries a hamburger + account controls the public header
              doesn't, so the logo is genuinely the same size everywhere
              there's room for it (sm and up); only below that does it
              shrink (className's h-10), or the row can't fit at all on a
              narrow phone. See components/logo.tsx's `className` doc. */}
          <header className="sticky top-0 z-30 h-16 sm:h-20 shrink-0 border-b bg-background">
            <div className="h-full flex items-center justify-between gap-3 px-3 sm:px-5">
              <div className="flex items-center gap-2 min-w-0">
                <AdminNavTrigger />
                <Link
                  href="/admin"
                  aria-label="Deals Junction — Admin"
                  className="flex items-center gap-2 min-w-0 shrink-0"
                >
                  <Logo height={56} priority className="h-10 sm:h-14 w-auto" />
                  <span className="hidden md:inline text-muted-foreground text-xs font-medium shrink-0">
                    Admin
                  </span>
                </Link>
              </div>
              <div className="min-w-0 shrink-0">
                {!hasEnvVars ? (
                  <EnvVarWarning />
                ) : (
                  <Suspense>
                    <AuthButton />
                  </Suspense>
                )}
              </div>
            </div>
          </header>

          <AdminNavDrawer />

          <div className="flex-1 w-full max-w-6xl mx-auto flex items-start gap-8 p-5">
            <aside className="hidden lg:block w-52 shrink-0 sticky top-20">
              <AdminNavLinks />
            </aside>
            <div className="flex-1 min-w-0">{children}</div>
          </div>

          <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10">
            <ThemeSwitcher />
          </footer>
        </div>
      </AdminNavProvider>
    </ToastProvider>
  );
}
