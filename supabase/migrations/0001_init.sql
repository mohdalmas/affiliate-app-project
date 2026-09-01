-- Affiliate Lab — Stage 2: initial schema + Row Level Security
--
-- How to run this (see supabase/README.md for the full walkthrough):
--   Supabase dashboard → SQL Editor → New query → paste this whole file → Run.
--
-- This creates the 9 tables described in ARCHITECTURE.md and locks all of
-- them down with RLS. Nothing is public yet — see the RLS section at the
-- bottom for exactly why.

create extension if not exists "pgcrypto";

-- 1. products ---------------------------------------------------------------
-- What you might sell. `status` tracks it through your research pipeline.
create table public.products (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    brand text,
    category text,
    subcategory text,

    product_url text,
    image_url text,

    price numeric(12,2),
    currency text default 'INR',

    rating numeric(3,2),
    review_count integer,

    status text not null default 'research'
        check (status in (
            'research', 'shortlisted', 'testing', 'winner', 'killed', 'archived'
        )),

    hypothesis text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. affiliate_offers ---------------------------------------------------------
-- One product can have several merchant offers (Amazon, Flipkart, ...).
-- The affiliate link itself lives here, never on the product row.
create table public.affiliate_offers (
    id uuid primary key default gen_random_uuid(),

    product_id uuid not null
        references public.products(id)
        on delete cascade,

    network text not null,
    merchant text not null,

    affiliate_url text not null,

    commission_percent numeric(6,3),
    commission_fixed numeric(12,2),

    currency text default 'INR',

    -- The compliance finding from ARCHITECTURE.md lives in the data, not
    -- just in a doc: never send paid traffic at an offer where this is false.
    paid_traffic_allowed boolean not null default false,
    notes text,

    status text not null default 'active'
        check (status in ('active', 'paused', 'expired')),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. audiences ----------------------------------------------------------------
-- Who you're targeting with a campaign, and why.
create table public.audiences (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    gender text,
    age_min integer,
    age_max integer,

    location text,
    interests text,

    hypothesis text,

    status text default 'active'
        check (status in ('active', 'paused', 'archived')),

    created_at timestamptz not null default now()
);

-- 4. creatives ------------------------------------------------------------------
-- One ad variant: its hook/angle/CTA, linked to the product it promotes.
create table public.creatives (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    product_id uuid
        references public.products(id)
        on delete set null,

    platform text default 'meta',

    format text
        check (format in ('video', 'image', 'carousel', 'ugc', 'other')),

    hook text,
    angle text,
    call_to_action text,

    media_url text,

    status text default 'draft'
        check (status in (
            'draft', 'ready', 'testing', 'winner', 'killed', 'archived'
        )),

    created_at timestamptz not null default now()
);

-- 5. campaigns --------------------------------------------------------------
-- A real (or planned) Meta campaign: which product/creative/audience it uses.
create table public.campaigns (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    platform text default 'meta',
    external_campaign_id text,

    product_id uuid
        references public.products(id)
        on delete set null,

    creative_id uuid
        references public.creatives(id)
        on delete set null,

    audience_id uuid
        references public.audiences(id)
        on delete set null,

    daily_budget numeric(12,2),

    start_date date,
    end_date date,

    status text default 'draft'
        check (status in ('draft', 'active', 'paused', 'completed')),

    created_at timestamptz not null default now()
);

-- 6. experiments ------------------------------------------------------------
-- A/B hypotheses, so decisions are traceable instead of gut-feel.
create table public.experiments (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    hypothesis text not null,

    primary_metric text,
    secondary_metrics text,

    control_description text,
    variant_description text,

    product_id uuid
        references public.products(id)
        on delete set null,

    audience_id uuid
        references public.audiences(id)
        on delete set null,

    status text default 'planned'
        check (status in ('planned', 'running', 'completed', 'cancelled')),

    result text,
    conclusion text,

    created_at timestamptz not null default now(),
    completed_at timestamptz
);

-- 7. landing_pages ------------------------------------------------------------
-- Public pages a Meta ad can actually point to (Stage 10 builds these).
create table public.landing_pages (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    slug text not null unique,

    page_type text default 'product'
        check (page_type in ('product', 'collection', 'comparison')),

    product_id uuid
        references public.products(id)
        on delete set null,

    status text default 'draft'
        check (status in ('draft', 'published', 'archived')),

    created_at timestamptz not null default now()
);

-- 8. events -------------------------------------------------------------------
-- The first-party click/view log — the heart of the tracking system.
create table public.events (
    id uuid primary key default gen_random_uuid(),

    session_id uuid,

    event_type text not null
        check (event_type in (
            'landing_view', 'product_view', 'affiliate_click', 'redirect'
        )),

    product_id uuid references public.products(id) on delete set null,
    campaign_id uuid references public.campaigns(id) on delete set null,
    creative_id uuid references public.creatives(id) on delete set null,
    audience_id uuid references public.audiences(id) on delete set null,
    landing_page_id uuid references public.landing_pages(id) on delete set null,

    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_content text,
    utm_term text,

    referrer text,
    user_agent text,

    created_at timestamptz not null default now()
);

create index events_created_at_idx on public.events(created_at);
create index events_session_id_idx on public.events(session_id);
create index events_event_type_idx on public.events(event_type);

-- 9. daily_metrics --------------------------------------------------------
-- Spend/commission per campaign per day, combining Meta + Amazon reporting.
create table public.daily_metrics (
    id uuid primary key default gen_random_uuid(),

    date date not null,

    campaign_id uuid not null
        references public.campaigns(id)
        on delete cascade,

    impressions integer default 0,
    reach integer default 0,

    clicks integer default 0,
    landing_page_views integer default 0,
    affiliate_clicks integer default 0,

    purchases integer default 0,

    spend numeric(12,2) default 0,
    revenue numeric(12,2) default 0,
    commission numeric(12,2) default 0,

    notes text,

    created_at timestamptz not null default now(),

    unique(date, campaign_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Default posture for Stage 2: every table requires a logged-in user for
-- ANY access at all. Nothing is public yet, on purpose:
--   - the admin dashboard (Stage 3+) is the only thing using these tables
--     right now, and it will always have a logged-in user (you).
--   - the public storefront (Stage 10) gets its own narrow, read-only
--     policy added later, scoped to just "published" rows — not opened
--     broadly today just because those pages don't exist yet.
--   - the /go/[slug] redirect (Stage 12) will insert into `events` using
--     Supabase's service-role key from a server-side route, which bypasses
--     RLS entirely — so `events` intentionally gets no insert policy here.
--     (The SQL you run by hand in this editor also bypasses RLS, which is
--     why the demo data in seed.sql will work even though these policies
--     technically block "logged out" inserts.)
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.affiliate_offers enable row level security;
alter table public.audiences enable row level security;
alter table public.creatives enable row level security;
alter table public.campaigns enable row level security;
alter table public.experiments enable row level security;
alter table public.landing_pages enable row level security;
alter table public.events enable row level security;
alter table public.daily_metrics enable row level security;

-- One simple policy per admin table: any logged-in user can do anything.
-- You're the only person who will ever log in for V1 (see Stage 3).
create policy "authenticated full access" on public.products
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.affiliate_offers
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.audiences
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.creatives
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.campaigns
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.experiments
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.landing_pages
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on public.daily_metrics
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- events: authenticated users may only READ (for the analytics dashboard
-- later). Nobody can insert/update/delete through the API/browser — inserts
-- happen only via the service-role key, server-side, starting Stage 12.
create policy "authenticated read" on public.events
    for select using (auth.role() = 'authenticated');
