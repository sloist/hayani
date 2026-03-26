-- Add size guide measurements to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_guide jsonb;

-- Example: UPDATE products SET size_guide = '[{"chest":52,"length":68},{"chest":55,"length":71},{"chest":58,"length":74},{"chest":61,"length":77}]' WHERE code = 'Tee';
