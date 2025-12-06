-- Add additional visual asset fields to country_info table
-- This migration adds support for flag, leader photo, and monument images

-- Add leader_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'country_info' AND column_name = 'leader_image_url'
    ) THEN
        ALTER TABLE country_info ADD COLUMN leader_image_url TEXT;
    END IF;
END $$;

-- Add monument_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'country_info' AND column_name = 'monument_image_url'
    ) THEN
        ALTER TABLE country_info ADD COLUMN monument_image_url TEXT;
    END IF;
END $$;

-- Add comments to describe the new columns
COMMENT ON COLUMN country_info.leader_image_url IS 'URL to image of country president/leader';
COMMENT ON COLUMN country_info.monument_image_url IS 'URL to image of national monument or landmark';

-- Note: largest_city_population and capital_population should already exist in the schema
-- If they don't, uncomment and run the following:

-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_name = 'country_info' AND column_name = 'largest_city_population'
--     ) THEN
--         ALTER TABLE country_info ADD COLUMN largest_city_population BIGINT;
--     END IF;
-- END $$;

-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.columns 
--         WHERE table_name = 'country_info' AND column_name = 'capital_population'
--     ) THEN
--         ALTER TABLE country_info ADD COLUMN capital_population BIGINT;
--     END IF;
-- END $$;
