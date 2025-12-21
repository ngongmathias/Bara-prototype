-- Remove any unique constraints that prevent multiple active banners per country
-- This allows multiple banners to be active for the same country (they will rotate/slideshow)

-- First, let's check what constraints exist and drop any that enforce uniqueness on active banners
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop any unique constraints on (country_id, is_active) combinations
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'sponsored_banners'::regclass 
        AND contype = 'u' -- unique constraints
        AND conname LIKE '%active%' OR conname LIKE '%country%'
    LOOP
        EXECUTE format('ALTER TABLE sponsored_banners DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Also check for any partial unique indexes that might be causing issues
DROP INDEX IF EXISTS idx_sponsored_banners_unique_active_country;
DROP INDEX IF EXISTS idx_sponsored_banners_active_country;
DROP INDEX IF EXISTS unique_active_banner_per_country;

-- Add a comment to document the expected behavior
COMMENT ON TABLE sponsored_banners IS 'Sponsored banner ads. Multiple banners can be active for the same country - they will rotate in a slideshow (5 seconds each).';

-- Verify the table structure
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'sponsored_banners'::regclass
ORDER BY contype, conname;
