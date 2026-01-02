-- Run this in Supabase SQL Editor to see which marketplace tables exist
-- This will help us understand what's already in your database

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'marketplace%'
ORDER BY table_name;
