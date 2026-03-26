-- Add customer_email to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Update products: remove old data, insert v2 products
DELETE FROM products;

INSERT INTO products (code, name, price, stock, specs, sizes, sort_order) VALUES
  ('TS 01', 'HAYANI Tee', 78000, 20, '["Cotton 100%", "220g", "Off-White", "Made in Korea"]', '["S", "M", "L", "XL"]', 1);

INSERT INTO products (code, name, price, stock, specs, sizes, sort_order) VALUES
  ('SK 01', 'HAYANI Skirt', 128000, 30, '["Cotton 80%", "Linen 20%", "180g", "Off-White", "Made in Korea"]', '["S", "M", "L", "XL"]', 2);

INSERT INTO products (code, name, price, stock, specs, sizes, sort_order) VALUES
  ('CV 01', 'HAYANI Canvas', 38000, 50, '["Cotton Canvas", "40 x 50cm", "Off-White", "Made in Korea"]', '["ONE SIZE"]', 3);
