-- Fix condition field constraint to allow NULL values
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_condition_check;

-- Add new constraint that allows NULL or specific values
ALTER TABLE marketplace_listings
ADD CONSTRAINT marketplace_listings_condition_check 
CHECK (condition IS NULL OR condition IN ('new', 'used', 'like-new'));

-- Make condition column nullable if it isn't already
ALTER TABLE marketplace_listings 
ALTER COLUMN condition DROP NOT NULL;
