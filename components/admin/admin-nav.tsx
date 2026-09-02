"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

// One nav-item list, one open/closed state, three consumers of it:
//   - <AdminNavTrigger>  the hamburger button in the header (lg and below)
//   - <AdminNavDrawer>   the slide-in panel it opens (lg and below)
//   - <AdminNavLinks>    the permanent sidebar's contents (lg and up)
// All three need to agree on "is the drawer open" without prop-drilling
// through app/admin/layout.tsx (a Server Component) — a small local
// context, scoped to just this file, is simpler than lifting state into
// the layout and threading it through three separate client islands.
const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/help", label: "Help & workflow" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/landing-pages", label: "Landing pages" },
  { href: "/admin/sections", label: "Home sections" },
  { href: "/admin/legal-pages", label: "Legal pages" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/import-export", label: "Import / Export" },
];

const DrawerContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Never leave the drawer open across a navigation — the most common way
  // a mobile drawer "looks broken" is it silently staying open (or a stale
  // backdrop staying interactive) after the link inside it was clicked.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return <DrawerContext.Provider value={{ open, setOpen }}>{children}</DrawerContext.Provider>;
}

function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within <AdminNavProvider>");
  return ctx;
}

export function AdminNavTrigger() {
  const { open, setOpen } = useDrawer();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="lg:hidden shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-accent"
    >
      {open ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// The mobile/tablet drawer: a backdrop + a fixed slide-in panel, both only
// present below `lg` (the permanent sidebar takes over above that — see
// app/admin/layout.tsx). Position/transition are plain CSS (translate-x),
// not a library — this app has no Dialog/Sheet primitive installed, and
// one screen's worth of nav links doesn't need one.
export function AdminNavDrawer() {
  const { open, setOpen } = useDrawer();

  return (
    <div className="lg:hidden">
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-background border-r p-4 flex flex-col gap-4 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Logo height={32} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>
        <AdminNavLinks onNavigate={() => setOpen(false)} />
      </div>
    </div>
  );
}
