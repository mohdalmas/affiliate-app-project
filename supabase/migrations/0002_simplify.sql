-- Affiliate Lab — simplify to 3 admin sections (Products, Landing pages,
-- Dashboard), per the R1-R5 rebuild. Removes the whole marketing-ops
-- layer (Offers/Audiences/Creatives/Campaigns/Experiments/Metrics) and
-- folds the affiliate link + its compliance flag directly onto Products.
--
-- Run this in the SAME Supabase project, AFTER 0001_init.sql — Supabase
-- dashboard → SQL Editor → New query → paste this whole file → Run.
-- Safe to run even though the old tables are already live: everything
-- here is empty/test data, nothing real is lost.

-- 1. events: drop the FK columns to tables we're about to remove ----------
-- (product_id and landing_page_id stay — those are exactly what the new,
-- simpler Dashboard groups by.) Also tighten event_type: with the
-- "collection" landing page concept gone, only two kinds of event are
-- ever emitted now.
alter table public.events drop column if exists campaign_id;
alter table public.events drop column if exists creative_id;
alter table public.events drop column if exists audience_id;

update public.events set event_type = 'product_view' where event_type = 'landing_view';
delete from public.events where event_type = 'redirect';

alter table public.events drop constraint if exists events_event_type_check;
alter table public.events
    add constraint events_event_type_check
    check (event_type in ('product_view', 'affiliate_click'));

-- 2. Drop the marketing-ops tables, in FK-safe order ------------------------
drop table if exists public.daily_metrics;
drop table if exists public.campaigns;
drop table if exists public.experiments;
drop table if exists public.creatives;
drop table if exists public.affiliate_offers;
drop table if exists public.audiences;

-- 3. products: fold the affiliate link + compliance flag on directly -------
alter table public.products
    add column if not exists affiliate_url text,
    add column if not exists paid_traffic_allowed boolean not null default false;

-- Drop the OLD constraint before updating — a value like 'draft'/'live'
-- would otherwise violate the still-active old constraint, which never
-- allowed those words (it's research/shortlisted/testing/winner/killed/
-- archived).
alter table public.products drop constraint if exists products_status_check;

-- Collapse the old research-pipeline statuses into the new, simpler
-- draft/live/archived lifecycle.
update public.products
    set status = case
        when status in ('killed', 'archived') then 'archived'
        when status = 'winner' then 'live'
        else 'draft'
    end
    where status not in ('draft', 'live', 'archived');

alter table public.products
    add constraint products_status_check
    check (status in ('draft', 'live', 'archived'));
alter table public.products alter column status set default 'draft';

-- Fields from the old research-pipeline model that no longer apply.
alter table public.products
    drop column if exists subcategory,
    drop column if exists product_url,
    drop column if exists rating,
    drop column if exists review_count,
    drop column if exists hypothesis;

-- 4. landing_pages: drop the unused page_type concept, same status set ----
-- Same ordering fix as products above: drop the old constraint (which
-- allowed 'published' but not 'live') before writing the new values.
alter table public.landing_pages drop constraint if exists landing_pages_status_check;

update public.landing_pages
    set status = case
        when status = 'published' then 'live'
        when status = 'archived' then 'archived'
        else 'draft'
    end
    where status not in ('draft', 'live', 'archived');

alter table public.landing_pages
    add constraint landing_pages_status_check
    check (status in ('draft', 'live', 'archived'));
alter table public.landing_pages alter column status set default 'draft';

alter table public.landing_pages drop column if exists page_type;

-- product_id is now always required — a landing page with no product
-- doesn't mean anything in the simplified model.
delete from public.landing_pages where product_id is null;
alter table public.landing_pages alter column product_id set not null;
