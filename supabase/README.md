# Database setup

Migrations meant to be run once each, in order, by hand, in your Supabase
project's dashboard. (There's a Supabase CLI that automates this later —
not needed yet, not worth the extra setup for a couple of migrations.)

## 1. Run the migrations, in order

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Left sidebar → **SQL Editor** → **New query**
3. Open [`migrations/0001_init.sql`](migrations/0001_init.sql), copy the
   whole file, paste it into the SQL Editor, click **Run**
4. **New query** again, do the same with
   [`migrations/0002_simplify.sql`](migrations/0002_simplify.sql) — this
   removes the Offers/Audiences/Creatives/Campaigns/Experiments/Metrics
   tables and folds the affiliate link straight onto `products`
5. **New query** again, do the same with
   [`migrations/0003_fix_landing_page_delete.sql`](migrations/0003_fix_landing_page_delete.sql) —
   fixes a real bug `0002` introduced (deleting a product with a landing
   page would crash instead of cleanly removing both)
6. **New query** again, do the same with
   [`migrations/0004_add_commission.sql`](migrations/0004_add_commission.sql) —
   adds `commission_percentage`/`commission_notes` to `products`, used by
   the Dashboard's estimated-commission pie chart

If a step errors, stop and paste the exact error back — don't re-run it
(some statements, like `create table`, fail loudly instead of silently if
you try to run them twice; `0002` and `0003` are written to be safe to
re-run on their own if needed, using `if exists`/`if not exists`
throughout).

## 2. Check the tables

Left sidebar → **Table Editor**. You should see 3 real tables —
`products`, `landing_pages`, `events` — the rest were removed by
`0002_simplify.sql`.

## 3. Load demo data

Same SQL Editor, **New query**, paste in [`seed.sql`](seed.sql), click
**Run**. Adds one demo product with a fake `example.com` affiliate link
and one draft landing page, so there's something to look at.

## 4. Confirm it worked

```sql
select * from public.products;
select * from public.landing_pages;
```

You should see one row in each.

## Why RLS makes some things "fail" right now, on purpose

Every table has Row Level Security turned on. `products` and
`landing_pages` say "only a logged-in user may touch this row" — reads
from a real page need to go through the service-role client instead (see
`lib/supabase/service.ts`), never a public RLS policy. Queries you run by
hand in the SQL Editor always work regardless (full admin rights). See
`ARCHITECTURE.md` → "Row Level Security" for the full reasoning.
