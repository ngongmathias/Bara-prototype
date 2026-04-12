-- Check what listings are still in BARA Mall account
SELECT id, title, created_by, seller_name, created_at
FROM marketplace_listings 
WHERE created_by = 'user_39F89D6dX01nG31j8rAUyLYa3IG'
ORDER BY created_at DESC
LIMIT 20;

-- Move any remaining listings that should be yours
UPDATE marketplace_listings
SET created_by = 'user_39EUqrQ4of91lQx8RnwkSZOTiQF',
    seller_name = 'Mathias Ngong',
    seller_email = 'mathiasngongngai@gmail.com'
WHERE created_by = 'user_39F89D6dX01nG31j8rAUyLYa3IG';

-- Verify all your listings
SELECT id, title, created_by, seller_name 
FROM marketplace_listings 
WHERE created_by = 'user_39EUqrQ4of91lQx8RnwkSZOTiQF'
ORDER BY created_at DESC;
