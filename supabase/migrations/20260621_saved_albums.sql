-- ============================================
-- Saved Albums (F5 / Library) — Clerk TEXT user IDs, anon-client writes
-- Mirrors user_song_likes / user_artist_follows: open RLS (USING true) and
-- grants to anon so the tokenless client used across Streams can read AND write.
-- Run this in your Supabase SQL Editor.
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_album_saves (
    user_id    TEXT NOT NULL,
    album_id   UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, album_id)
);

ALTER TABLE public.user_album_saves ENABLE ROW LEVEL SECURITY;

-- Drop any UUID FK on user_id (in case an older definition referenced auth.users)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'user_album_saves' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%user_id%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_album_saves DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

DO $$
BEGIN
    ALTER TABLE public.user_album_saves ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION WHEN others THEN
    NULL; -- already TEXT
END $$;

-- Open RLS policies (Clerk IDs, not auth.uid())
DROP POLICY IF EXISTS "Users can view their own album saves" ON public.user_album_saves;
CREATE POLICY "Users can view their own album saves" ON public.user_album_saves
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own album saves" ON public.user_album_saves;
CREATE POLICY "Users can insert their own album saves" ON public.user_album_saves
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own album saves" ON public.user_album_saves;
CREATE POLICY "Users can delete their own album saves" ON public.user_album_saves
    FOR DELETE USING (true);

-- Grants — anon must read AND write because Streams uses the tokenless client.
GRANT SELECT, INSERT, DELETE ON public.user_album_saves TO anon;
GRANT SELECT, INSERT, DELETE ON public.user_album_saves TO authenticated;
GRANT ALL ON public.user_album_saves TO service_role;

CREATE INDEX IF NOT EXISTS idx_user_album_saves_user ON public.user_album_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_user_album_saves_album ON public.user_album_saves(album_id);
