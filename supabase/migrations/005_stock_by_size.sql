-- Add size-specific stock tracking
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_by_size jsonb;
