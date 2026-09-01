# Database setup (Stage 2)

Two SQL files, meant to be run once, in order, by hand, in your Supabase
project's dashboard. (There's a Supabase CLI that automates this later —
not needed yet, not worth the extra setup for one migration.)

## 1. Run the schema

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Left sidebar → **SQL Editor** → **New query**
3. Open [`migrations/0001_init.sql`](migrations/0001_init.sql) in your
   editor, copy the whole file, paste it into the Supabase SQL Editor
4. Click **Run**

You should see "Success. No rows returned." If you get an error, stop and
paste the exact error back — don't re-run it (some of these statements,
like `create table`, fail loudly instead of silently if you try to run
them twice).

## 2. Check the tables exist

Left sidebar → **Table Editor**. You should see 9 tables: `products`,
`affiliate_offers`, `audiences`, `creatives`, `campaigns`, `experiments`,
`landing_pages`, `events`, `daily_metrics` — all empty.

## 3. Load demo data

Same SQL Editor, **New query** again, paste in
[`seed.sql`](seed.sql), click **Run**. This adds one fake product
("Demo Beard Trimmer") with one fake affiliate offer, so there's something
to look at.

## 4. Confirm it worked

New query:

```sql
select * from public.products;
select * from public.affiliate_offers;
```

You should see one row in each — the demo trimmer and its (fake,
`example.com`) offer.

## Why RLS makes some things "fail" right now, on purpose

Every table has Row Level Security turned on, and for now every table
except `events` says "only a logged-in user may touch this row." Queries
you run by hand in the SQL Editor always work regardless (they run with
full admin rights) — but if you tried to read `products` from the actual
running app right now, it would come back empty, because the app isn't
logged in as anyone yet. That's expected until Stage 3 (admin auth) wires
up a real login. See `ARCHITECTURE.md` → "Row Level Security" for the full
reasoning.
