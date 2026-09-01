# Affiliate Lab — Architecture

## Concept

Turn Meta (Facebook/Instagram) paid traffic into **tracked, compliant**
Amazon Associates affiliate revenue — routed through your own site so every
click is measurable (which product, which ad, which audience), instead of
linking straight from an ad to Amazon.

```
Meta Ad ("Philips Trimmer ₹1,299")
        → yourdomain.com/go/philips-trimmer   (your own page, matches the ad)
        → record the click (product, campaign, creative, audience, UTMs)
        → 302 redirect
        → Amazon Special Link (the real, tagged affiliate URL)
```

Plus an admin dashboard (Products, Offers, Creatives, Campaigns,
Experiments, Metrics, Analytics) so you can see — per product, per
creative, per audience — whether spend is actually turning into commission.

### How this connects to `data-collection-app`

Not wired together yet, but worth keeping in mind: `data-collection-app`'s
own [ARCHITECTURE.md](../data-collection-app/ARCHITECTURE.md) (Stage 9)
already concludes that its demand data should be used to build **interest-
based audiences inside Meta Ads** — i.e. "here are the product categories
people actually want." This app is the landing/tracking/redirect layer
those Meta ads would point *at*. Longer-term shape:

```
data-collection-app          →  Meta Ads audience   →  affiliate-app-project
("people want trimmers")        (Meta builds this)     (/go/trimmer-a → Amazon)
```

## Compliance findings (read this before spending any ad budget)

This was researched against Amazon.in's Associates Operating Agreement,
its Participation Requirements, its Affiliate Disclosure Requirements, and
Meta's Advertising Standards. **This is careful reading of the published
rules, not legal advice** — platforms can change these agreements, and
only Amazon/Meta themselves can give a binding answer for your account.

