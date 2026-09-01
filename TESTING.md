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

- [ ] For each of Products / Offers / Audiences / Creatives / Campaigns /
      Experiments / Landing pages / Metrics: add one, edit it, delete it.
      Confirm the list updates each time.
- [ ] Try submitting a form with a required field empty — it should be
      blocked by the browser (a red outline / "please fill this field"),
      never reach the server and crash. If you ever see the Next.js error
      overlay from a form submission, that's a real bug — a required
      field's `TextField`/`TextAreaField`/`SelectField` is missing its
      `required` prop somewhere (this exact bug happened once with
      Experiments' Hypothesis field — fixed, but the class of bug is worth
      knowing about).
- [ ] The full walkthrough in `app/admin/help/page.tsx` (Product →
      Offer → Landing page → visit the public page → click "Get the
      deal" → check Analytics).
