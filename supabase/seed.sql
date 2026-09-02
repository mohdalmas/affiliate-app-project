-- Affiliate Lab — demo data for testing the schema
--
-- Run this AFTER migrations/0001_init.sql and 0002_simplify.sql, in the
-- same SQL Editor. Uses a fake https://example.com affiliate URL on
-- purpose — see ARCHITECTURE.md ("Never hardcode a real Amazon affiliate
-- URL before Stage 17 closes").

insert into public.products (
    name, brand, category, price, affiliate_url, paid_traffic_allowed, status
) values (
    'Demo Beard Trimmer',
    'Demo Brand',
    'Mens Grooming',
    1299,
    'https://example.com',
    false,
    'draft'
);

insert into public.landing_pages (name, slug, product_id, status)
select 'Demo Beard Trimmer', 'demo-trimmer', id, 'draft'
from public.products
where name = 'Demo Beard Trimmer';
