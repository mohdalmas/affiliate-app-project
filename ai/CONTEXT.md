# Context primer

Read this before making changes. It's the current, accurate picture —
where `ARCHITECTURE.md` at the repo root drifts (it still describes the
pre-`0002_simplify.sql` Offers/Campaigns/Experiments model in places),
this file wins. `ARCHITECTURE.md` is still the right place for compliance
research and the original product concept; this file is the right place
for "how is it actually built, right now."

## What this is

A Next.js + Supabase affiliate deal site ("Deals Junction"): admin curates
Products and Landing pages, a visitor lands on `/[slug]`, clicks through
`/go/[slug]` (recorded, then redirected to the real affiliate URL). One
admin user, no multi-tenant concerns, no public sign-up.

## Stack

Next.js 16 (App Router, **Cache Components** — see the `instant = false`
convention below), React 19, Tailwind 3 + shadcn-style primitives
(`components/ui/*`), Supabase (Postgres + Auth), Vitest, vanilla
`<form action={serverAction}>` for every admin mutation — no client-side
form state library anywhere.

## Data model (as of migration 0008 — see `supabase/migrations/`)

```
products            — what's promoted: name, brand, category, price,
                       image_url, affiliate_url, paid_traffic_allowed,
                       status (draft/live/archived), commission fields.
landing_pages        — the public /[slug] page: slug, product_id (required,
                       cascades on product delete), status (draft/live/archived).
                       Business rule (app-level, not a DB constraint — see
                       `app/admin/products/actions.ts`'s `deleteProduct`):
                       a product with a **Live** landing page can't be
                       deleted; Draft/Archived landing pages don't block it
                       and cascade-delete along with the product.
events               — click/view log, written via the service-role client only.
home_sections        — a named shelf on the homepage: title, subtitle,
                       category (optional — auto-fills the shelf), position,
                       status (draft/live).
home_section_items    — hand-picked (section, landing_page) pairs with a
                       position; unique per section on BOTH landing_page_id
                       and position (migration 0008 — no two hand-picked
                       items in one section may share a position).
legal_pages          — slug ('privacy' | 'affiliate-disclosure'), title,
                       body (plain text, see "Legal page body format" below).
```

RLS posture, everywhere: `authenticated full access` (this is a
single-admin app — anyone logged in is *the* admin), and public reads go
through `lib/supabase/service.ts`'s service-role client (bypasses RLS),
never a public policy. Read that file's comment before touching it.

