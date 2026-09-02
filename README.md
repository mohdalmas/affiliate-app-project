# Deals Junction — V1 (Meta → your site → Amazon Associates)

A tracked affiliate funnel: Meta (Facebook/Instagram) ads point at pages on
**your own domain**, which record the click and then redirect to the real
Amazon Associates ("Special") link — so you can see, per product/creative/
audience, whether an ad actually turned into commission, instead of
linking straight from an ad to Amazon.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full staged plan — the
compliance research behind this approach (what Amazon/Meta's rules do and
don't allow), the database design, and every stage from here to a live
campaign. **Read the "Compliance findings" section before doing anything
with real ads or a real Amazon account** — there's a hard gate (Stage 17)
that has to happen before any real affiliate link goes live.

## What's implemented (Stage 0–14 of the architecture doc — the whole loop)

- The compliance research written up in `ARCHITECTURE.md`
- A working local project: Next.js (App Router, TypeScript, Tailwind) with
  the official Supabase Auth starter (`create-next-app -e with-supabase`)
- The database: 9 tables + Row Level Security, applied to a real Supabase
  project (`supabase/migrations/0001_init.sql`, see `supabase/README.md`)
- A real protected admin route at `/admin` — only loads for a logged-in
  user; sign-up is closed — there's exactly one admin (you), created
  directly in Supabase
- Full CRUD (add/edit/delete + list) for **Products, Offers, Audiences,
  Creatives, Campaigns, Experiments, Landing pages, Metrics**
- **Public pages** at `yourdomain.com/[slug]` (a product page or a
  collection grid) — reachable without logging in, driven by a published
  Landing page
- **`/go/[slug]`** — the actual redirect to Amazon, gated on the offer
  being both active and confirmed `paid_traffic_allowed`
- **Event tracking** — every visitor gets an anonymous session cookie;
  page views and affiliate clicks are recorded server-side, no client JS
- **`/admin/analytics`** — profit by product/creative/audience, plus a
  view→click funnel, computed from the data above
- Draft `/privacy` and `/affiliate-disclosure` pages (structure only — the
  actual text needs real review before Stage 17)

**Still no real affiliate links anywhere.** Every offer defaults to
`https://example.com` and `paid_traffic_allowed = false` — nothing sends
paid traffic anywhere until Stage 17's compliance gate is closed.

## One thing you need to do before the public pages work

The public pages and `/go/[slug]` read/write Supabase using a **service
role key** (bypasses Row Level Security — see ARCHITECTURE.md's "Stages
10–14" section for why). Get it from your Supabase dashboard → Project
Settings → API → **service_role key** (secret, not the anon/publishable
one), and add it to your `.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

Until you do, those two routes fail with a clear error telling you
exactly this — everything else (the admin area) works fine without it.

## Before you run this

You'll need the free Supabase project you already created connected via a
`.env` (or `.env.local`) file with `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — see `.env.example`. Without it,
the app still runs, but shows a "connect Supabase" notice instead of the
sign in/sign up buttons.

One thing worth knowing now: this was scaffolded with Node 20, and
Supabase's client library is starting to ask for Node 22+ (you'll see a
harmless `EBADENGINE` warning). It still runs fine — just something to fix
before this goes to production, e.g. via `nvm install 22`.

## Quickstart

```bash
cd affiliate-app-project
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in (see
"Admin access" in `ARCHITECTURE.md` for how the one account is created),
then visit [http://localhost:3000/admin](http://localhost:3000/admin).
Try **Products → Add new** — fill in a name, save, and it should show up
in the list; **Edit** and **Delete** both work the same way. The other
five sections (Offers, Audiences, Creatives, Campaigns, Experiments) work
identically.

## Try the whole loop yourself

1. Sign in, go to **Products → Add new**, create a real (or placeholder)
   product.
2. **Offers → Add new** — pick that product, fill in network/merchant/URL
   (use `https://example.com` for now), and check **"Paid traffic (Meta
   ads) is confirmed allowed"** — this is only for local testing; leave it
   unchecked for anything real until Stage 17.
