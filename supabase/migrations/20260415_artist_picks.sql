-- Artist Picks: verified artists can pin 3-5 tracks to top of their profile.

CREATE TABLE IF NOT EXISTS public.artist_picks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    display_order int NOT NULL DEFAULT 0,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (artist_id, song_id)
);

CREATE INDEX IF NOT EXISTS artist_picks_artist_idx ON public.artist_picks(artist_id);

ALTER TABLE public.artist_picks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artist_picks_select_all" ON public.artist_picks;
CREATE POLICY "artist_picks_select_all"
ON public.artist_picks FOR SELECT
USING (true);

DROP POLICY IF EXISTS "artist_picks_insert_own" ON public.artist_picks;
CREATE POLICY "artist_picks_insert_own"
ON public.artist_picks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.artists
        WHERE id = artist_id
        AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
);

DROP POLICY IF EXISTS "artist_picks_update_own" ON public.artist_picks;
CREATE POLICY "artist_picks_update_own"
ON public.artist_picks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.artists
        WHERE id = artist_id
        AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
);

DROP POLICY IF EXISTS "artist_picks_delete_own" ON public.artist_picks;
CREATE POLICY "artist_picks_delete_own"
ON public.artist_picks FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.artists
        WHERE id = artist_id
        AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
);
