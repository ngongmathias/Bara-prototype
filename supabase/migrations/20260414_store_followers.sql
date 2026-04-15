-- Store followers: users can follow a marketplace partner (store) to receive
-- notifications when they publish new ads.

CREATE TABLE IF NOT EXISTS public.store_followers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid NOT NULL REFERENCES public.marketplace_partners(id) ON DELETE CASCADE,
    user_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (partner_id, user_id)
);

CREATE INDEX IF NOT EXISTS store_followers_partner_idx ON public.store_followers(partner_id);
CREATE INDEX IF NOT EXISTS store_followers_user_idx    ON public.store_followers(user_id);

ALTER TABLE public.store_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can see follower rows (so counts are visible).
DROP POLICY IF EXISTS "store_followers_select_all" ON public.store_followers;
CREATE POLICY "store_followers_select_all"
ON public.store_followers FOR SELECT
USING (true);

-- Users can follow (insert as themselves).
DROP POLICY IF EXISTS "store_followers_insert_own" ON public.store_followers;
CREATE POLICY "store_followers_insert_own"
ON public.store_followers FOR INSERT
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can unfollow (delete as themselves).
DROP POLICY IF EXISTS "store_followers_delete_own" ON public.store_followers;
CREATE POLICY "store_followers_delete_own"
ON public.store_followers FOR DELETE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Notify all followers when a partner owner publishes a new active listing.
CREATE OR REPLACE FUNCTION public.notify_store_followers_new_listing()
RETURNS trigger AS $$
DECLARE
    v_partner_id uuid;
    v_store_name text;
BEGIN
    IF NEW.status <> 'active' THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
        RETURN NEW;
    END IF;

    SELECT id, display_name
      INTO v_partner_id, v_store_name
      FROM public.marketplace_partners
     WHERE owner_user_id = NEW.created_by
     LIMIT 1;

    IF v_partner_id IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT
        sf.user_id,
        'store_new_listing',
        v_store_name || ' posted a new ad',
        NEW.title,
        '/marketplace/ad/' || NEW.id
      FROM public.store_followers sf
     WHERE sf.partner_id = v_partner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_store_followers ON public.marketplace_listings;
CREATE TRIGGER trg_notify_store_followers
AFTER INSERT OR UPDATE OF status ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.notify_store_followers_new_listing();
