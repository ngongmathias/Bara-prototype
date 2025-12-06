-- Add additional visual asset fields to country_info table
-- This migration adds support for flag, leader photo, and monument images
-- Run this BEFORE running create_global_africa_table.sql

-- Add leader_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'country_info' AND column_name = 'leader_image_url'
    ) THEN
        ALTER TABLE country_info ADD COLUMN leader_image_url TEXT;
        RAISE NOTICE 'Added leader_image_url column';
    ELSE
        RAISE NOTICE 'leader_image_url column already exists';
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
        RAISE NOTICE 'Added monument_image_url column';
    ELSE
        RAISE NOTICE 'monument_image_url column already exists';
    END IF;
END $$;

-- Ensure largest_city_population exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'country_info' AND column_name = 'largest_city_population'
    ) THEN
        ALTER TABLE country_info ADD COLUMN largest_city_population BIGINT;
        RAISE NOTICE 'Added largest_city_population column';
    ELSE
        RAISE NOTICE 'largest_city_population column already exists';
    END IF;
END $$;

-- Ensure capital_population exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'country_info' AND column_name = 'capital_population'
    ) THEN
        ALTER TABLE country_info ADD COLUMN capital_population BIGINT;
        RAISE NOTICE 'Added capital_population column';
    ELSE
        RAISE NOTICE 'capital_population column already exists';
    END IF;
END $$;

-- Add comments to describe the columns
COMMENT ON COLUMN country_info.leader_image_url IS 'URL to image of country president/leader';
COMMENT ON COLUMN country_info.monument_image_url IS 'URL to image of national monument or landmark';
COMMENT ON COLUMN country_info.largest_city_population IS 'Population of the largest city';
COMMENT ON COLUMN country_info.capital_population IS 'Population of the capital city';
