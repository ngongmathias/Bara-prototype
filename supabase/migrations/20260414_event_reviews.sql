-- Post-event reviews: attendees rate an event (1-5 stars), write a short review
-- and optionally attach photos. Reviews are only allowed after the event's
-- start_date has passed.

CREATE TABLE IF NOT EXISTS public.event_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    reviewer_user_id text NOT NULL,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    body text,
    photo_urls text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (event_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS event_reviews_event_idx  ON public.event_reviews(event_id);
CREATE INDEX IF NOT EXISTS event_reviews_author_idx ON public.event_reviews(reviewer_user_id);

ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_reviews_select_all" ON public.event_reviews;
CREATE POLICY "event_reviews_select_all"
ON public.event_reviews FOR SELECT
USING (true);

DROP POLICY IF EXISTS "event_reviews_insert_own" ON public.event_reviews;
CREATE POLICY "event_reviews_insert_own"
ON public.event_reviews FOR INSERT
WITH CHECK (
    reviewer_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND EXISTS (
        SELECT 1 FROM public.events e
         WHERE e.id = event_id
           AND e.start_date <= now()
    )
);

DROP POLICY IF EXISTS "event_reviews_update_own" ON public.event_reviews;
CREATE POLICY "event_reviews_update_own"
ON public.event_reviews FOR UPDATE
USING (reviewer_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "event_reviews_delete_own" ON public.event_reviews;
CREATE POLICY "event_reviews_delete_own"
ON public.event_reviews FOR DELETE
USING (reviewer_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
