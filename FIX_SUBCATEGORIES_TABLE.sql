-- Fix marketplace_subcategories table to add missing description column
-- Run this in Supabase SQL Editor

-- Add description column if it doesn't exist
ALTER TABLE marketplace_subcategories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplace_subcategories'
ORDER BY ordinal_position;
