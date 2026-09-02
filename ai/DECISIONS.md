# Decisions

## 2026-09-02 — Discount badge: pinned to the image on cards, inline near price on the product page

Asked for the discount badge "on the top right corner of product image"
for the homepage/grid — implemented literally as an absolutely-positioned
badge over `DealCard`'s thumbnail. The single product page
(`ProductView`) instead shows it as a small "X% OFF" chip inline next to
the price/MRP, not pinned to the image — the user's own reference
screenshot for the *product detail* page showed the discount as inline
text near the price (Amazon's pattern), not on the image, while their
*grid* reference showed it on the image corner (also Amazon's pattern,
for grid thumbnails). Matched each page to its own reference rather than
using one placement everywhere.

## 2026-09-02 — Star rating: two-layer CSS clip, not a library

`components/public/star-rating.tsx` renders a partial star fill (e.g.
4.3 stars) with a background row of outline stars and a foreground row
of filled stars clipped to `(rating/5)*100%` width — the standard
"overlay + overflow:hidden" trick — rather than a rating-widget
dependency. Same reasoning as everywhere else in this app: one small,
static piece of UI doesn't earn a new dependency.

## 2026-09-02 — Admin header logo: equal to public from `sm` up, smaller only below it

Asked for the admin header logo to be "equal to the public site" (both
use `height={56}`, the same asset). Public's header has *only* the logo
in that row; admin's also has a hamburger trigger and account controls
(email + Logout) in the same row. Literal pixel-equality at every width
is a hard physical conflict on the narrowest phones — a 56px-tall logo is
224px wide (fixed 4:1 aspect ratio), which alone consumes most of a
~350px mobile viewport once you add a hamburger button, leaving no room
for even a heavily-truncated email or a Logout button. Resolved by
scaling the *displayed* size responsively via `components/logo.tsx`'s new
`className` prop (`h-10 sm:h-14 w-auto` — 40px below `sm`, 56px from `sm`
up, i.e. equal to public everywhere except phone-portrait widths), rather
than silently ignoring the ask or breaking the header again. If asked for
literal equality at every width in the future: the only way to actually
get there is removing something else from that row on small screens
(e.g. moving account info into the drawer instead of the header) — flagged,
not implemented, since it wasn't asked for.

## 2026-09-02 — Site-wide editable text: one `site_settings` singleton row, not a generic key-value table

The homepage announcement bar became admin-editable
(`0009_site_settings.sql`) as two named columns
(`announcement_prefix`/`announcement_highlight`) on a single pinned-id
row, not a generic `settings(key text, value text)` table. A generic
table would handle "one more setting" with no migration, but loses typed
columns, per-field `NOT NULL`/`check` constraints, and a form that's just
two `TextField`s instead of a dynamic key list — not worth it for what is,
so far, one setting. Revisit as a real key-value table only once there are
enough of these that a migration-per-setting is actually the bottleneck,
not before.

## 2026-09-02 — "CSS breaking in other browsers" handled as an audit, not a repro fix

Reported with no browser/device/screenshot. There's no real-browser testing
tool available in this dev environment (no installed Playwright/
chromium-cli — confirmed, not assumed), so this couldn't be reproduced
directly. Response was a targeted audit of the diff for known
cross-browser CSS risk patterns (`aspect-ratio` without a fallback,
`dvh`/`svh` units, `:has()`/container queries, missing `browserslist`) and
fixing what that audit actually found, rather than guessing at one root
cause or claiming a fix that wasn't verified. If this comes up again: ask
for a screenshot and the specific browser/OS/device first — it narrows
"CSS breaking" from "audit everything" to "check this one thing" and
avoids repeating a scattershot fix.

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
