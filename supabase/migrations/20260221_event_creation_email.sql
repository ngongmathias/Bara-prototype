-- Project-Wide Email Hardening: Event Creation & Marketplace Robustness (FIXED COLUMN NAMES)
-- 1. Add Event Creation Trigger
-- This ensures organizers get an email when they successfully submit a new event.

CREATE OR REPLACE FUNCTION public.handle_event_creation_email()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
    VALUES (
        COALESCE(NEW.organizer_email, NEW.created_by_email),
        '📅 Event Received: ' || NEW.title,
        '<p>Hi ' || COALESCE(NEW.organizer_name, NEW.created_by_name, 'Organizer') || ',</p><p>Thank you for submitting <strong>' || NEW.title || '</strong> to Bara Afrika.</p><p>Our team is reviewing the details. You will receive another email once your event is approved and live on the platform.</p>',
        jsonb_build_object('event_id', NEW.id, 'type', 'event_submission')
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for event creation: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to events table
DROP TRIGGER IF EXISTS tr_event_creation_email ON public.events;
CREATE TRIGGER tr_event_creation_email
AFTER INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_event_creation_email();

-- 2. Add Event Approval Trigger
-- Notifies the organizer when the admin approves the event.
-- We check for either event_status change OR approved_at being set.

CREATE OR REPLACE FUNCTION public.handle_event_approval_email()
RETURNS TRIGGER AS $$
BEGIN
    -- If approved_at was NULL and is now SET, or if event_status changes from 'pending' (or similar) to 'upcoming'
    IF (OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL) OR 
       (OLD.event_status != 'upcoming' AND NEW.event_status = 'upcoming') 
    THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            COALESCE(NEW.organizer_email, NEW.created_by_email),
            '✅ Event Live! ' || NEW.title,
            '<p>Hi ' || COALESCE(NEW.organizer_name, NEW.created_by_name, 'Organizer') || ',</p><p>Great news! Your event <strong>' || NEW.title || '</strong> has been approved and is now live on Bara Afrika.</p><p>Users can now view and register for your event.</p>',
            jsonb_build_object('event_id', NEW.id, 'type', 'event_approved')
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for event approval: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to events table for status updates
DROP TRIGGER IF EXISTS tr_event_approval_email ON public.events;
CREATE TRIGGER tr_event_approval_email
AFTER UPDATE ON public.events
FOR EACH ROW
WHEN (OLD.approved_at IS DISTINCT FROM NEW.approved_at OR OLD.event_status IS DISTINCT FROM NEW.event_status)
EXECUTE FUNCTION public.handle_event_approval_email();

-- 3. Ensure Marketplace triggers (marketplace_listings table uses 'status' column, so this stays as is)
CREATE OR REPLACE FUNCTION public.handle_marketplace_listing_email()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.seller_email,
            '🛒 Listing Received: ' || NEW.title,
            '<p>Hi ' || COALESCE(NEW.seller_name, 'Seller') || ',</p><p>Your marketplace listing <strong>' || NEW.title || '</strong> has been received and is currently <strong>' || NEW.status || '</strong>.</p><p>We will notify you once it is approved and published.</p>',
            jsonb_build_object('listing_id', NEW.id, 'type', 'marketplace_submission')
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.seller_email,
            '✅ Listing Published! ' || NEW.title,
            '<p>Hi ' || COALESCE(NEW.seller_name, 'Seller') || ',</p><p>Good news! Your listing <strong>' || NEW.title || '</strong> is now active on the Bara Marketplace.</p>',
            jsonb_build_object('listing_id', NEW.id, 'type', 'marketplace_published')
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for marketplace: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
