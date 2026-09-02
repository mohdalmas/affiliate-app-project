-- Star ratings + MRP/discount pricing — `rating`/`review_count` existed
-- pre-0002_simplify.sql and were dropped along with the old
-- research-pipeline model; re-added here in the current (simplified)
-- shape, plus `mrp` (new) for the strikethrough "original price" /
-- discount-% display on deal cards and the product page.
--
-- `price` stays the actual selling price — `mrp` is what it's discounted
-- from. A product with no `mrp` (or `mrp <= price`) just shows no
-- discount badge; see components/public/deal-card.tsx.
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.

alter table public.products
    add column rating numeric(2,1),
    add column review_count integer,
    add column mrp numeric(12,2);

alter table public.products
    add constraint products_rating_check
    check (rating is null or (rating >= 0 and rating <= 5));

alter table public.products
    add constraint products_review_count_check
    check (review_count is null or review_count >= 0);
