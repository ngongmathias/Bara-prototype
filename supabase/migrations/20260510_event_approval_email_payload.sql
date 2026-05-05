-- Upgrade handle_event_approval_email to the nested metadata.data shape
-- (matching template_standards.sql / handle_marketplace_listing_email).
--
-- The send-email edge function reads templateData from
-- payload.metadata?.data, but this trigger had been writing flat metadata
-- (event_id at the top level), so EventApprovedEmail was always rendering
-- with default props ("Hi Organizer," "Your Event," empty eventId). The
-- "View Your Event" CTA was therefore stuck pointing at a generic /events
-- with no event id ever passed (22.1.4 in MASTER_PLAN.md).
--
-- This migration also stops emoji-prefixing the subject line, matching the
-- 22.1.2 (no emojis in headings) hygiene applied to the React Email
-- templates themselves.

CREATE OR REPLACE FUNCTION public.handle_event_approval_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Approval signal: approved_at moved from NULL to NOT NULL,
    -- OR event_status transitioned to 'upcoming' from any other state.
    IF (OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL)
       OR (OLD.event_status != 'upcoming' AND NEW.event_status = 'upcoming')
    THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            COALESCE(NEW.organizer_email, NEW.created_by_email),
            'Event Live: ' || NEW.title,
            jsonb_build_object(
                'type', 'event_approved',
                'data', jsonb_build_object(
                    'organizerName', COALESCE(NEW.organizer_name, NEW.created_by_name, 'Organizer'),
                    'eventName', NEW.title,
                    'eventId', NEW.id
                )
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for event approval: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
