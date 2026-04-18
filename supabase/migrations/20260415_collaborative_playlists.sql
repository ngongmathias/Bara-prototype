-- Collaborative playlists: multiple users can add songs via join link.

ALTER TABLE public.playlists
    ADD COLUMN IF NOT EXISTS is_collaborative boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

CREATE TABLE IF NOT EXISTS public.playlist_collaborators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    user_id text NOT NULL,
    added_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (playlist_id, user_id)
);

CREATE INDEX IF NOT EXISTS playlist_collaborators_playlist_idx ON public.playlist_collaborators(playlist_id);
CREATE INDEX IF NOT EXISTS playlist_collaborators_user_idx ON public.playlist_collaborators(user_id);

ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collab_select_all" ON public.playlist_collaborators;
CREATE POLICY "collab_select_all"
ON public.playlist_collaborators FOR SELECT
USING (true);

DROP POLICY IF EXISTS "collab_insert_owner" ON public.playlist_collaborators;
CREATE POLICY "collab_insert_owner"
ON public.playlist_collaborators FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.playlists
        WHERE id = playlist_id
        AND created_by = current_setting('request.jwt.claims', true)::json->>'sub'
    )
);

DROP POLICY IF EXISTS "collab_delete_owner_or_self" ON public.playlist_collaborators;
CREATE POLICY "collab_delete_owner_or_self"
ON public.playlist_collaborators FOR DELETE
USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR EXISTS (
        SELECT 1 FROM public.playlists
        WHERE id = playlist_id
        AND created_by = current_setting('request.jwt.claims', true)::json->>'sub'
    )
);

-- Allow collaborators to insert songs into collaborative playlists
DROP POLICY IF EXISTS "collab_add_songs" ON public.playlist_songs;
CREATE POLICY "collab_add_songs"
ON public.playlist_songs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.playlists p
        WHERE p.id = playlist_id
        AND p.is_collaborative = true
        AND (
            p.created_by = current_setting('request.jwt.claims', true)::json->>'sub'
            OR EXISTS (
                SELECT 1 FROM public.playlist_collaborators pc
                WHERE pc.playlist_id = p.id
                AND pc.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
    )
);
