import Link from "next/link";

// A real in-app reference, not just something in ARCHITECTURE.md — so
// "what does this page do" and "why did I get this error" have an answer
// inside the app itself. Deliberately long and scroll-y rather than
// split into many pages: one Ctrl+F-able document beats a maze of links.
export default function HelpPage() {
  return (
    <div className="flex flex-col gap-10 max-w-3xl pb-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-2xl">Help &amp; workflow guide</h1>
        <p className="text-sm text-muted-foreground">
          What this app does, what every page is for, and what to do when
          something looks broken. See also{" "}
          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            ARCHITECTURE.md
          </span>{" "}
          in the project folder for the full technical + compliance detail
          behind all of this.
        </p>
      </div>

      <nav className="border rounded-md p-4 bg-muted/30 text-sm">
        <div className="font-medium mb-2">On this page</div>
        <ol className="list-decimal list-inside flex flex-col gap-1 text-muted-foreground">
          <li><a className="underline" href="#big-picture">The big picture</a></li>
          <li><a className="underline" href="#pages">Every dashboard page, in the order you&apos;d use them</a></li>
          <li><a className="underline" href="#public">The public pages (what a visitor sees)</a></li>
          <li><a className="underline" href="#walkthrough">Full walkthrough: publish your first product</a></li>
          <li><a className="underline" href="#troubleshooting">Troubleshooting</a></li>
          <li><a className="underline" href="#compliance">Compliance reminders</a></li>
        </ol>
      </nav>

      <section id="big-picture" className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl">1. The big picture</h2>
        <p>
          There are exactly two kinds of people who ever touch this app:
        </p>
        <ul className="list-disc list-inside flex flex-col gap-1">
          <li>
            <strong>You</strong> — log in, use everything under{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/admin</code>.
          </li>
          <li>
            <strong>A stranger who clicked a Meta ad</strong> — never logs
            in, only ever sees a product page and gets redirected to
            Amazon. They have no idea `/admin` exists.
          </li>
        </ul>
        <p>
          Everything you do in the dashboard is private and has zero
          effect on the outside world <em>until</em> you explicitly
          publish a Landing Page. That&apos;s the one switch that makes
          something real. Until then, experiment freely.
        </p>
        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`Products → Offers → Landing pages → (visitor sees the page) → /go redirect → Amazon
    ↓
Audiences → Creatives → Campaigns → Metrics → Analytics`}
        </pre>
      </section>

      <section id="pages" className="flex flex-col gap-5">
        <h2 className="font-semibold text-xl">
          2. Every dashboard page, in the order you&apos;d use them
        </h2>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/products" className="underline">Products</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            &quot;What am I promoting?&quot; The anchor everything else attaches
            to. Just a name, price, category — no links yet. Its{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">status</code>{" "}
            (research → shortlisted → testing → winner/killed) is just for
            your own tracking; nothing in the app enforces it.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/offers" className="underline">Offers</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            &quot;Where can someone actually buy it?&quot; One product can have
            several (Amazon, Flipkart...). This is where the real affiliate
            URL goes, and where the <strong>&quot;Paid traffic allowed&quot;</strong>{" "}
            checkbox lives — leave it off until you&apos;ve actually confirmed
            (in writing, from Amazon) that Meta ads are allowed for it. This
            single checkbox is what stops a real ad from ever reaching an
            unconfirmed offer, no matter what else is set up.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/audiences" className="underline">Audiences</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            &quot;Who am I targeting?&quot; A description like &quot;Men 25-34, India,
            into convenience&quot; — so Campaigns and Experiments have something
            specific to point at instead of &quot;everyone.&quot;
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/creatives" className="underline">Creatives</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            &quot;What does the ad actually say?&quot; Hook, angle, call-to-action —
            the copy you&apos;d paste into Meta Ads Manager. Linked to a
            product.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/campaigns" className="underline">Campaigns</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            &quot;The ad I&apos;m actually running (or planning).&quot; Ties a Product +
            Creative + Audience + budget together, purely for your own
            record-keeping — this app doesn&apos;t talk to Meta&apos;s API.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/landing-pages" className="underline">Landing pages</Link>{" "}
            <span className="text-xs text-muted-foreground font-normal">— the important one</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            This is what turns a Product into an actual public URL. Give it
            a <code className="text-xs bg-muted px-1 py-0.5 rounded">slug</code>{" "}
            (e.g. <code className="text-xs bg-muted px-1 py-0.5 rounded">trimmer-a</code>)
            and it controls two public URLs at once:{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/trimmer-a</code>{" "}
            (the page) and{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/go/trimmer-a</code>{" "}
            (the redirect). Both stay 404 until you set{" "}
            <strong>status to &quot;published&quot;</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/experiments" className="underline">Experiments</Link>{" "}
            <span className="text-xs text-muted-foreground font-normal">— optional</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Write down an A/B hypothesis before testing two Creatives
            against each other — control vs. variant, a primary metric, and
            a conclusion once it&apos;s done. Turns &quot;I think X works better&quot;
            into something you can look back on.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/metrics" className="underline">Metrics</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            After a campaign has run for a day, type in what Meta Ads
            Manager and Amazon Associates reported — one row per campaign
            per day. Manual by design; there&apos;s no live import yet.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/analytics" className="underline">Analytics</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            The &quot;is this actually working&quot; page. Reads Metrics + Campaigns
            to show profit by product/creative/audience, plus a view→click
            funnel from this app&apos;s own event tracking. Empty until Metrics
            has data in it.
          </p>
        </div>
      </section>

      <section id="public" className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl">3. The public pages (what a visitor sees)</h2>
        <ul className="list-disc list-inside flex flex-col gap-2">
          <li>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/[slug]</code> —
            the product page: name, price, image, and a &quot;Get the deal&quot;
            button — but <em>only</em> if a qualifying offer exists (active +
            paid-traffic-allowed). Otherwise it shows &quot;check back soon&quot;
            instead of a broken link.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/go/[slug]</code> —
            not a page, just a redirect. Records the click, then sends the
            visitor on to the real Amazon link.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/privacy</code>,{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/affiliate-disclosure</code> —
            required legal-ish pages, linked in every public page&apos;s
            footer. Still drafts — see the compliance section below.
          </li>
        </ul>
      </section>

      <section id="walkthrough" className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl">4. Full walkthrough: publish your first product</h2>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          <li>
            <Link href="/admin/products/new" className="underline">Products → Add new</Link> —
            e.g. &quot;Philips Beard Trimmer,&quot; ₹1,299.
          </li>
          <li>
            <Link href="/admin/offers/new" className="underline">Offers → Add new</Link> —
            pick that product, network &quot;amazon,&quot; use{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">https://example.com</code>{" "}
            as the URL for now. Leave &quot;Paid traffic allowed&quot; unchecked
            unless you&apos;re just testing locally.
          </li>
          <li>
            <Link href="/admin/landing-pages/new" className="underline">Landing pages → Add new</Link> —
            pick that product, type &quot;product,&quot; slug e.g.{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">trimmer-a</code>,
            status <strong>published</strong>.
          </li>
          <li>
            Visit <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/trimmer-a</code> —
            you should see the product page.
          </li>
          <li>
            Click &quot;Get the deal&quot; (only appears if you checked &quot;paid
            traffic allowed&quot; on the offer) — it should redirect to
            example.com.
          </li>
          <li>
            Check <Link href="/admin/analytics" className="underline">Analytics</Link> —
            you should see a view and a click counted for that product.
          </li>
        </ol>
      </section>

      <section id="troubleshooting" className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl">5. Troubleshooting</h2>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            &quot;SUPABASE_SERVICE_ROLE_KEY is not set&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Expected until you add it. Get it from Supabase dashboard →
            Project Settings → API → <strong>service_role</strong> key (not
            the anon/publishable one), add it to <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> as{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY=...</code>,
            then <strong>restart</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">npm run dev</code>{" "}
            — env file changes only take effect on server restart, not
            automatically.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            Terminal shows &quot;uncached data during prerendering&quot; /
            &quot;Cache Components&quot; warnings
          </p>
          <p className="text-sm text-muted-foreground">
            Harmless in development — an experimental Next.js 16 diagnostic
            about a feature this app deliberately opts out of for
            `/admin` (see <code className="text-xs bg-muted px-1 py-0.5 rounded">instant = false</code>{" "}
            in <code className="text-xs bg-muted px-1 py-0.5 rounded">app/admin/layout.tsx</code>).
            If the page still returned a 200 right above the warning,
            nothing is broken.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            &quot;Node.js 20 and below are deprecated&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Harmless for now — Supabase&apos;s library wants Node 22+
            eventually. Worth upgrading (<code className="text-xs bg-muted px-1 py-0.5 rounded">nvm install 22</code>)
            before this goes to production, not urgent today.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            &quot;That slug is already used&quot; / &quot;already a metrics row for
            this campaign on this date&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Not a bug — Landing page slugs must be unique, and Metrics only
            allows one row per campaign per day. Edit the existing one
            instead of adding a new one.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            A public page shows &quot;check back soon&quot; instead of &quot;Get the
            deal&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            By design — there&apos;s no offer for that product that&apos;s both{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">status: active</code> and{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">paid traffic allowed</code>.
            Check <Link href="/admin/offers" className="underline">Offers</Link>.
          </p>
        </div>
      </section>

      <section id="compliance" className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl">6. Compliance reminders</h2>
        <ul className="list-disc list-inside flex flex-col gap-1 text-sm text-muted-foreground">
          <li>Never put a real Amazon affiliate URL into an Offer until Stage 17 (see ARCHITECTURE.md) is fully closed out.</li>
          <li>Never check &quot;paid traffic allowed&quot; on a real offer without written confirmation from Amazon Associates support.</li>
          <li>&quot;/privacy&quot; and &quot;/affiliate-disclosure&quot; are drafts — get them reviewed before this site takes real traffic.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Full detail: see <code className="text-xs bg-muted px-1 py-0.5 rounded">ARCHITECTURE.md</code>{" "}
          → &quot;Compliance findings.&quot;
        </p>
      </section>
    </div>
  );
}
