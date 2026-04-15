-- Store-level reviews. A buyer rates the overall experience of a marketplace
-- partner (store), not a single listing. marketplace_partners.avg_rating /
-- rating_count are recomputed on every insert/update/delete.

CREATE TABLE IF NOT EXISTS public.store_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid NOT NULL REFERENCES public.marketplace_partners(id) ON DELETE CASCADE,
    reviewer_user_id text NOT NULL,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    body text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (partner_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS store_reviews_partner_idx  ON public.store_reviews(partner_id);
CREATE INDEX IF NOT EXISTS store_reviews_reviewer_idx ON public.store_reviews(reviewer_user_id);

ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are public.
DROP POLICY IF EXISTS "store_reviews_select_all" ON public.store_reviews;
CREATE POLICY "store_reviews_select_all"
ON public.store_reviews FOR SELECT
USING (true);

-- A user can only insert their own reviews and not review themselves.
DROP POLICY IF EXISTS "store_reviews_insert_own" ON public.store_reviews;
CREATE POLICY "store_reviews_insert_own"
ON public.store_reviews FOR INSERT
WITH CHECK (
    reviewer_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND NOT EXISTS (
        SELECT 1 FROM public.marketplace_partners p
         WHERE p.id = partner_id
           AND p.owner_user_id = reviewer_user_id
    )
);

-- Users can edit their own reviews.
DROP POLICY IF EXISTS "store_reviews_update_own" ON public.store_reviews;
CREATE POLICY "store_reviews_update_own"
ON public.store_reviews FOR UPDATE
USING (reviewer_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own reviews.
DROP POLICY IF EXISTS "store_reviews_delete_own" ON public.store_reviews;
CREATE POLICY "store_reviews_delete_own"
ON public.store_reviews FOR DELETE
USING (reviewer_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Maintain aggregate columns on marketplace_partners.
CREATE OR REPLACE FUNCTION public.refresh_store_rating(p_partner_id uuid)
RETURNS void AS $$
DECLARE
    v_count int;
    v_avg numeric;
BEGIN
    SELECT COUNT(*), COALESCE(AVG(rating), 0)
      INTO v_count, v_avg
      FROM public.store_reviews
     WHERE partner_id = p_partner_id;

    UPDATE public.marketplace_partners
       SET rating_count = v_count,
           avg_rating   = ROUND(v_avg::numeric, 2)
     WHERE id = p_partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.store_reviews_after_change()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.refresh_store_rating(OLD.partner_id);
        RETURN OLD;
    ELSE
        PERFORM public.refresh_store_rating(NEW.partner_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_store_reviews_aggregate ON public.store_reviews;
CREATE TRIGGER trg_store_reviews_aggregate
AFTER INSERT OR UPDATE OR DELETE ON public.store_reviews
FOR EACH ROW
EXECUTE FUNCTION public.store_reviews_after_change();
