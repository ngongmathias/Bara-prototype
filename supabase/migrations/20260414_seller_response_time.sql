-- Seller response time: compute an EWMA of the time between an inbound
-- message from a buyer and the seller's next reply in the same conversation,
-- and persist it on marketplace_partners.response_time_hours. MarketplaceStorefront
-- already renders this as "Replies in ~Xh".

CREATE OR REPLACE FUNCTION public.update_seller_response_time()
RETURNS trigger AS $$
DECLARE
    v_prev_inbound timestamptz;
    v_delta_hours numeric;
BEGIN
    -- Find the most recent message in this conversation from a different sender
    -- before this new message.
    SELECT created_at
      INTO v_prev_inbound
      FROM public.messages
     WHERE conversation_id = NEW.conversation_id
       AND sender_id <> NEW.sender_id
       AND created_at < NEW.created_at
     ORDER BY created_at DESC
     LIMIT 1;

    IF v_prev_inbound IS NULL THEN
        RETURN NEW;
    END IF;

    v_delta_hours := EXTRACT(EPOCH FROM (NEW.created_at - v_prev_inbound)) / 3600.0;

    -- Cap outliers at one week so a single stale reply doesn't poison the average.
    IF v_delta_hours > 168 THEN
        RETURN NEW;
    END IF;

    -- Update the running EWMA on this seller's partner profile.
    UPDATE public.marketplace_partners
       SET response_time_hours = CASE
             WHEN response_time_hours IS NULL THEN ROUND(v_delta_hours::numeric, 1)
             ELSE ROUND(((response_time_hours * 0.8) + (v_delta_hours * 0.2))::numeric, 1)
           END
     WHERE owner_user_id = NEW.sender_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_seller_response_time ON public.messages;
CREATE TRIGGER trg_update_seller_response_time
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_response_time();
