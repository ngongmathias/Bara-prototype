-- Phase 27.1: Admin-tunable economy settings + Trust Rank removal
-- 1) `gamification_settings` — every number in the economy (XP per action,
--    coin rewards, perk costs, caps, coin worth) becomes a DB row editable
--    from Admin → Gamification. The frontend falls back to hardcoded defaults
--    if a key is missing, so this migration is safe to apply at any time.
-- 2) Drops the vestigial Trust Rank columns (team decision Jul 5, 2026:
--    Trust Rank is removed; a future Seller Reputation, if any, will be a
--    separate marketplace feature, not a gamification currency).

-- ---------------------------------------------------------------------------
-- 1) Settings table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gamification_settings (
    key TEXT PRIMARY KEY,
    value NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.gamification_settings ENABLE ROW LEVEL SECURITY;

-- Read for everyone (the app needs the values pre-auth).
DROP POLICY IF EXISTS "Economy settings are viewable by everyone" ON public.gamification_settings;
CREATE POLICY "Economy settings are viewable by everyone" ON public.gamification_settings
    FOR SELECT USING (true);

-- Writes follow the app's current tokenless-anon-client pattern (admin gating
-- happens in the frontend via AdminAuthGuard, same as the rest of the admin).
-- ⚠️ To be locked down together with the Phase 27.2 server-side economy fix.
DROP POLICY IF EXISTS "Economy settings anon write" ON public.gamification_settings;
CREATE POLICY "Economy settings anon write" ON public.gamification_settings
    FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gamification_settings TO anon, authenticated;

-- Seed current live values (idempotent — never overwrites admin edits).
INSERT INTO public.gamification_settings (key, value) VALUES
    ('xp.song_listen',              10),
    ('xp.daily_login',              50),
    ('xp.playlist_create',         100),
    ('xp.listing_create',          200),
    ('xp.ticket_purchase',         500),
    ('xp.event_photo',              25),
    ('xp.blog_published',          150),
    ('coins.blog_published',        25),
    ('coins.starting_balance',     100),
    ('coins.levelup_per_level',     10),
    ('cost.ad_free_24h',            20),
    ('cost.listing_boost',          50),
    ('cost.track_boost',            50),
    ('limit.daily_listen_xp_cap',   50),
    ('economy.coins_per_usd',      100)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2) Trust Rank removal (vestigial third currency — earned rarely, spent never)
-- ---------------------------------------------------------------------------
ALTER TABLE public.gamification_profiles DROP COLUMN IF EXISTS trust_rank;
ALTER TABLE public.missions DROP COLUMN IF EXISTS reputation_reward;
