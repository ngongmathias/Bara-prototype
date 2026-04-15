-- User-to-user follow graph. Users can follow any other user to see their
-- public activity (events, playlists, posts) in a personal feed.

CREATE TABLE IF NOT EXISTS public.user_follows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_user_id text NOT NULL,
    followee_user_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (follower_user_id, followee_user_id),
    CHECK (follower_user_id <> followee_user_id)
);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON public.user_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS user_follows_followee_idx ON public.user_follows(followee_user_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Follow counts are public (anyone can see the graph).
DROP POLICY IF EXISTS "user_follows_select_all" ON public.user_follows;
CREATE POLICY "user_follows_select_all"
ON public.user_follows FOR SELECT
USING (true);

-- A user can only create a follow row where they are the follower.
DROP POLICY IF EXISTS "user_follows_insert_own" ON public.user_follows;
CREATE POLICY "user_follows_insert_own"
ON public.user_follows FOR INSERT
WITH CHECK (follower_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- A user can only unfollow (delete) their own follow rows.
DROP POLICY IF EXISTS "user_follows_delete_own" ON public.user_follows;
CREATE POLICY "user_follows_delete_own"
ON public.user_follows FOR DELETE
USING (follower_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
