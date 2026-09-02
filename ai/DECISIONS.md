# Decisions

Dated, one paragraph each: what was decided, and why — so a later session
doesn't silently "fix" something that was actually a deliberate tradeoff.
Newest first. Add to this whenever a change involves a real tradeoff, not
just "what" but "instead of what, and why."

## 2026-09-02 — No generic CRUD abstraction for admin entities

Products, Landing pages, Home sections, and Legal pages all repeat the
same shape (actions.ts with `str`/`num`/`bool` payload + `redirectWithToast`,
a list page, new/edit pages, a help.ts). Deliberately did **not** factor
this into a generic `createCrudAdmin(config)` engine. Reasons: (1) each
entity's payload validation and relations are just different enough
(Sections' hand-picked-items sub-table, Legal pages' fixed two-slug set,
Products' commission fields) that a generic engine would need enough
escape hatches to lose most of its value; (2) this is explicitly a
single-admin app (see ARCHITECTURE.md) — the audience for "easy to add a
5th entity" is future Claude sessions reading a template, not a team
scaling to dozens of entities; a skill
(`.claude/skills/admin-entity/SKILL.md`) captures the recipe without
forcing a shared runtime abstraction. Revisit only if a 5th/6th entity
shows the pattern is actually varying less than expected.

## 2026-09-02 — Home sections: category-mapping + hand-picked, combined

A home section can auto-fill from a product `category` AND hold
hand-picked `home_section_items`, merged (hand-picked shown first, deduped
against the category pull) rather than being one or the other. Chosen over
a simpler "pick one mode per section" design because the real use case
(user's own request) was "map to a category, but also let me pin a couple
of specific ones" — e.g. a "Mens Workout" shelf that's 90% auto-pulled but
pins one manually-featured deal at the front.

## 2026-09-02 — `home_section_items` position uniqueness enforced at the DB

Added `unique(section_id, position)` (migration 0008) after two hand-picked
items ended up both at position 0 with no error or warning — ambiguous
ordering silently accepted read as a bug to the user. Enforcing it at the
DB (not just admin-UI validation) means it can never regress through the
API/CSV-import/anywhere else that writes this table later.

## 2026-09-02 — Toast feedback via `redirect()` + query param, not `useActionState`

Every admin mutation already used `<form action={serverAction}>` +
`redirect()` on success / `throw` on failure — no client form-state
library anywhere. Feedback was added by appending `?toast=message` to the
existing `redirect()` target (`lib/admin/toast-redirect.ts`) plus one
`/admin`-wide `error.tsx` boundary for thrown errors, instead of migrating
every action to React 19's `useActionState` (which would need a
`{ok, message}` return-value convention and a client wrapper per form).
Chosen because it's a ~5-line change per existing action instead of a
signature change to every action plus every calling form, and because
`redirect()`-then-crash-on-throw was already the codebase's pattern — this
extends it instead of replacing it with a second pattern living alongside
the first.

## 2026-09-02 — `DealSection` scrolls horizontally, not a wrapping grid

Went grid → grid-with-side-rails → single horizontally-scrollable row,
across three rounds of direct feedback. Landed on: one `DealSection`
component, used identically by the homepage shelves and the product
page's "More in category" shelf, always a `snap-x` scroll row. Don't
reintroduce a grid variant without checking this history first — it was
tried and explicitly reverted twice.

## 2026-09-02 — Product page (`ProductView`) is a single centered card

Also went single-column → side-by-side image/details + left/right related
rails → back to single-column, per direct feedback ("revert to single item
as before"). The "More in category" shelf stays, just as a `DealSection`
below the card rather than beside it. Don't re-introduce a multi-column
product page layout without checking this history first.

## 2026-09-02 — Theme: fonts/logo from one toolkit, layout from another

Two design-source toolkits existed at the repo root
(`deals-junction-website-toolkit/`, `dealsjunction-template3-toolkit/`)
plus a 4-template mockup image. Explicit user pick: fonts (Poppins/Inter)
+ logo identity from the first, Template 3's dense e-commerce grid layout
from the second. Reconciled into one token set in `app/globals.css` /
`tailwind.config.ts` rather than keeping either toolkit's CSS file — see
`CONTEXT.md`'s "Theme / design system" section for where the result lives.
Both source toolkits are kept as read-only reference, not deleted, in case
of a future re-theme — moved to `../design-reference/` (a sibling
directory, outside this git repo) on 2026-09-02 to keep the app repo
itself free of non-source clutter; see the entry below.

## 2026-09-02 — Design-source toolkits moved out of the repo

The two toolkit folders and the layout mockup PNG (the raw material for
the entry above) lived at the repo root, untracked by git, ~6MB of image
assets and reference HTML/CSS/EJS that are not part of the app and were
never meant to ship. Moved to `../design-reference/` (sibling of this
repo) rather than deleted — the theme work is done and consolidated into
`app/globals.css`/`tailwind.config.ts`/the logo SVGs, but keeping the
originals costs nothing and helps if a future re-theme wants to compare
against the source material again. This also made `npm run lint` clean
without the `--ignore-pattern` workaround (it was linting
`dealsjunction-template3-toolkit/app.js`, a `require()`-based Node script,
as if it were app code).

## 2026-09-02 — Legal page bodies: a tiny custom block format, not markdown/HTML

`legal_pages.body` is admin-editable free text rendered on a public page.
Rejected full markdown or HTML rendering (would let an admin-textarea
value inject arbitrary markup/links into a public page — low risk given
single-admin, but free) in favor of the smallest format that reproduces
the existing two pages: blank-line paragraphs + `## heading` lines. See
`lib/legal-pages.ts`'s `parseLegalBody`. Extend the format only if a real
page needs a block type it can't express, not preemptively.