Migrations are hand-run SQL files in `supabase/migrations/`, numbered,
applied by hand via the Supabase SQL editor (see `supabase/README.md` —
**always add a new numbered step there when adding a migration file**, or
it won't get run). There's no Supabase CLI / auto-migrate in this project.

## The "admin-managed everything" pattern

Products, Landing pages, Home sections, and Legal pages are all built the
same way on purpose — see
[`.claude/skills/admin-entity/SKILL.md`](../.claude/skills/admin-entity/SKILL.md)
for the exact recipe. Don't build a generic CRUD abstraction over this —
see `DECISIONS.md` for why the repetition is deliberate.

Shared pieces every entity's admin pages reuse:
- `components/admin/form-fields.tsx` — `TextField`/`TextAreaField`/`SelectField`/`CheckboxField`.
- `components/admin/list-ui.tsx` — `SectionHeader`/`EmptyState`/`StatusBadge`.
- `components/admin/help-panel.tsx` — `HelpPanel`/`FormLayout` (form + docs side by side).
- `components/admin/submit-button.tsx` — `SubmitButton`, pending state via `useFormStatus`.
- `components/admin/delete-button.tsx` — confirm + delete + **toasts the outcome** (see below).
- `lib/admin/form-data.ts` — `str`/`num`/`bool` FormData → payload helpers.
- `lib/admin/options.ts` — `getProductOptions`/`getLandingPageOptions`/`getCategoryOptions` for `<select>`s.
- `app/admin/<entity>/help.ts` — the copy shown in that entity's `HelpPanel`.

## Feedback pattern: toasts + error boundary

Every admin create/update action ends by calling
`redirectWithToast(path, message)` (`lib/admin/toast-redirect.ts`) instead
of a bare `redirect(path)` — it appends `?toast=...`, and
`components/admin/toast-provider.tsx` (mounted once in
`app/admin/layout.tsx`) picks that param up, shows it, then strips it from
the URL. `DeleteButton` doesn't need this — it's a direct client call, not
a form, so it awaits its own promise and toasts success/failure itself.

Thrown validation errors (`throw new Error("...")`) are caught by
`app/admin/error.tsx`, a `/admin`-wide error boundary — never let a form
action throw silently or you're back to Next's raw crash screen. Turn a
known Postgres conflict (unique constraint, `error.code === "23505"`) into
a specific message before throwing — see `friendlyError`/`friendlyItemError`
in the various `actions.ts` files for the pattern.

**Whenever you add a new mutating action: use `redirectWithToast` on
success, throw a friendly `Error` on failure. Both halves, always.**

## Public site conventions

- `components/public/page-shell.tsx` — chrome for every logged-out page
  (announcement bar, sticky navbar with the logo, `DisclosureFooter`).
  Every public page renders `<PageShell>{...}</PageShell>`.
- `components/public/deal-card.tsx` / `deal-section.tsx` — the reusable
  "one product" card and "one named shelf" wrapper. `DealSection` lays its
  children out as a horizontally-scrollable row (`snap-x`), not a grid —
  see DECISIONS.md for why grids were tried and reverted.
- `components/public/home-sections.tsx` — the homepage. Reads Live
  `home_sections` in Position order; each section's items are its
  hand-picked `home_section_items` (Live only) plus, if `category` is set,
  every other Live product in that category (deduped, hand-picked first).
  **Falls back** to one "All Deals" shelf of every Live landing page if no
  section is Live yet — the homepage must never render blank.
- `components/public/related-products.tsx` — wraps `ProductView` with a
  "More in `<category>`" `DealSection` underneath, on `/[slug]`.
- `lib/legal-pages.ts` — `getLegalPage`/`parseLegalBody` for `/privacy` and
  `/affiliate-disclosure`. See "Legal page body format" below.

### Legal page body format

Not markdown, not HTML — deliberately restricted so an admin textarea
can't inject markup into a public page. Blank-line-separated blocks; a
block starting with `## ` renders as a subheading, everything else as a
paragraph. Extend `parseLegalBody` in `lib/legal-pages.ts` if you need a
new block type — don't reach for a markdown lib for two static pages.

## Theme / design system

Consolidated from two design-source toolkits that originally sat at the
repo root and have since been moved out to keep this repo to just app
code — they now live at `../design-reference/` (a sibling of this repo,
not inside it: `deals-junction-website-toolkit/`,
`dealsjunction-template3-toolkit/`, plus the Template 3 layout mockup
image), kept as read-only reference material, not imported into the app,
not tracked by this repo's git. The
resulting tokens live in `app/globals.css` (`:root`/`.dark` HSL variables)
and `tailwind.config.ts` (`fontFamily.sans`/`.heading`, `success`/`ink`
color tokens, the `sm`/`md`/`lg` radius scale). Brand mark: `public/logo.svg`
(light, for white surfaces) / `public/logo-dark.svg` (dark surfaces) /
`app/icon.svg` (favicon) — all hand-authored SVG, not exported from the
toolkits' PNGs. `components/logo.tsx`'s `variant` prop picks between them.

Fonts: Poppins (`--font-poppins`, headings/display) + Inter
(`--font-inter`, body/UI), loaded in `app/layout.tsx` via `next/font`.

If asked to reskin/rebrand: change the CSS variables and the two logo
SVGs, not the component markup — the component layer reads tokens, it
doesn't hardcode colors/fonts.

## `instant = false`

Next.js 16's Cache Components tries to statically prerender every route by
default. Every route here that reads a live session, cookies, searchParams,
or does a per-request DB read sets `export const instant = false` — this
is not optional boilerplate, copy it onto any new dynamic route (see the
comment in `app/admin/layout.tsx` for the full reasoning). A build that
throws `unstable value ... while prerendering` almost always means a new
route is missing this, or is calling something time-varying (`new Date()`,
`Math.random()`) directly in prerendered JSX.

## Verifying a change

```
npm run build   # catches Cache Components prerender errors — always run this
npm test        # vitest, lib/admin/*.test.ts
npm run lint    # plain eslint — clean now that the toolkit reference
                # material lives outside this repo (see "Theme / design
                # system" above); no --ignore-pattern needed any more.
```

There's no live Supabase project wired into this dev environment — a
migration can be written and reasoned about here, but **actually running
it against the real database is the user's step**. See `PENDING.md` for
which migrations are known to still need running.
