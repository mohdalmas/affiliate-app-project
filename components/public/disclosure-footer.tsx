import Link from "next/link";

// Required on every public page per ARCHITECTURE.md's compliance section —
// Amazon Associates requires clear identification as an associate, and a
// visible affiliate disclosure. This is NOT the full disclosure/privacy
// text (see /privacy and /affiliate-disclosure) — just the always-visible
// footer line.
export function DisclosureFooter() {
  return (
    <footer className="w-full border-t text-xs text-muted-foreground py-6 px-4 flex flex-col items-center gap-2 text-center">
      <p>As an Amazon Associate, we earn from qualifying purchases.</p>
      <p className="flex gap-4">
        <Link href="/affiliate-disclosure" className="underline">
          Affiliate Disclosure
        </Link>
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}
