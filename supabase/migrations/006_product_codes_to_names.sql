-- Update product codes to match display names
-- TS 01 → Tee, SK 01 → Skirt/Shorts, CV 01 → Canvas
UPDATE products SET code = 'Tee' WHERE code LIKE 'TS%';
UPDATE products SET code = 'Shorts' WHERE code LIKE 'SH%';
UPDATE products SET code = 'Skirt' WHERE code LIKE 'SK%';
UPDATE products SET code = 'Canvas' WHERE code LIKE 'CV%';
