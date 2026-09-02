# Changelog

Session-level summary of what shipped, newest first. Not a commit log
(that's `git log`) — this is "what a returning session needs to know
happened," at the size of a few bullets per session.

## 2026-09-02 — Star ratings + MRP/discount pricing (not pushed yet)

- Migration `0010`: `products.rating`/`review_count`/`mrp`. **Not
  additive-safe** — see `PENDING.md`, this one breaks the homepage/product
  queries (silently, to their empty-state fallback) until it's run,
  unlike every other migration so far.
- New `components/public/star-rating.tsx` (partial-fill stars, CSS clip,
  no library) and `lib/pricing.ts`'s `discountPercent()` (shared,
  unit-tested — `mrp <= price` or either missing = no discount, not a
  0%/negative one).
- `DealCard`: discount badge pinned to the image's top-right corner, plus
  stars and a struck-through MRP next to the price. `ProductView`: stars
  + an inline "X% OFF" chip next to the price instead (see `DECISIONS.md`
  for why the two pages place the badge differently — matched each to its
  own reference screenshot).
- Admin: Products gets Rating/Review count/MRP fields (new + edit forms),
  a Rating column and inline MRP/discount on the list. Full CSV
  round-trip (export, import, sample template, `combined-csv.ts`
  validation + tests) for all three new fields.

## 2026-09-02 — Admin-editable announcement bar; admin header logo/email follow-up (not pushed yet)

- New `site_settings` table (migration `0009`, singleton row) +
  `/admin/settings`: the homepage announcement bar
  (`announcement_prefix`/`announcement_highlight`) is now admin-editable —
  `PageShell` reads it (falls back to the original copy if the table's
  missing/empty), drops the bar entirely if both fields are blank.
- Admin header logo bumped to `height={56}` (same asset/size as public)
  with a responsive *displayed* size via `components/logo.tsx`'s new
  `className` prop — equal to public from `sm` up; see `DECISIONS.md` for
  why literal equality at every phone width isn't physically possible in
  a row that also has a hamburger + account controls.
- `AuthButton`: the email is never `hidden` now (previously disappeared
  below `sm`) — always visible, truncated progressively by breakpoint
  instead. `LogoutButton` now `size="sm"` (its only call site is this
  header).

## 2026-09-02 — Admin header/nav rebuilt as header + sidebar + drawer (not pushed yet)

Reported: "admin panel is still not fixed and broken header positioning."
Root cause: the header was a fixed `h-24` flex row with no responsive
handling — a long email (`AuthButton`'s "Hey, {email}!") had nothing
stopping it from forcing the row wider/taller than the viewport, and the
nav (`SidebarNav`) was inline-stacked above the page content on any
screen narrower than `sm`, not a drawer.

- New `components/admin/admin-nav.tsx` replaces `sidebar-nav.tsx`: one
  `NAV_ITEMS` list feeding three consumers via a small local context —
  `AdminNavTrigger` (hamburger, header, `lg` and below),
  `AdminNavDrawer` (slide-in panel + backdrop, `lg` and below, closes
  itself on navigation), `AdminNavLinks` (the permanent sidebar, `lg` and
  up). No new dependency — plain `translate-x` CSS, this app has no
  Dialog/Sheet primitive installed and one nav list doesn't need one.
- `app/admin/layout.tsx`: fixed `h-16` sticky header (never grows), a
  `max-w-6xl` content row (permanent `aside` at `lg`+, drawer below it).
- `AuthButton`: the email greeting is now `hidden` below `sm` and
  `truncate`d above it — the actual overflow source.

Not committed/pushed — asked to test locally first this time (see
`DECISIONS.md`'s "audit vs. reproduce" entry from the CSS pass: this one
*was* a specific, reproducible layout bug, same as the dark-mode logo).

## 2026-09-02 — Logo disappearing in dark mode

Root cause (this one *was* reproducible, unlike the audit above): the
header/admin-nav `Logo` defaulted to `variant="light"` (dark ink text) —
fine for its `bg-card` background in light mode, but `bg-card` itself
flips dark under `.dark` (system dark mode included, since
`app/layout.tsx`'s `ThemeProvider` uses `defaultTheme="system"` +
`enableSystem`), leaving dark-ink text on a now-dark background. Fixed by
adding an `"auto"` variant (new default) to `components/logo.tsx`: renders
both SVGs, toggled by Tailwind's `dark:` variant (`dark:hidden` /
`hidden dark:block`) — pure CSS, no `useTheme()` hook, no hydration-flash
risk. `DisclosureFooter`'s explicit `variant="dark"` is untouched — its
`bg-ink` background is a deliberate constant, not theme-relative (see the
"ink" token decision), so it was never actually broken.

