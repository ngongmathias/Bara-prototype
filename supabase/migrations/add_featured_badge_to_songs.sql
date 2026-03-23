-- Add featured_badge column to songs table
-- Values: 'platform_pick', 'editors_choice', or NULL
ALTER TABLE songs ADD COLUMN IF NOT EXISTS featured_badge text DEFAULT NULL;

-- Create index for faster queries on featured songs
CREATE INDEX IF NOT EXISTS idx_songs_featured_badge ON songs(featured_badge) WHERE featured_badge IS NOT NULL;

-- Add a comment
COMMENT ON COLUMN songs.featured_badge IS 'Admin-set promotion badge: platform_pick or editors_choice';
