import { createServiceClient } from "@/lib/supabase/service";

export type LegalPageSlug = "privacy" | "affiliate-disclosure";

export type LegalPage = {
  slug: LegalPageSlug;
  title: string;
  body: string;
};

// Same draft copy the site originally shipped with — used only if
// migrations/0007_legal_pages.sql hasn't been run yet (or its seed row was
// deleted), so these two pages never just go blank.
const DEFAULTS: Record<LegalPageSlug, LegalPage> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    body: `## What we collect

When you visit this site, we record basic technical information about your visit — which page you viewed, which link you clicked, the ad campaign that brought you here (if any), your browser's user agent, and an anonymous, randomly generated id stored in a cookie so we can tell repeat visits from new ones. We do not ask for or collect your name, email, or any other way to identify you personally.

## Why we collect it

This is used only to understand which products, pages, and ads are actually useful to visitors, and to combine that with Amazon's own affiliate reporting at an aggregate level (see our Affiliate Disclosure). We do not sell this data.

## Affiliate links and redirects

Some links on this site go through a redirect on our own domain before reaching Amazon or another merchant. That redirect records the click described above, then sends you on to the merchant's own tracked link — the merchant applies its own privacy policy to what happens after that.

## Third parties

If we run paid advertising (Meta/Instagram), the ad platform applies its own privacy policy to how it delivers ads to you, separate from this site.`,
  },
  "affiliate-disclosure": {
    slug: "affiliate-disclosure",
    title: "Affiliate Disclosure",
    body: `As an Amazon Associate, we earn from qualifying purchases. When you click a product link on this site and buy something on Amazon, we may receive a small commission — at no extra cost to you.

We only link to products we've genuinely researched. Prices, availability, and offers shown here are set by the merchant (Amazon or otherwise), not by us, and can change after we publish a page.

Some links on this site go through a redirect on our own domain (a URL starting with /go/) before reaching the merchant's site. This lets us measure which pages and ads are useful to visitors — see our Privacy Policy for what that involves.`,
  },
};

// Public-facing read — no logged-in session on /privacy or
// /affiliate-disclosure, so this goes through the service-role client like
// every other public page (see lib/supabase/service.ts).
export async function getLegalPage(slug: LegalPageSlug): Promise<LegalPage> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("legal_pages")
    .select("slug, title, body")
    .eq("slug", slug)
    .maybeSingle();

  return (data as LegalPage | null) ?? DEFAULTS[slug];
}

// Body format: blank-line-separated blocks; a block starting with "## "
// is a subheading, everything else is a paragraph. Deliberately not real
// markdown/HTML — an admin textarea shouldn't be able to inject arbitrary
// markup into a public page.
export type LegalBlock = { type: "heading" | "paragraph"; text: string };

export function parseLegalBody(body: string): LegalBlock[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith("## ")
        ? { type: "heading" as const, text: block.slice(3).trim() }
        : { type: "paragraph" as const, text: block },
    );
}
