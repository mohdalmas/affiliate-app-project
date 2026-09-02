-- Home page sections — lets the admin curate named shelves on the public
-- homepage ("Today's Verified Hot Deals", "Last Minute Deals", ...), each
-- an ordered pick of landing pages, instead of one flat "every Live
-- landing page" grid. See app/admin/sections and components/public/
-- home-sections.tsx.
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.

create table public.home_sections (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    subtitle text,

    -- Lower sorts first on the homepage.
    position integer not null default 0,

    status text not null default 'draft'
        check (status in ('draft', 'live')),

    created_at timestamptz not null default now()
);

create table public.home_section_items (
    id uuid primary key default gen_random_uuid(),

    section_id uuid not null
        references public.home_sections(id)
        on delete cascade,

    landing_page_id uuid not null
        references public.landing_pages(id)
        on delete cascade,

    -- Lower sorts first within the section.
    position integer not null default 0,

    unique (section_id, landing_page_id)
);

create index home_section_items_section_id_idx on public.home_section_items(section_id);

-- Same RLS posture as every other admin-managed table: only a logged-in
-- user may read/write. The public homepage reads via the service-role
-- client (lib/supabase/service.ts), same as it already does for
-- products/landing_pages — see that file's comment for why that's the
-- right way to expose Live rows publicly, not a public RLS policy.
alter table public.home_sections enable row level security;
alter table public.home_section_items enable row level security;

create policy "authenticated full access" on public.home_sections
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.home_section_items
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
