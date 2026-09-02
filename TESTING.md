# Testing

Three layers, each catching a different class of mistake. None of them
require a real Amazon account or real ad spend — they're safe to run any
time, against local data.

## 1. `npm run lint` + `npm run build` — does the code even work?

Catches typos, type errors, and (importantly, for this Next.js version)
routes that would fail to prerender in production. **Always run
`npm run build`, not just `npm run dev`**, after touching anything under
`/admin` or the public `[slug]` page — dev mode doesn't do the static
prerendering pass that catches the "Cache Components" class of error (see
ARCHITECTURE.md's caution about `instant = false`).

```bash
npm run lint
npm run build
```

## 2. `npm test` — is the calculation logic correct?

Unit tests for the pure, no-database functions — the kind of code where a
subtle bug (wrong sign, wrong null handling, dropped rows) is easy to miss
by eye and easy to catch with a test:

- `lib/admin/form-data.test.ts` — the FormData → payload helpers every
  single create/edit form in the app relies on
- `lib/admin/analytics.test.ts` — the profit/grouping math behind
  `/admin/analytics`

```bash
npm test          # run once
npm run test:watch  # re-run on save, while you're working on lib/admin/*
```

These don't touch Supabase, don't need the dev server running, and don't
need your `.env` configured at all.

## 3. `npm run smoke` — are the routes wired up correctly?

Checks that every known page returns the *expected* status code: public
pages 200, admin pages 307 (redirect to login) when logged out, a
nonexistent slug 404. This is what would have caught, for example, an
admin page accidentally becoming reachable without login, or a public
page accidentally requiring it.

Needs the dev server running first:

```bash
npm run dev        # in one terminal
npm run smoke      # in another
```

One check (a nonexistent slug should 404) will fail with a 500 instead
until you've added `SUPABASE_SERVICE_ROLE_KEY` to `.env` — see the README.
Everything else should pass regardless.

## `npm run verify` — the first three in one command

Runs lint + build + unit tests back to back (not the smoke test, since
that needs a separately-running server):

```bash
npm run verify
```

## What none of this covers (do this by hand)

There's no automated test that actually fills in a form, clicks submit,
and checks the right row appears in Supabase — that would need a test
Supabase project, an authenticated browser session, and cleanup after
each run, which is more infrastructure than this project needs yet. Until
then, manually click through:

- [ ] For each of Products / Landing pages: add one, edit it, delete it.
      Confirm the list updates each time.
- [ ] After editing a row, click **Edit** on that same row *again* — it
      should show the value you just saved, not the old one. If it shows
      stale data, a `revalidatePath()` call somewhere is too narrow (this
      exact bug happened once: `revalidatePath("/admin/products")` only
      invalidated the list, not `/admin/products/[id]/edit`'s own cached
      copy — fixed by revalidating the whole `/admin` layout instead of
      one specific path).
- [ ] Try submitting a form with a required field empty — it should be
      blocked by the browser (a red outline / "please fill this field"),
      never reach the server and crash. If you ever see the Next.js error
      overlay from a form submission, that's a real bug — a required
      field's `TextField`/`TextAreaField`/`SelectField` is missing its
      `required` prop somewhere (this exact bug happened once with
      Experiments' Hypothesis field, back before the simplification —
      fixed, but the class of bug is worth knowing about).
- [ ] The full walkthrough in `app/admin/help/page.tsx` (Product →
      Landing page → visit the public page → click "Get the deal" →
      check the Dashboard).
- [ ] Bulk CSV import/export — one combined file covers Products and
      Landing pages together now (`lib/admin/combined-csv.ts`), and lives
      on its own **Import / Export** tab in the sidebar (not on the
      Products/Landing pages list pages anymore). Click **Export CSV**,
      open it in Excel: edit a row's price/status, add a new row with every
      `*_id` column blank and a `landing_page_slug` filled in (to create a
      product *and* its landing page together), and add another new row
      with `landing_page_slug` left blank (product-only). Save, **Import
      CSV** that file back. Confirm: the edited row updated, the two new
      rows appeared in the right lists (one with a landing page, one
      without), and the summary banner's four counts (products/landing
      pages × created/updated) match what you expected. Also try
      `sample-data/products-and-landing-pages-sample-20.csv` (quick smoke
      test) or `sample-data/products-and-landing-pages-sample-200.csv`
      (bigger batch, also exercises pagination below — every 5th row is
      product-only, on purpose). This one's on you to click through —
      unlike the rest of this checklist, it needs a real logged-in browser
      session to upload a file, which can't be scripted the way the
      database checks elsewhere in this project were.
- [ ] Pagination + search on the Products and Landing pages tables —
      import the 200-row sample above, then on each list page: type in the
      search box (filters by name/brand/category for Products, name/slug
      for Landing pages, after a short debounce) and confirm the "Loading…"
      indicator briefly shows and the URL gets a `?q=...`; change "Rows per
      page" between 10/50/100 and confirm the row count and the URL's
      `?pageSize=...` both update; click Previous/Next and confirm the
      "Showing X–Y of Z" text tracks correctly and the buttons disable at
      the first/last page.
- [ ] Loading states — every button that submits a form (Create/Save
      product or landing page, Import CSV) should visibly change to a
      "…ing" label and disable itself while the request is in flight
      (`components/admin/submit-button.tsx`); Delete already showed
      "Deleting…" before this. Clicking between admin sidebar links should
      briefly show a spinner (`app/admin/loading.tsx`) if the next page
      takes a moment to load.
