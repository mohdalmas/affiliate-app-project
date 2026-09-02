import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { ToastProvider } from "@/components/admin/toast-provider";
import { Logo } from "@/components/logo";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

// Everything under /admin is admin-only. `lib/supabase/proxy.ts` already
// redirects logged-out visitors to /auth/login for any path outside "/",
// "/login" and "/auth" — this layout is just the shared header + sidebar
// shell for every admin page.
//
// `instant = false`: Next.js 16's "Cache Components" tries to prerender
// every route into a static shell at build time by default, which fails
// for anything reading a live session/cookies/params outside a <Suspense>
// boundary (the sidebar's usePathname(), every page's DB read keyed by the
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
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-12 items-center">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-24">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
              <Link href="/admin" aria-label="Deals Junction — Admin" className="flex items-center gap-3">
                <Logo height={56} priority />
                <span className="text-muted-foreground text-xs font-medium">Admin</span>
              </Link>
              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <Suspense>
                  <AuthButton />
                </Suspense>
              )}
            </div>
          </nav>
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-8 max-w-5xl p-5">
            <SidebarNav />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
          <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
            <ThemeSwitcher />
          </footer>
        </div>
      </main>
    </ToastProvider>
  );
}
