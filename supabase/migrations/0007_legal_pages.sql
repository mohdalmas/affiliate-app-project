-- Makes /privacy and /affiliate-disclosure admin-editable instead of
-- hardcoded draft copy in the source — see app/admin/legal-pages and
-- app/privacy, app/affiliate-disclosure.
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.

create table public.legal_pages (
    -- Exactly two rows ever: one per public legal page this site has.
    slug text primary key
        check (slug in ('privacy', 'affiliate-disclosure')),

    title text not null,
    -- Simple block format, not full HTML/markdown: blank-line-separated
    -- paragraphs, a line starting with "## " renders as a subheading. See
    -- lib/legal-pages.ts's renderBlocks().
    body text not null,

    updated_at timestamptz not null default now()
);

alter table public.legal_pages enable row level security;

create policy "authenticated full access" on public.legal_pages
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed both rows with the same draft copy the site shipped with, so
-- there's something to show (and to start editing from) immediately.
insert into public.legal_pages (slug, title, body) values
(
    'privacy',
    'Privacy Policy',
    '## What we collect

When you visit this site, we record basic technical information about your visit — which page you viewed, which link you clicked, the ad campaign that brought you here (if any), your browser''s user agent, and an anonymous, randomly generated id stored in a cookie so we can tell repeat visits from new ones. We do not ask for or collect your name, email, or any other way to identify you personally.

## Why we collect it

This is used only to understand which products, pages, and ads are actually useful to visitors, and to combine that with Amazon''s own affiliate reporting at an aggregate level (see our Affiliate Disclosure). We do not sell this data.

## Affiliate links and redirects

Some links on this site go through a redirect on our own domain before reaching Amazon or another merchant. That redirect records the click described above, then sends you on to the merchant''s own tracked link — the merchant applies its own privacy policy to what happens after that.

## Third parties

If we run paid advertising (Meta/Instagram), the ad platform applies its own privacy policy to how it delivers ads to you, separate from this site.'
),
(
    'affiliate-disclosure',
    'Affiliate Disclosure',
    'As an Amazon Associate, we earn from qualifying purchases. When you click a product link on this site and buy something on Amazon, we may receive a small commission — at no extra cost to you.

We only link to products we''ve genuinely researched. Prices, availability, and offers shown here are set by the merchant (Amazon or otherwise), not by us, and can change after we publish a page.

Some links on this site go through a redirect on our own domain (a URL starting with /go/) before reaching the merchant''s site. This lets us measure which pages and ads are useful to visitors — see our Privacy Policy for what that involves.'
)
on conflict (slug) do nothing;
