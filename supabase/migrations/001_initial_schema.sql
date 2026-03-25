-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  name text not null,
  price integer not null,
  stock integer default 50,
  specs jsonb,
  sizes jsonb,
  image_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null,
  product_id uuid references products(id),
  size text not null,
  quantity integer default 1,
  total_price integer not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_address_detail text,
  delivery_memo text,
  depositor_name text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  cancelled_at timestamptz
);

-- RLS: Enable
alter table products enable row level security;
alter table orders enable row level security;

-- Products: anyone can read active products
create policy "Public can read active products"
  on products for select
  using (is_active = true);

-- Products: only authenticated (admin) can modify
create policy "Admin can manage products"
  on products for all
  using (auth.role() = 'authenticated');

-- Orders: anyone can insert (place order)
create policy "Anyone can place orders"
  on orders for insert
  with check (true);

-- Orders: only authenticated (admin) can read/update/delete
create policy "Admin can read orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Admin can update orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- Seed: sample products
insert into products (code, name, price, stock, specs, sizes, sort_order) values
  ('TS 01', 'HAYANI Tee', 78000, 50, '["Cotton 100%", "220g", "Off-White", "Made in Korea"]'::jsonb, '["S", "M", "L", "XL"]'::jsonb, 1),
  ('SK 01', 'HAYANI Skirt', 128000, 30, '["Cotton 80% / Linen 20%", "180g", "Off-White", "Made in Korea"]'::jsonb, '["S", "M", "L"]'::jsonb, 2);
