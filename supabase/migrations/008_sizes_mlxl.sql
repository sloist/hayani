-- Change sizes from S,M,L,XL to M,L,XL (drop S)
-- Canvas stays ["F"]
UPDATE products SET sizes = '["M", "L", "XL"]' WHERE sizes::text LIKE '%"S"%' AND sizes::text NOT LIKE '%"F"%';
-- ONE SIZE → F
UPDATE products SET sizes = '["F"]' WHERE sizes::text LIKE '%ONE SIZE%';
