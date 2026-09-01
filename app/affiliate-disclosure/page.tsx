import Link from "next/link";
import { PageShell } from "@/components/public/page-shell";

// DRAFT — a structural starting point, not reviewed legal copy. Amazon's
// Associates agreement requires clear/conspicuous disclosure (see
// ARCHITECTURE.md's compliance findings); have this actually reviewed
// before Stage 17 sends any real traffic here.
export default function AffiliateDisclosurePage() {
  return (
    <PageShell>
      <div className="prose prose-sm max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Affiliate Disclosure</h1>
        <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
          Draft placeholder — replace with reviewed copy before this site
          takes real traffic. See ARCHITECTURE.md, Stage 17.
        </p>
        <p>
          As an Amazon Associate, we earn from qualifying purchases. When
          you click a product link on this site and buy something on
          Amazon, we may receive a small commission — at no extra cost to
          you.
        </p>
        <p>
          We only link to products we&apos;ve genuinely researched. Prices,
          availability, and offers shown here are set by the merchant
          (Amazon or otherwise), not by us, and can change after we publish
          a page.
        </p>
        <p>
          Some links on this site go through a redirect on our own domain
          (a URL starting with <code>/go/</code>) before reaching the
          merchant&apos;s site. This lets us measure which pages and ads
          are useful to visitors — see our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          for what that involves.
        </p>
      </div>
    </PageShell>
  );
}
