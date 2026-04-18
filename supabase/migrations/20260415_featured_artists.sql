-- Rotating featured / spotlight artists on StreamsHome.
-- Admin sets a featured artist with start/end dates; the most recent active row wins.

CREATE TABLE IF NOT EXISTS public.featured_artists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    headline text,
    description text,
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '7 days'),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "featured_artists_select_all" ON public.featured_artists;
CREATE POLICY "featured_artists_select_all"
ON public.featured_artists FOR SELECT
USING (true);
