-- Phase 6: Sports Predictions, Ad-Free, Profile Themes tables

-- Sports Predictions
CREATE TABLE IF NOT EXISTS sports_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  fixture_id INTEGER NOT NULL,
  prediction TEXT NOT NULL CHECK (prediction IN ('home', 'draw', 'away')),
  coins_bet INTEGER NOT NULL DEFAULT 0,
  payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
  home_team TEXT,
  away_team TEXT,
  match_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fixture_id)
);

CREATE INDEX IF NOT EXISTS idx_sports_predictions_user ON sports_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_predictions_fixture ON sports_predictions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_sports_predictions_status ON sports_predictions(status);

-- Ad-Free Browsing
CREATE TABLE IF NOT EXISTS user_ad_free (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ad_free_user ON user_ad_free(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ad_free_expires ON user_ad_free(expires_at);

-- Profile Themes
CREATE TABLE IF NOT EXISTS user_profile_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_user_profile_themes_user ON user_profile_themes(user_id);

-- RLS Policies
ALTER TABLE sports_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ad_free ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_themes ENABLE ROW LEVEL SECURITY;

-- Sports Predictions: users can read all, insert/update own
CREATE POLICY "Anyone can read predictions" ON sports_predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON sports_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own predictions" ON sports_predictions FOR UPDATE USING (true);

-- Ad-Free: users can read/insert own
CREATE POLICY "Anyone can read ad_free" ON user_ad_free FOR SELECT USING (true);
CREATE POLICY "Users can insert ad_free" ON user_ad_free FOR INSERT WITH CHECK (true);

-- Profile Themes: users can read/insert/update own
CREATE POLICY "Anyone can read themes" ON user_profile_themes FOR SELECT USING (true);
CREATE POLICY "Users can insert themes" ON user_profile_themes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themes" ON user_profile_themes FOR UPDATE USING (true);
