-- Music Freemium Model: Preview + Purchase
-- Artists can set a price per song (null = free).
-- Users hear a 20-30 second preview of paid songs, then must purchase.
-- Purchasing requires a registered, logged-in account.

-- 1. Add price column to songs (null = free, 0 = free, >0 = paid)
ALTER TABLE songs ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT NULL;

-- 2. Create purchased_songs table
CREATE TABLE IF NOT EXISTS purchased_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,           -- Clerk user ID
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    price_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

-- 3. RLS for purchased_songs
ALTER TABLE purchased_songs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (needed for checking purchase status)
CREATE POLICY "purchased_songs_select" ON purchased_songs
    FOR SELECT TO anon, authenticated USING (true);

-- Allow inserts (for recording purchases)
CREATE POLICY "purchased_songs_insert" ON purchased_songs
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON purchased_songs TO anon;
GRANT ALL ON purchased_songs TO authenticated;

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_purchased_songs_user ON purchased_songs(user_id, song_id);
