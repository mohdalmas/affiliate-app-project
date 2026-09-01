import Link from "next/link";
import { PageShell } from "@/components/public/page-shell";

// DRAFT — a structural starting point, not reviewed legal copy. Amazon's
// Associates agreement makes you responsible for disclosing how the site
// collects/uses/stores visitor data (see ARCHITECTURE.md's compliance
// findings); have this actually reviewed before Stage 17 sends any real
// traffic here. In particular: check India's DPDP Act obligations too,
// which this draft does not attempt to cover.
export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="prose prose-sm max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
          Draft placeholder — replace with reviewed copy before this site
          takes real traffic. See ARCHITECTURE.md, Stage 17.
        </p>
        <h2 className="text-lg font-semibold">What we collect</h2>
        <p>
          When you visit this site, we record basic technical information
          about your visit — which page you viewed, which link you
          clicked, the ad campaign that brought you here (if any), your
          browser&apos;s user agent, and an anonymous, randomly generated
          id stored in a cookie so we can tell repeat visits from new ones.
          We do not ask for or collect your name, email, or any other way
          to identify you personally.
        </p>
        <h2 className="text-lg font-semibold">Why we collect it</h2>
        <p>
          This is used only to understand which products, pages, and ads
          are actually useful to visitors, and to combine that with
          Amazon&apos;s own affiliate reporting at an aggregate level (see
          our{" "}
          <Link href="/affiliate-disclosure" className="underline">
            Affiliate Disclosure
          </Link>
          ). We do not sell this data.
        </p>
        <h2 className="text-lg font-semibold">Affiliate links and redirects</h2>
        <p>
          Some links on this site go through a redirect on our own domain
          before reaching Amazon or another merchant. That redirect
          records the click described above, then sends you on to the
          merchant&apos;s own tracked link — the merchant applies its own
          privacy policy to what happens after that.
        </p>
        <h2 className="text-lg font-semibold">Third parties</h2>
        <p>
          If we run paid advertising (Meta/Instagram), the ad platform
          applies its own privacy policy to how it delivers ads to you,
          separate from this site.
        </p>
      </div>
    </PageShell>
  );
}
