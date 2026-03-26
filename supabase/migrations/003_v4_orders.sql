-- v4: Convert orders to items jsonb format
-- Add new columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS items jsonb,
  ADD COLUMN IF NOT EXISTS subtotal integer,
  ADD COLUMN IF NOT EXISTS shipping_fee integer DEFAULT 4000;

-- Migrate existing data
UPDATE orders SET
  items = jsonb_build_array(jsonb_build_object(
    'product_id', product_id,
    'code', (SELECT code FROM products WHERE id = product_id),
    'name', (SELECT name FROM products WHERE id = product_id),
    'size', size,
    'price', total_price - 4000,
    'quantity', quantity,
    'image_url', (SELECT image_url FROM products WHERE id = product_id)
  )),
  subtotal = total_price - 4000,
  shipping_fee = 4000
WHERE items IS NULL AND product_id IS NOT NULL;

-- Drop old columns
ALTER TABLE orders
  DROP COLUMN IF EXISTS product_id,
  DROP COLUMN IF EXISTS size,
  DROP COLUMN IF EXISTS quantity;