| Question | Finding |
|---|---|
| Meta Ad → your site → Amazon | 🟢 Generally fine, **as long as** the ad accurately represents the product, the landing page matches the ad, the page is functional, and nothing disguises the real destination (no cloaking). |
| Amazon Associates + paid Meta traffic | 🟢 No current Amazon.in rule bans paid Meta/Instagram traffic. Amazon's restriction is specifically on **paid *search*** (bidding on keywords in a search engine) — Meta ads aren't keyword-search advertising, so they're a different category. |
| Your own `/go/product` → Amazon redirect | 🟡 Amazon's agreement explicitly defines and allows a "Redirecting Link" (an intermediate page before Amazon). Implement it so the destination is always the *same* product the ad promised — never route a Meta reviewer one place and real users another. |
| Direct Meta ad → Amazon affiliate link (skipping your site) | 🔴 Don't do this. Your own site should always be the landing page; it should contain/execute the Special Link, not the ad itself. |
| Disclosure | 🟢 Required. "As an Amazon Associate I earn from qualifying purchases" (site-wide, e.g. footer) plus clear per-page/per-link disclosure ("Paid link" / affiliate disclosure near recommendations). |
| Privacy policy | 🟢 Required — you're tracking clicks, so the site needs a policy covering analytics/cookies/affiliate links/third-party data, per Amazon's agreement. |
| Real-time order-level tracking (our click ID ↔ Amazon's order) | 🔴 Not available, and don't design around it. Amazon reports clicks/orders/commission at the *Special Link* level, not by handing back a purchaser identity mapped to your visitor ID. Combine the two datasets at the **campaign/product level**, not the individual level. |

**Before any real ad spend (this is a hard gate — see Stage 17 below):**
email Amazon Associates support the exact flow in writing and get a
written "yes," e.g.:

> "Can an Amazon.in Associate use paid Facebook/Instagram (Meta)
> advertisements to send users to the Associate's own website, where the
> website records the click and automatically redirects the user via a
> properly tagged Special Link to the advertised Amazon.in product?"

Also worth knowing going in: Amazon Associates typically requires a
handful of qualifying sales within a set window after you join or the
account can be closed — so don't create the Associates account until the
site (with real disclosure/privacy pages) is close to ready to actually
send traffic, rather than months in advance.

## Staged architecture

| Stage | Goal | Key components |
|---|---|---|
| **0 — Planning & compliance** | Decide the flow, read the rules, pick brand name/domain | This doc; no code |
| **1 — Project skeleton (this build)** | App runs locally | Next.js (App Router, TypeScript, Tailwind) + Supabase Auth starter (`create-next-app -e with-supabase`) |
| **2 — Database schema + RLS** | Real data model in a real Postgres | Supabase project; `products`, `affiliate_offers`, `audiences`, `creatives`, `campaigns`, `experiments`, `landing_pages`, `events`, `daily_metrics` (see below); Row Level Security policies |
| **3 — Admin auth** | Only you can reach the admin area | Wire the starter's existing login/sign-up pages to the real Supabase project; protect admin routes |
| **4 — Admin shell** | A place to work | Sidebar layout: Products / Offers / Creatives / Campaigns / Experiments / Metrics / Analytics |
| **5 — Products CRUD** | Manage what you might sell | Add/edit/list products, each with a `status` (research → shortlisted → testing → winner → killed) |
| **6 — Affiliate offers CRUD** | Link products to real merchant offers | Each offer carries `paid_traffic_allowed` — the compliance finding above lives *in the data*, not just in this doc |
| **7 — Creatives CRUD** | Track ad variants | Hook / angle / CTA / media per creative, linked to a product |
| **8 — Campaigns CRUD** | Track Meta campaigns | Links product + creative + audience + budget/dates |
| **9 — Experiments CRUD** | A/B hypotheses, not just vibes | Hypothesis, control vs. variant, primary metric, result/conclusion |
| **10 — Public pages** | What a real visitor sees | `app/[slug]/page.tsx` — a product page or a collection grid, driven by a new **Landing pages** CRUD section (`/admin/landing-pages`); plus draft `/privacy` and `/affiliate-disclosure` pages |
| **11 — Event tracking** | First-party data collection | Anonymous `al_sid` session cookie (set in `proxy.ts`), page views recorded server-side into `events` — no client JS |
| **12 — `/go/[slug]` redirect** | The actual money path | `app/go/[slug]/route.ts` — look up product → active + `paid_traffic_allowed` offer → record `affiliate_click` → 302 to the Special Link (still a placeholder URL until Stage 17) |
| **13 — Daily metrics** | Combine spend with results | `/admin/metrics` CRUD (`daily_metrics` per campaign per day); manual entry — Meta/Amazon report import is future work |
| **14 — Analytics dashboard** | See what's working | `/admin/analytics` — profit by product/creative/audience (from `daily_metrics` via campaigns) + a view→click funnel (from `events`) |
| **15 — Deploy** | Make it live | GitHub Actions (`.github/workflows/deploy.yml`) → Vercel (Hobby/free tier) on every push to `main`, gated on lint+tests passing first — see README.md "Deploying"; still placeholder affiliate links |
| **16 — Custom domain** | A real brand, not `*.vercel.app` | Buy `.com` at Cloudflare Registrar, point DNS at Vercel |
| **17 — Compliance gate** | Don't skip this | Amazon Associates account approved **and** written confirmation of the exact flow (see above) **and** disclosure/privacy pages live **before** swapping in real Special Links |
| **18 — First real Meta campaign** | Spend real money, on purpose | Only after Stage 17 is fully closed out |

**This build covers Stage 0–14, end to end**: the compliance research, the
Next.js + Supabase skeleton, the database schema + RLS, admin auth, the
sidebar, full CRUD for Products/Offers/Audiences/Creatives/Campaigns/
Experiments/**Landing pages**, the public product/collection pages,
first-party event tracking, the `/go/[slug]` redirect, Metrics, and
Analytics. **Audiences** and **Landing pages** aren't in the original
numbered list above — Campaigns/Experiments need an audience to pick from,
and the public pages + `/go/[slug]` both need a landing page to exist —
so both got added as their own dashboard sections alongside Stage 8 and
Stage 10 respectively. No real affiliate links anywhere yet — every offer
still needs its `paid_traffic_allowed` flag confirmed per the compliance
section before Stage 17, and every offer defaults to `https://example.com`
until then.

Every CRUD section follows the same shape, so once you understand one you
understand all six:

- `app/admin/<entity>/actions.ts` — Server Actions (`createX`,
  `updateX`, `deleteX`) that validate, write to Supabase, then
  `revalidatePath` + `redirect` back to the list
- `app/admin/<entity>/page.tsx` — Server Component: reads the table,
  renders it (RLS is what actually allows this query to return rows)
- `app/admin/<entity>/new/page.tsx` and `[id]/edit/page.tsx` — plain
  `<form action={serverAction}>`, no client-side JavaScript required
- Shared building blocks used by all six: `components/admin/form-fields.tsx`
  (Text/TextArea/Select/Checkbox), `components/admin/list-ui.tsx`
  (section header + description, empty state, status badge),
  `components/admin/delete-button.tsx` (confirm-then-delete),
  `components/admin/help-panel.tsx` (the "About this page" box beside
  every form), `lib/admin/form-data.ts` (FormData → payload helpers),
  `lib/admin/options.ts` (dropdown option fetchers for the foreign-key
  selects — product/creative/audience)

**In-app documentation, not just this doc.** Every list page's header has
a one-line `description` explaining what the table shows, and every
add/edit form has a `HelpPanel` beside it explaining the page and every
field in plain language — sourced from a per-entity `help.ts` (e.g.
`app/admin/products/help.ts`) shared between that entity's `new/` and
`[id]/edit/` pages so the two can't drift apart. When a later stage adds a
new form (Metrics, Analytics, or anything else), give it the same
treatment: a `help.ts` + `HelpPanel` + `FormLayout`, not just a bare form.

## Stages 10–14: the public side

```
Meta Ad → yourdomain.com/[slug]              (Stage 10 — the page)
              → records a page-view event     (Stage 11 — tracking)
              → visitor clicks "Get the deal"
              → yourdomain.com/go/[slug]       (Stage 12 — the redirect)
              → records an affiliate_click event
              → 302 → the real Amazon Special Link
```

**Landing pages drive both URLs.** A `landing_pages` row's `slug` is the
one identifier behind two routes: `app/[slug]/page.tsx` (the public page)
and `app/go/[slug]/route.ts` (the redirect). A `page_type: 'product'` page
shows one product with a "Get the deal" button; `'collection'` shows a
grid linking to every other published product page. Both stay unreachable
(404) until you set a landing page's status to `published` in the
dashboard.

**How public reads work without opening up RLS.** The earlier plan was to
add a narrow public SELECT policy on `products`/`landing_pages`. Instead,
`lib/supabase/service.ts` creates a **service-role client** (bypasses RLS
entirely) and every public page/route uses it — since these are Server
Components and a Route Handler, the key never reaches the browser. This
avoids adding any new RLS policies at all: `/admin`'s
"authenticated-only" policies from Stage 2 are unchanged. You have to add
`SUPABASE_SERVICE_ROLE_KEY` to `.env` yourself (Supabase dashboard →
Project Settings → API → service_role key) — see `.env.example`. Until
you do, `/[slug]` and `/go/[slug]` fail with a clear error telling you
exactly that, rather than a silent wrong answer.

**The compliance gate is enforced in code, twice**, not just documented:
both the product page (to decide whether to show a "Get the deal" button
at all) and `/go/[slug]` (right before redirecting) independently check
`affiliate_offers.status = 'active' AND paid_traffic_allowed = true`. If
no such offer exists, the visitor sees "check back soon" instead of a
dead 404 or — worse — a redirect to an offer nobody's confirmed is
allowed to receive paid traffic.

**Tracking is server-side, not a client-side beacon.** Every visitor gets
an anonymous session id (`al_sid` cookie, set once in `lib/supabase/proxy.ts`,
read via `lib/tracking/session.ts`) with no login involved. Page views and
clicks are recorded directly in the Server Component/Route Handler
(`lib/tracking/record-event.ts`) — no client-side JavaScript required,
which also means it isn't fooled by ad blockers the way a client-side
pixel would be. Known limitation: Next.js's link-prefetching could
technically double-count a view if you ever link between your own pages
with `<Link>` — not a concern for the primary case (cold traffic landing
directly from a Meta ad), so left as a known caveat rather than engineered
around.

**Metrics stay manual for now.** `/admin/metrics` is a normal CRUD
section (one row per campaign per day) — you copy numbers in from Meta
Ads Manager and Amazon Associates' own reporting by hand. Automating that
import is future work, not attempted here.

**Analytics is pure aggregation, no new data.** `/admin/analytics`
sums `daily_metrics` per campaign, then rolls that up by the campaign's
product/creative/audience (`lib/admin/analytics.ts`), plus a simple
view→click funnel computed directly from `events`. Everything shown there
is a straightforward sum/group of Stage 5–13's data — no external calls.

**`/privacy` and `/affiliate-disclosure` are drafts, not final copy.**
They exist so the *structure* is in place (a real page, linked from every
public page's footer) but the actual text needs real review before
Stage 17 — each page says so directly, in an on-page note.

## Testing

`npm test` (Vitest — pure-function unit tests for `lib/admin/form-data.ts`
and `lib/admin/analytics.ts`) and `npm run smoke` (route-reachability
checks against a running dev server). Neither touches Supabase or needs a
real session. See [TESTING.md](TESTING.md) for what each does and doesn't
cover, and the manual checklist for the rest (actually filling in and
submitting each form). `npm run verify` runs lint + build + unit tests
together.

One real bug this setup would have caught, and did lead to a fix: every
`TextField`/`SelectField` supported a `required` prop that blocks empty
submissions client-side, but `TextAreaField` didn't — so Experiments'
required Hypothesis field could be submitted empty, and the server-side
`throw new Error(...)` safety net showed a raw crash screen instead of
being unreachable. Fixed by adding `required` support to `TextAreaField`
itself, not just papering over that one field — check any new textarea
that's meant to be required actually passes `required`.

## Database schema (target shape, applied in Stage 2)

Nine tables, deliberately normalized so a product can have multiple
merchant offers, and every click can be traced back to the exact product,
campaign, creative, and audience that produced it:

```
products ──< affiliate_offers          (one product, many merchants/offers)
products ──< creatives >── campaigns ── audiences
products ──< landing_pages
events ──> product_id, campaign_id, creative_id, audience_id, landing_page_id
campaigns ──< daily_metrics
```

- `products` — what you might sell; `status` tracks it through
  research → shortlisted → testing → winner/killed
- `affiliate_offers` — the real merchant link + commission info;
  **`paid_traffic_allowed` (boolean)** is the compliance flag from above
- `audiences` — who you're targeting (age/gender/interest hypothesis)
- `creatives` — ad variants (hook/angle/CTA/media), linked to a product
- `campaigns` — links product + creative + audience + budget/dates
- `experiments` — hypothesis, control vs. variant, result, conclusion
- `landing_pages` — drives the public site: its `slug` is both
  `/[slug]` (the page) and `/go/[slug]` (the redirect); `status` must be
  `published` for either to be reachable
- `events` — the first-party click/view log (anonymous `session_id`, UTMs)
- `daily_metrics` — spend/commission/profit per campaign per day

The full `CREATE TABLE` SQL + RLS policies live in
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
with demo data in [`supabase/seed.sql`](supabase/seed.sql) — see
[`supabase/README.md`](supabase/README.md) for how to run them.

## Admin access

There is exactly **one** kind of logged-in user in this app: you, the
admin. Site visitors (Stage 10+) never log in — they just browse public
pages and get redirected to Amazon. So `/admin` sign-up is closed:

1. Supabase dashboard → **Authentication → Sign In / Providers** → turn
   off "Allow new users to sign up".
2. Supabase dashboard → **Authentication → Users → Add user** → create
   your one admin account there directly (email + password you choose).
3. Log in at `/auth/login` with that account.

The app's own sign-up page/form/route were removed (not just hidden) —
there's nothing left in the UI that points at self-serve sign-up. If a
second admin is ever needed, add them the same way (Stage 2/3's RLS
policies treat every authenticated user identically — there's no
per-admin permission split yet, and none is needed for one person).

## Important cautions carried forward into every later stage

- **Never** hardcode a real Amazon affiliate URL before Stage 17 closes.
  Use `https://example.com` placeholders so the whole app can be built and
  tested without risking a real Associates account.
- **Row Level Security**: still no "allow all" policies, and none were
  ever added beyond Stage 2's "authenticated only." Public reads/writes
  (the product pages, `/go/[slug]`) go through the service-role client
  instead — see "Stages 10–14" above. If you're ever tempted to add a
  public RLS policy to fix a "why can't the public page see this" bug,
  the real fix is almost certainly to use `createServiceClient()` there
  instead, not to open up RLS.
- **No 1:1 order mapping.** Don't design any feature around matching a
  specific click to a specific Amazon order — combine `events` (ours) and
  Amazon's own affiliate reporting (`daily_metrics`) at the
  campaign/product level only.
- **Disclosure and privacy pages** need to be live on the real domain
  before Stage 17 — not an afterthought bolted on right before launch.
- **Next.js 16's "Cache Components" prerenders every route by default at
  build time**, and fails the build if a route reads live data (cookies,
  a logged-in session, `params`, a client hook like `usePathname`) outside
  a `<Suspense>` boundary. `app/admin/layout.tsx` opts the entire
  `/admin` subtree out of this with `export const instant = false`,
  since none of it should ever be a static, pre-baked page for one admin
  user. Keep that export on the admin layout — don't remove it just
  because a future `next build` warns about it. Any genuinely public,
  cacheable page (Stage 10+) is a different story and can use `<Suspense>`
  properly instead of opting out. Run `npm run build` (not just `npm run
  dev`) after touching `/admin` — `next dev` doesn't do the static
  prerendering pass, so it won't catch this class of error.
- **`app/[slug]/page.tsx` always shows "◐ Partial Prerender" in `next
  build`'s output, even with `instant = false`** on both the page and
  `app/[slug]/layout.tsx`. Confirmed this is just how Cache Components
  labels any dynamic `[param]` route with no `generateStaticParams` (which
  we deliberately don't define — landing page slugs are created
  dynamically in the admin) — it is *not* evidence of the response being
  wrongly cached; confirmed in production that each request gets a fresh
  session cookie and correct per-slug content. One real, separate,
  low-severity thing that comes with it: a `notFound()` call here can't
  always force a genuine HTTP 404 once streaming has started — this is a
  documented general Next.js limitation (not specific to this app; see
  `node_modules/next/dist/docs/.../streaming.md`, "Status codes"),
  mitigated by Next.js itself injecting a `noindex` meta tag so search
  engines don't index a missing slug. A raw status-code check might still
  see 200 instead of 404 — known, not chased further.
- **`lib/supabase/proxy.ts` protects `/admin` only** (resolved at
  Stage 10 — it used to lock down everything except `/`, `/login*`,
  `/auth*`, which would have 404'd every real visitor at the login
  screen). If a future admin-only area gets added outside `/admin`,
  extend the `pathname.startsWith("/admin")` check rather than going
  back to a blacklist — a forgotten-to-list public path is a broken ad
  campaign; a forgotten-to-list admin path is a data leak. The same file
  also sets every visitor's anonymous `al_sid` tracking cookie — see
  `lib/tracking/session.ts`.
