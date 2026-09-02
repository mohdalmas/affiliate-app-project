# Pending — live checklist

Keep this current: delete a line when it's actually done (migration run
and confirmed, copy reviewed, etc.), add one the moment something new is
deferred. This file being wrong is worse than it being short.

## Migrations not yet confirmed run against the real Supabase project

Nothing in this dev environment can run these — there's no live database
wired in here. Ask the user to confirm before assuming any schema below
0004 exists.

- [ ] `0005_home_sections.sql` — `home_sections`, `home_section_items`
- [ ] `0006_home_section_category.sql` — `home_sections.category`
- [ ] `0007_legal_pages.sql` — `legal_pages`, seeded
- [ ] `0008_section_item_position_unique.sql` — unique(section_id, position)
      on `home_section_items` — **will fail if any existing section
      already has two hand-picked items sharing a position**; fix those
      rows in the Table Editor first if so.

If asked to build a feature that touches `home_sections`/`legal_pages`,
don't assume the tables exist yet — the app code already has graceful
fallbacks (home-sections.tsx renders "All Deals" if the table's empty or
missing rows; legal pages fall back to hardcoded defaults), but a *new*
feature you add won't automatically get that safety net — add it
deliberately, the same way, if it reads either table.

## Deliberately deferred (not bugs, not forgotten)

- **Legal page copy** (`legal_pages` seed / `lib/legal-pages.ts` defaults)
  is still the original placeholder draft — needs actual legal review
  before real traffic, per `ARCHITECTURE.md` Stage 17. Now a content edit
  in `/admin/legal-pages`, not a code change.
- **Header search bar / category-pill strip** from the original Template 3
  design source were deliberately left out of `PageShell` — no search
  route or dynamic category nav exists yet, and a decorative one would be
  dead UI. Build the real thing (a `/search` route, or a category index
  page) before adding the header affordance for it, not the other way
  around.
- **Discount % / "original price" badges** on deal cards only render when
  the underlying data has them — `products` has no `discount_percent` or
  `original_price` column. Add the column + admin field first if this is
  wanted; don't fake it in the UI.
- **No generic CRUD abstraction** over the Products/Landing pages/Home
  sections/Legal pages pattern — deliberate, see `DECISIONS.md`. Don't
  build one without reading that entry first.

## Known stale doc

`ARCHITECTURE.md`'s "Concept" and early sections still describe the
pre-`0002_simplify.sql` model (Offers/Audiences/Creatives/Campaigns/
Experiments tables that no longer exist). Its compliance-findings section
is still accurate and important — don't skip that part. `ai/CONTEXT.md` is
the source of truth for current architecture; consider proposing an
`ARCHITECTURE.md` cleanup pass if it keeps causing confusion.
