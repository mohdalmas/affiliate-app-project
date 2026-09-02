---
name: admin-entity
description: Scaffold a new admin-managed entity (or add a field/sub-table to an existing one) in this Next.js + Supabase app, following the exact pattern Products/Landing pages/Home sections/Legal pages already use — migration + RLS, server actions with toast feedback, list/new/edit pages, sidebar nav, and the in-app help doc. Use when asked to add a new thing the admin manages (a table with CRUD in /admin), not for one-off UI tweaks.
---

# Add an admin-managed entity

Read `ai/CONTEXT.md` first if you haven't this session — it has the data
model and the shared component inventory this recipe reuses. This skill
is the step-by-step; `ai/DECISIONS.md` has the "why this shape and not a
generic engine" reasoning if that comes up.

Work through these in order. Skipping straight to the pages without the
migration, or shipping actions without toast/error handling, is how this
pattern erodes.

## 1. Migration

New file: `supabase/migrations/000N_<name>.sql` (next number after the
highest existing one — check `ls supabase/migrations/`). Template:

```sql
create table public.<table> (
    id uuid primary key default gen_random_uuid(),
    -- columns
    created_at timestamptz not null default now()
);

alter table public.<table> enable row level security;

create policy "authenticated full access" on public.<table>
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

Add any real constraints (`check`, `unique`, `references ... on delete
cascade`) — don't leave ordering/uniqueness ambiguous if the UI implies an
order (see `0008_section_item_position_unique.sql` for why: an unenforced
duplicate position was silently accepted and read as a bug).

Then: **append a numbered step to `supabase/README.md`** describing what
it does. A migration nobody's told to run doesn't exist in practice — see
`ai/PENDING.md`, which you should also add a line to (this migration is
"not yet confirmed run" until the user says otherwise; there's no live DB
in this dev environment to run it against yourself).

If the public site needs to read this table, add the read to
`lib/supabase/service.ts`'s service-role client path (a public page's
Server Component), never a public RLS policy — see that file's comment.

## 2. `lib/admin/options.ts` (only if another entity needs to pick this one)

If a `<select>` elsewhere needs to reference rows of the new table (like
Landing pages picking a Product), add a `get<Entity>Options()` here
following `getProductOptions`/`getLandingPageOptions`/`getCategoryOptions`.

## 3. `app/admin/<entity>/actions.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { str, num, bool } from "@/lib/admin/form-data";
import { redirectWithToast } from "@/lib/admin/toast-redirect";

function payload(formData: FormData) {
  return {
    // str()/num()/bool() per field — never read formData.get() directly,
    // these normalize "" to null the way Supabase wants for optional columns.
  };
}

export async function create<Entity>(formData: FormData) {
  const data = payload(formData);
  if (!data.someRequiredField) throw new Error("X is required");

  const supabase = await createClient();
  const { error } = await supabase.from("<table>").insert(data);
  if (error) throw new Error(error.message); // or a friendlyError() mapping error.code === "23505"

  revalidatePath("/admin", "layout");
  redirectWithToast("/admin/<entity>", "<Entity> created");
}

export async function update<Entity>(id: string, formData: FormData) {
  // same shape, .update(data).eq("id", id), redirectWithToast(..., "<Entity> saved")
}

export async function delete<Entity>(id: string) {
  // .delete().eq("id", id); revalidatePath only — no redirect here.
  // DeleteButton (a direct client call, not a <form>) toasts the outcome
  // itself; redirecting from inside would fight that.
}
```

**Every action that redirects on success uses `redirectWithToast`, never a
bare `redirect()`. Every thrown error is a plain `Error` with a message an
admin can act on** — `app/admin/error.tsx` renders it, don't add local
error UI. If a unique constraint can be hit by normal use (not just a
bug), map its `error.code === "23505"` to a specific message before
throwing — see `friendlyItemError` in `app/admin/sections/actions.ts`.

## 4. `app/admin/<entity>/help.ts`

```ts
export const <ENTITY>_HELP_DESCRIPTION = "One sentence: what this is, in plain language.";
export const <ENTITY>_HELP_FIELDS = [
  { name: "Field label", help: "What to put here, and any gotcha." },
];
```

## 5. Pages

- `app/admin/<entity>/page.tsx` — list. `export const instant = false;`
  always (see `ai/CONTEXT.md`'s Cache Components section). Use
  `SectionHeader` (with `addHref`), `EmptyState`, `StatusBadge` from
  `components/admin/list-ui.tsx`, and `DeleteButton` from
  `components/admin/delete-button.tsx` for each row's delete action. Add
  search/pagination (`ListToolbar`/`ListPagination` from
  `components/admin/list-toolbar.tsx`) only if the table can realistically
  grow past a screenful — Home sections' list skipped it on purpose.
- `app/admin/<entity>/new/page.tsx` and `[id]/edit/page.tsx` — a `<form
  action={create<Entity>}>`/`<form action={update<Entity>.bind(null, id)}>`
  using `TextField`/`TextAreaField`/`SelectField`/`CheckboxField`
  (`components/admin/form-fields.tsx`), `SubmitButton`
  (`components/admin/submit-button.tsx`), wrapped in `FormLayout` with a
  `HelpPanel` showing the help.ts content (`components/admin/help-panel.tsx`).
  `export const instant = false;` on both.

## 6. Wire it in

- Add `{ href: "/admin/<entity>", label: "<Entity>" }` to
  `components/admin/admin-nav.tsx`'s `NAV_ITEMS` — the one list that
  feeds both the permanent sidebar (`lg` and up) and the mobile drawer.
- Add a short section to `app/admin/help/page.tsx` (under "The N admin
  pages" — bump the heading's count) describing what it's for, matching
  the tone of the existing entries.
- Add one line to `ai/CHANGELOG.md`. If this involved a real tradeoff
  (schema shape, what to combine vs. keep separate), add an `ai/DECISIONS.md`
  entry too.

## 7. Verify

```
npm run build   # Cache Components will fail loudly on a missing `instant = false`
npm test
npx eslint app components lib --ignore-pattern node_modules
```

Then tell the user which new migration(s) need running in Supabase (they
can't be run from here) and add them to `ai/PENDING.md`.
