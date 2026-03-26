-- v4.1: Add tracking and admin memo columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_company text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS admin_memo text;
