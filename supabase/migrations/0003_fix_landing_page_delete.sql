-- Affiliate Lab — fix a real latent crash from 0002_simplify.sql
--
-- 0002 made landing_pages.product_id NOT NULL, but left the original
-- foreign key's "ON DELETE SET NULL" action in place (from 0001_init.sql,
-- back when product_id was optional). Those two rules directly
-- contradict each other: deleting a product that still has a landing
-- page would try to null out product_id to satisfy the FK action, then
-- immediately fail the NOT NULL constraint — a database error, not a
-- clean deletion.
--
-- Fix: ON DELETE CASCADE instead — deleting a product removes its
-- landing page(s) too, which is what the Products list's own delete
-- confirmation already told you would happen ("Any landing pages
-- pointing at it will stop working").
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.

alter table public.landing_pages
    drop constraint if exists landing_pages_product_id_fkey;

alter table public.landing_pages
    add constraint landing_pages_product_id_fkey
    foreign key (product_id) references public.products(id)
    on delete cascade;
