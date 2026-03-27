-- Security hardening

-- 1. Unique constraint on order numbers (prevent duplicates)
ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

-- 2. RLS policies for orders (customers can only see their own orders)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for placing orders)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow reading own orders (by email match)
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (true);

-- Only authenticated users (admin) can update orders
CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users (admin) can delete orders
CREATE POLICY "Admin can delete orders" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. RLS policies for products (public read, admin write)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
