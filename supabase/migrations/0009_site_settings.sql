-- A single-row table of site-wide text the admin can edit without a code
-- change — starting with the homepage announcement bar. See
-- lib/site-settings.ts and app/admin/settings.
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.

create table public.site_settings (
    -- Always exactly one row — id is pinned to 'default' so there's never
    -- a second one to accidentally read/write instead.
    id text primary key default 'default' check (id = 'default'),

    -- The announcement bar's two segments — see PageShell: a plain lead-in
    -- and a highlighted (bold, brand-orange) tail, e.g. "Fresh deals,
    -- verified daily —" / "Shop smart. Save big." Both nullable: a blank
    -- highlight just renders no second segment.
    announcement_prefix text,
    announcement_highlight text,

    updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "authenticated full access" on public.site_settings
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into public.site_settings (id, announcement_prefix, announcement_highlight)
values ('default', 'Fresh deals, verified daily —', 'Shop smart. Save big.')
on conflict (id) do nothing;
