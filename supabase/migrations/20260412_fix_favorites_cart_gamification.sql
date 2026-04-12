-- ============================================================
-- FIX 1: Ensure marketplace_favorites table exists and is correct
-- ============================================================
-- The code references marketplace_favorites, not marketplace_user_favorites
-- If marketplace_user_favorites exists, migrate data to marketplace_favorites

DO $$
BEGIN
  -- Create marketplace_favorites if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_favorites') THEN
    CREATE TABLE marketplace_favorites (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id TEXT NOT NULL,
      listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, listing_id)
    );
    
    CREATE INDEX idx_favorites_user ON marketplace_favorites(user_id);
    CREATE INDEX idx_favorites_listing ON marketplace_favorites(listing_id);
    CREATE INDEX idx_favorites_created ON marketplace_favorites(created_at DESC);
  END IF;

  -- If marketplace_user_favorites exists, migrate data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_user_favorites') THEN
    INSERT INTO marketplace_favorites (user_id, listing_id, created_at)
    SELECT user_id::TEXT, listing_id, created_at 
    FROM marketplace_user_favorites
    ON CONFLICT (user_id, listing_id) DO NOTHING;
    
    -- Drop old table
    DROP TABLE marketplace_user_favorites CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "favorites_select" ON marketplace_favorites;
DROP POLICY IF EXISTS "favorites_insert" ON marketplace_favorites;
DROP POLICY IF EXISTS "favorites_delete" ON marketplace_favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Users can remove their own favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Users can manage favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON marketplace_favorites;

-- Create correct policies with Clerk JWT extraction
CREATE POLICY "favorites_select" ON marketplace_favorites
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "favorites_insert" ON marketplace_favorites
  FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "favorites_delete" ON marketplace_favorites
  FOR DELETE USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

-- Ensure grants
GRANT SELECT, INSERT, DELETE ON marketplace_favorites TO anon, authenticated;

-- ============================================================
-- FIX 2: Cart RLS policies
-- ============================================================
ALTER TABLE marketplace_cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "cart_select" ON marketplace_cart_items;
DROP POLICY IF EXISTS "cart_insert" ON marketplace_cart_items;
DROP POLICY IF EXISTS "cart_update" ON marketplace_cart_items;
DROP POLICY IF EXISTS "cart_delete" ON marketplace_cart_items;

-- Create correct policies
CREATE POLICY "cart_select" ON marketplace_cart_items
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "cart_insert" ON marketplace_cart_items
  FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "cart_update" ON marketplace_cart_items
  FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "cart_delete" ON marketplace_cart_items
  FOR DELETE USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

-- Ensure grants
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_cart_items TO anon, authenticated;

-- ============================================================
-- FIX 3: Gamification profile auto-creation function
-- ============================================================
-- Create function to auto-create gamification profile on first access
CREATE OR REPLACE FUNCTION ensure_gamification_profile(p_user_id TEXT)
RETURNS gamification_profiles AS $$
DECLARE
  profile gamification_profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile FROM gamification_profiles WHERE user_id = p_user_id;
  
  -- If not found, create it
  IF NOT FOUND THEN
    INSERT INTO gamification_profiles (
      user_id,
      total_xp,
      current_level,
      bara_coins,
      daily_streak,
      consecutive_days,
      multiplier,
      trust_rank,
      last_activity_at
    ) VALUES (
      p_user_id,
      0,
      1,
      100, -- Starting coins
      0,
      0,
      1.0,
      0,
      NOW()
    )
    RETURNING * INTO profile;
  END IF;
  
  RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to all users
GRANT EXECUTE ON FUNCTION ensure_gamification_profile(TEXT) TO anon, authenticated;

-- ============================================================
-- FIX 4: Ensure gamification_profiles RLS is correct
-- ============================================================
ALTER TABLE gamification_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gamification_select" ON gamification_profiles;
DROP POLICY IF EXISTS "gamification_insert" ON gamification_profiles;
DROP POLICY IF EXISTS "gamification_update" ON gamification_profiles;

CREATE POLICY "gamification_select" ON gamification_profiles
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "gamification_insert" ON gamification_profiles
  FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

CREATE POLICY "gamification_update" ON gamification_profiles
  FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));

GRANT SELECT, INSERT, UPDATE ON gamification_profiles TO anon, authenticated;
