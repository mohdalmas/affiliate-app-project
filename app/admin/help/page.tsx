import Link from "next/link";

// A real in-app reference, not just something in ARCHITECTURE.md — so
// "what does this page do" and "why did I get this error" have an answer
// inside the app itself.
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
          in the project folder for the full technical + compliance detail.
        </p>
      </div>

      <nav className="border rounded-md p-4 bg-muted/30 text-sm">
        <div className="font-medium mb-2">On this page</div>
        <ol className="list-decimal list-inside flex flex-col gap-1 text-muted-foreground">
          <li><a className="underline" href="#big-picture">The big picture</a></li>
          <li><a className="underline" href="#pages">The three admin pages</a></li>
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
            in, only ever sees a product page and gets redirected to the
            affiliate link.
          </li>
        </ul>
        <p>
          Everything you do in the admin is private and has zero effect on
          the outside world <em>until two things are both true</em>: the
          Product is <strong>Live</strong> with{" "}
          <strong>Paid traffic allowed</strong> checked, and the Landing
          page pointing at it is also <strong>Live</strong>.
        </p>
        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`Product (Live + Paid traffic allowed + affiliate URL)
    +
Landing page (Live, points at that product)
    =
yourdomain.com/[slug] works, and yourdomain.com/go/[slug] redirects`}
        </pre>
      </section>

      <section id="pages" className="flex flex-col gap-5">
        <h2 className="font-semibold text-xl">2. The four admin pages</h2>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/products" className="underline">Products</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            What you&apos;re promoting — name, price, image, and the real
            affiliate link, all on one record. The{" "}
            <strong>&quot;Paid traffic allowed&quot;</strong> checkbox is the
            actual safety switch: leave it off until you&apos;ve confirmed
            (in writing, from Amazon) that Meta ads are allowed for it.
            Status is Draft / Live / Archived. Search and pagination (10 /
            50 / 100 rows) are built into the table. Have a lot to update at
            once? Use the{" "}
            <Link href="/admin/import-export" className="underline">
              Import / Export
            </Link>{" "}
            tab — one CSV, one row = a product and optionally its landing
            page together (leave every{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">landing_page_*</code>{" "}
            column blank for a product-only row). Rows with an{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">id</code>{" "}
            update that row, a blank <code className="text-xs bg-muted px-1 py-0.5 rounded">id</code>{" "}
            creates a new one.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/landing-pages" className="underline">Landing pages</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            Turns a Product into an actual public URL. Give it a{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">slug</code>{" "}
            (e.g. <code className="text-xs bg-muted px-1 py-0.5 rounded">trimmer-a</code>)
            and pick a product — that slug then controls two URLs:{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/trimmer-a</code>{" "}
            (the page) and{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/go/trimmer-a</code>{" "}
            (the redirect). Both need status <strong>Live</strong> to work.
            Same search/pagination as Products. Bulk-create these alongside
            their products in one go using{" "}
            <Link href="/admin/import-export" className="underline">
              Import / Export
            </Link>{" "}
            — see the Products entry above.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/sections" className="underline">Home sections</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            Curates the homepage itself — each section is a named shelf
            (&quot;Today&apos;s Verified Hot Deals&quot;, &quot;Last Minute
            Deals&quot;, ...) holding an ordered pick of Landing pages.
            Sections render top to bottom by Position; a section only shows
            up once it&apos;s <strong>Live</strong> and has at least one item
            whose landing page and product are both Live. No sections set up
            yet? The homepage falls back to one shelf of every Live landing
            page, same as before this existed.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/legal-pages" className="underline">Legal pages</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            Edits the copy on the public <code className="text-xs bg-muted px-1 py-0.5 rounded">/privacy</code>{" "}
            and <code className="text-xs bg-muted px-1 py-0.5 rounded">/affiliate-disclosure</code>{" "}
            pages — no code change needed. Plain text: blank line between
            paragraphs, a line starting with &quot;## &quot; becomes a
            subheading. Ships with draft copy — get it actually reviewed
            before this site takes real traffic (see ARCHITECTURE.md, Stage 17).
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin" className="underline">Dashboard</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            Views and affiliate clicks per product, straight from real
            visitor activity — nothing to configure or enter by hand. Empty
            until a Landing page is Live and someone actually visits it.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-medium">
            <Link href="/admin/import-export" className="underline">Import / Export</Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            One place for bulk CSV work on both Products and Landing pages
            together — export first to see the exact columns, edit in
            Excel/Sheets, then import the same file back.
          </p>
        </div>
      </section>

      <section id="public" className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl">3. The public pages (what a visitor sees)</h2>
        <ul className="list-disc list-inside flex flex-col gap-2">
          <li>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/</code> —
            the homepage: the Live{" "}
            <Link href="/admin/sections" className="underline">Home sections</Link>{" "}
            you&apos;ve set up, in order.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/[slug]</code> —
            one product&apos;s page: name, price, image, and a &quot;Get the
            deal&quot; button — but <em>only</em> if the product is Live with
            paid traffic allowed. Otherwise: &quot;check back soon&quot;
            instead of a broken link.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/go/[slug]</code> —
            not a page, just a redirect. Records the click, then sends the
            visitor on to the real affiliate URL.
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
            name it, set an affiliate URL (use{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">https://example.com</code>{" "}
            to test locally), check &quot;Paid traffic allowed&quot; only if
            you&apos;re just testing, and set status to <strong>Live</strong>.
          </li>
          <li>
            <Link href="/admin/landing-pages/new" className="underline">Landing pages → Add new</Link> —
            pick that product, slug e.g.{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">trimmer-a</code>,
            status <strong>Live</strong>.
          </li>
          <li>
            Visit <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/trimmer-a</code> —
            you should see the product page with a &quot;Get the deal&quot; button.
          </li>
          <li>
            Click it (or visit <code className="text-xs bg-muted px-1 py-0.5 rounded">yourdomain.com/go/trimmer-a</code>{" "}
            directly) — it should redirect straight to the affiliate URL.
          </li>
          <li>
            Check the <Link href="/admin" className="underline">Dashboard</Link> —
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
            The public pages and{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/go/[slug]</code>{" "}
            need this in <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code>{" "}
            (local) or as a deploy secret (production) — get it from Supabase
            → Project Settings → API → the <strong>secret</strong> key, then
            restart the dev server / redeploy.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            A landing page shows &quot;check back soon&quot; instead of &quot;Get the deal&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            By design — the product isn&apos;t both <strong>Live</strong> and{" "}
            <strong>Paid traffic allowed</strong>. Check{" "}
            <Link href="/admin/products" className="underline">Products</Link>.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            A landing page 404s
          </p>
          <p className="text-sm text-muted-foreground">
            The landing page itself needs status <strong>Live</strong>, not
            just the product — check{" "}
            <Link href="/admin/landing-pages" className="underline">Landing pages</Link>.
          </p>
        </div>

        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <p className="font-medium text-sm">
            &quot;That slug is already used&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Slugs must be unique across every landing page. Pick a
            different one, or edit the existing one instead.
          </p>
        </div>
      </section>

      <section id="compliance" className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl">6. Compliance reminders</h2>
        <ul className="list-disc list-inside flex flex-col gap-1 text-sm text-muted-foreground">
          <li>Never put a real affiliate URL into a Product until Stage 17 (see ARCHITECTURE.md) is fully closed out.</li>
          <li>Never check &quot;Paid traffic allowed&quot; on a real product without written confirmation from Amazon Associates support.</li>
          <li>
            <Link href="/admin/legal-pages" className="underline">/privacy and /affiliate-disclosure</Link>{" "}
            still hold draft copy — get them reviewed (and edit them there) before this site takes real traffic.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Full detail: see <code className="text-xs bg-muted px-1 py-0.5 rounded">ARCHITECTURE.md</code>{" "}
          → &quot;Compliance findings.&quot;
        </p>
      </section>
    </div>
  );
}
