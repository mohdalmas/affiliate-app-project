-- Lets a home section auto-pull every Live product in a category, instead
-- of (or alongside) hand-picking individual landing pages one at a time.
-- See app/admin/sections and components/public/home-sections.tsx.
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.

alter table public.home_sections
    add column if not exists category text;
