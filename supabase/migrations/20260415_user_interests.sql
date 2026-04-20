-- User interests: users pick event categories they care about.
-- Used to surface matching events in recommendations.

CREATE TABLE IF NOT EXISTS public.user_interests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    category_slug text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, category_slug)
);

CREATE INDEX IF NOT EXISTS user_interests_user_idx ON public.user_interests(user_id);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_interests_select_own" ON public.user_interests;
CREATE POLICY "user_interests_select_own"
ON public.user_interests FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "user_interests_insert_own" ON public.user_interests;
CREATE POLICY "user_interests_insert_own"
ON public.user_interests FOR INSERT
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "user_interests_delete_own" ON public.user_interests;
CREATE POLICY "user_interests_delete_own"
ON public.user_interests FOR DELETE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
