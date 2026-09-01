"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/help", label: "Help & workflow" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/audiences", label: "Audiences" },
  { href: "/admin/creatives", label: "Creatives" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/experiments", label: "Experiments" },
  { href: "/admin/landing-pages", label: "Landing pages" },
  { href: "/admin/metrics", label: "Metrics" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 w-full sm:w-44 shrink-0">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
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
