-- Adds commission tracking fields to products, so the Dashboard can show
-- an estimated-commission breakdown instead of just raw view/click counts.
-- Amazon Associates doesn't expose real per-sale commission via API, so
-- this is an admin-entered rate used purely for your own estimates —
-- never treat the numbers this produces as confirmed earnings.

alter table products
  add column commission_percentage numeric(5, 2),
  add column commission_notes text;

alter table products
  add constraint products_commission_percentage_check
  check (commission_percentage is null or (commission_percentage >= 0 and commission_percentage <= 100));
