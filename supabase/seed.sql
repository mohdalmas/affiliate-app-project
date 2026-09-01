-- Affiliate Lab — demo data for testing Stage 2
--
-- Run this AFTER migrations/0001_init.sql, in the same SQL Editor.
-- Uses a fake https://example.com affiliate URL on purpose — see
-- ARCHITECTURE.md ("Never hardcode a real Amazon affiliate URL before
-- Stage 17 closes").

insert into public.products (
    name, brand, category, subcategory, price, rating, review_count, hypothesis
) values (
    'Demo Beard Trimmer',
    'Demo Brand',
    'Mens Grooming',
    'Beard Trimmer',
    1299,
    4.4,
    1000,
    'Men 25-34 may respond strongly to convenience-focused grooming messaging.'
);

insert into public.affiliate_offers (
    product_id, network, merchant, affiliate_url, commission_percent,
    paid_traffic_allowed, notes
)
select
    id, 'amazon', 'Amazon India', 'https://example.com', 5,
    false, 'Demo offer - replace after affiliate approval'
from public.products
where name = 'Demo Beard Trimmer';
