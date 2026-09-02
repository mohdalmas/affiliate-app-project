import Link from "next/link";
import { Logo } from "@/components/logo";

// Required on every public page per ARCHITECTURE.md's compliance section —
// Amazon Associates requires clear identification as an associate, and a
// visible affiliate disclosure. Styled as the dark footer from Template 3
// (dealsjunction-template3-toolkit) so it reads as the site's foundation,
// not an afterthought.
export function DisclosureFooter() {
  return (
    <footer className="w-full bg-ink text-ink-foreground/60 mt-12">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-foreground/10 pb-6">
          <Logo height={56} variant="dark" />
          <p className="flex gap-4 text-xs">
            <Link href="/affiliate-disclosure" className="underline hover:text-ink-foreground">
              Affiliate Disclosure
            </Link>
            <Link href="/privacy" className="underline hover:text-ink-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <p className="text-xs leading-relaxed">
            As an Amazon Associate, we earn from qualifying purchases. Deals
            Junction is an independent deal curator — when you buy through
            our partner links, we may earn a commission at no extra cost to
            you.
          </p>
          <p className="text-xs text-ink-foreground/40">
            &copy; Deals Junction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
