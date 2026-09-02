-- Two hand-picked items in the same home section landing on the same
-- Position is ambiguous (which shows first?) and was silently allowed —
-- make it a rejected write with a clear error instead. See
-- app/admin/sections/actions.ts's friendlyPositionError().
--
-- Run this the same way as the others: Supabase dashboard → SQL Editor →
-- New query → paste this whole file → Run.
--
-- If this fails with a duplicate-key error, you have existing rows to
-- fix first — in the Table Editor, open home_section_items and give any
-- same-section rows sharing a position distinct numbers, then re-run this.

alter table public.home_section_items
    add constraint home_section_items_section_id_position_key
    unique (section_id, position);