## 2026-09-02 — Cross-browser/mobile CSS hardening

Reported: "CSS breaking in other browsers/laptops/mobile" — no repro
details given, so this was an audit-and-harden pass (see `DECISIONS.md`)
rather than a fix for one pinpointed bug. Ask for a screenshot + browser/
device if it's still happening after this.

- `ProductView`'s image box (`aspect-square`) now has a `min-h-*` fallback
  — collapses to 0 height with no fallback on a browser/webview without
  `aspect-ratio` support.
- `DealSection`'s horizontal scroll row: added `overscroll-x-contain`
  (stops a horizontal swipe from also dragging the whole page) and
  `-webkit-overflow-scrolling: touch` (momentum scroll on older iOS
  Safari).
- Added an explicit `browserslist` to `package.json` (was relying on
  autoprefixer/Next's implicit default) — explicitly covers iOS 12+ and
  Android 6+ instead of an unstated "last 2 versions".

## 2026-09-02 — Downloadable sample CSV + first push

- `public/sample-data/product-import-template.csv` (3 example rows, all
  Draft/paid-traffic-off, safe to import as-is) linked from the
  Import/Export admin page as "Download sample CSV" — distinct from
  `sample-data/` at the repo root, which is dev-only smoke-test fixtures
  (see `TESTING.md`), not shipped to `public/`.
- First push of this session's work to `origin/main`.

## 2026-09-02 — Repo cleanup + product-delete guard

- Moved the two design-source toolkits and the layout mockup PNG out of
  the app repo to `../design-reference/` (sibling directory) — see
  `DECISIONS.md`. `npm run lint` no longer needs `--ignore-pattern`.
- `deleteProduct` now refuses (with a friendly error, not a raw Postgres
  constraint message) if the product has any **Live** landing page;
  deleting is fine once that landing page is Draft/Archived or removed.

## 2026-09-02 — Admin feedback: toasts + error boundary + position uniqueness

- `redirectWithToast` (`lib/admin/toast-redirect.ts`) + `ToastProvider`
  (`components/admin/toast-provider.tsx`, mounted in `app/admin/layout.tsx`):
  every admin create/update now shows a confirming toast; `DeleteButton`
  now awaits and toasts its own outcome instead of firing-and-forgetting.
- `app/admin/error.tsx`: thrown validation/conflict errors render as a
  readable card instead of Next's crash overlay.
- Migration `0008_section_item_position_unique.sql`: two hand-picked items
  in one home section can no longer share a Position.
- This `ai/` folder + `.claude/skills/admin-entity/` created.

## 2026-09-02 — Iteration on the public theme, per direct feedback

- Logo sizes bumped (header, footer, admin — all now the same size).
- `ProductView` reverted from side-by-side to single centered card, twice
  (see `DECISIONS.md`) — related-rails design abandoned.
- `DealSection` changed from a wrapping grid to a horizontally-scrollable
  row, used by both the homepage and the product page's "More in category"
  shelf.
- Home sections gained a `category` field (migration `0006`): a section
  can auto-fill from a product category, combinable with hand-picked items.
- `/privacy` and `/affiliate-disclosure` moved from hardcoded JSX to a
  `legal_pages` table, editable at `/admin/legal-pages` (migration `0007`).

## 2026-09-02 — Theme consolidation + admin-curated homepage sections

- Consolidated two design-source toolkits (fonts/logo from one, Template 3
  layout from the other — see `DECISIONS.md`) into `app/globals.css` /
  `tailwind.config.ts` tokens, new logo SVGs, restyled `PageShell`,
  `DisclosureFooter`, `ProductGrid`→`DealCard`/`DealSection`, `ProductView`.
  See `DECISIONS.md` for the toolkit reconciliation choice.
  Migrations `0005_home_sections.sql`: admin-curated named shelves on the
  homepage (`home_sections` + `home_section_items`), with a graceful
  fallback to one "All Deals" shelf when no section exists yet.