3. **Landing pages → Add new** — pick that product, `page_type: product`,
   give it a slug (e.g. `test-product`), and set **status: published**.
4. Visit `http://localhost:3000/test-product` — you should see the
   product page with a "Get the deal" button.
5. Click it (or visit `http://localhost:3000/go/test-product` directly) —
   it should redirect to `https://example.com`.
6. Back in the admin area, check **Analytics** — you should see a
   `product_view` and an `affiliate_click` counted for that product.

## Testing

```bash
npm run verify   # lint + build + unit tests
npm run smoke    # route-level checks — needs `npm run dev` running separately
```

See [TESTING.md](TESTING.md) for what each layer actually checks (and, just
as important, what none of them check yet — the manual click-through
checklist at the bottom is worth doing after any real change).

## Project structure

```
affiliate-app-project/
├── app/
│   ├── auth/              # Login pages (from the Supabase starter)
│   ├── admin/             # Admin-only area (Stage 3+, was "dashboard")
│   ├── go/[slug]/         # The affiliate redirect (Stage 12)
│   ├── privacy/, affiliate-disclosure/   # Draft compliance pages (Stage 10)
│   └── [slug]/            # Public product/collection pages (Stage 10)
├── components/
│   ├── admin/             # Admin CRUD building blocks
│   ├── public/            # Public page shell + disclosure footer
│   └── ui/                # shadcn/ui primitives
├── lib/
│   ├── supabase/          # client.ts (browser), server.ts (cookie-based),
│   │                        service.ts (bypasses RLS, server-only)
│   ├── tracking/          # session cookie + event recording
│   └── admin/             # form-data/options/analytics helpers
├── supabase/               # SQL migrations + seed data (Stage 2) — see its README
├── scripts/smoke-test.mjs  # Route-reachability check — see TESTING.md
├── ARCHITECTURE.md         # Full staged plan + compliance research
├── TESTING.md              # What's tested, how to run it, what to check by hand
└── README.md               # This file
```

## Deploying (Stage 15)

`.github/workflows/deploy.yml` runs on every push to `main`: lint + unit
tests first, then — only if those pass — build and deploy to Vercel via
its CLI.

**GitHub Secrets are the single source of truth** for everything — nothing
needs to be separately configured in Vercel's dashboard. Needs six
repository secrets (GitHub repo → Settings → Secrets and variables →
Actions):

| Secret | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same page — the publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — the **secret** key (see ARCHITECTURE.md's "Stages 10–14" for why this is needed) |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token (scope: **Full Account**, not a specific team — a mismatched scope causes a "Project not found" error even with correct IDs) |
| `VERCEL_ORG_ID` | See below |
| `VERCEL_PROJECT_ID` | See below |

The workflow writes the three app secrets directly into the file
`vercel build` reads (`.env.production.local`) on every run — that's
what makes a runtime-only value like `SUPABASE_SERVICE_ROLE_KEY` actually
reach the deployed function, not just the build step. (An earlier version
of this workflow only exported these as the *build step's* shell
environment, which inlines `NEXT_PUBLIC_*` into the client bundle
correctly but does nothing for a value read at request time — that's what
caused a `SUPABASE_SERVICE_ROLE_KEY is not set` error on the live site
the first time this was set up. Fixed now — nothing needs to be
configured in Vercel's dashboard for this to work.)

Getting `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` right, the reliable way —
either from the project's own Settings → General page and your
account/team's Settings → General page in the browser, or, to avoid any
copy-paste ambiguity, from a one-time local link:

```bash
npm install --global vercel   # if you don't already have it
vercel login                  # opens a browser
vercel link                   # answer the prompts; link to the existing project
cat .vercel/project.json      # copy orgId and projectId from here
```

`.vercel/` is already gitignored — never commit it, and don't paste its
contents anywhere public.

Once all six GitHub secrets exist, any push to `main` deploys
automatically — check the **Actions** tab on GitHub to watch it run.
Still no real affiliate links after this — that's Stage 17,
after Stage 16 (custom
domain).
