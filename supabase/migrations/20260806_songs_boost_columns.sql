-- ============================================================
-- Fix: ArtistDashboard.tsx has always queried songs.is_premium and
-- songs.boosted_until (Track Boost feature, spends Bara Coins to promote a
-- song for 24h) but neither column was ever added to the table. The select
-- has been failing outright (42703: column does not exist) since the
-- feature was written — silently swallowed by `setSongs(data || [])`, so
-- every artist's "My Songs" tab in the Creator Dashboard has been rendering
-- empty, and the Boost button has been dead. Found during Phase 14 launch
-- QA by cross-checking the code's expected columns against the live schema.
-- ============================================================

ALTER TABLE public.songs
    ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ;

COMMENT ON COLUMN public.songs.is_premium IS 'True while a Track Boost (paid with Bara Coins) is active; ArtistDashboard.tsx checks this alongside boosted_until since is_premium alone is stale once a boost expires.';
COMMENT ON COLUMN public.songs.boosted_until IS 'Expiry of the current Track Boost, if any. NULL when the song has never been boosted.';

CREATE INDEX IF NOT EXISTS idx_songs_boosted_until ON public.songs(boosted_until) WHERE boosted_until IS NOT NULL;

-- §K3 interaction: 20260806_security_hardening.sql revokes table-wide UPDATE
-- on songs and re-grants it only on an explicit column list (so a raw REST
-- call can't touch songs.plays). That list predates these two columns and
-- can't be edited to include them without a fragile cross-file apply-order
-- dependency, so the grant for these columns specifically lives here
-- instead, self-contained, safe to apply before or after that migration.
GRANT UPDATE (is_premium, boosted_until) ON public.songs TO authenticated;
