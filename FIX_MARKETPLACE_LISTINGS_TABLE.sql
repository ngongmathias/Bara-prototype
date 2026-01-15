-- Fix marketplace_listings table to add missing attributes column
-- Run this in Supabase SQL Editor

-- Add attributes column if it doesn't exist (JSONB for flexible data storage)
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplace_listings'
ORDER BY ordinal_position;
