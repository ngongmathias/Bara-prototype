-- Add slug column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(t TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(t, '[^a-zA-Z0-9\s/]', '', 'g'), '[\s/]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Populate existing slugs
UPDATE countries 
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- Make it NOT NULL for future entries (after populating existing ones)
-- ALTER TABLE countries ALTER COLUMN slug SET NOT NULL; 
-- Keeping it nullable for now just in case, but unique index is there.

-- Drop the helper function if not needed anymore, or keep it for triggers
-- DROP FUNCTION generate_slug(TEXT);
