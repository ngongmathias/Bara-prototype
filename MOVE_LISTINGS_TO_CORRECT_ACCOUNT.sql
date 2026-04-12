-- Move listings from BARA Mall account to Mathias Ngong account
-- From: user_39F89D6dX01nG31j8rAUyLYa3IG (BARA Mall - LYa3IG)
-- To: user_39EUqrQ4of91lQx8RnwkSZOTiQF (Mathias Ngong - ZOTiQF)

UPDATE marketplace_listings
SET created_by = 'user_39EUqrQ4of91lQx8RnwkSZOTiQF',
    seller_name = 'Mathias Ngong',
    seller_email = 'mathiasngongngai@gmail.com'
WHERE created_by = 'user_39F89D6dX01nG31j8rAUyLYa3IG'
  AND title IN (
    'Toyota RAV4 2022 - Hybrid AWD',
    'Luxury 2-Bedroom Apartment - Kimihurura',
    'MacBook Pro 16" M2 Pro - 512GB SSD',
    'Louis Vuitton Neverfull MM - Authentic',
    'Modern Glass Dining Table + 6 Chairs',
    'iPhone 15 Pro 256GB - Titanium Blue',
    'PlayStation 5 Digital Edition + 3 Games',
    'Professional Web Development Services'
  );

-- Verify the move
SELECT id, title, created_by, seller_name 
FROM marketplace_listings 
WHERE created_by = 'user_39EUqrQ4of91lQx8RnwkSZOTiQF'
ORDER BY created_at DESC;
