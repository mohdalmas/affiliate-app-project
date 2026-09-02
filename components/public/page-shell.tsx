import Link from "next/link";
import { Logo } from "@/components/logo";
import { DisclosureFooter } from "./disclosure-footer";

// Shared chrome for every public (logged-out) page: the product/collection
// pages, /privacy, /affiliate-disclosure. Deliberately separate from
// app/admin/layout.tsx — this is what a real visitor sees, so it has
// no admin nav, no auth button, nothing that assumes a logged-in user.
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b h-14 flex items-center px-5">
        <Link href="/" aria-label="Deals Junction — home">
          <Logo height={28} priority />
        </Link>
      </nav>
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">{children}</main>
      <DisclosureFooter />
    </div>
  );
}
