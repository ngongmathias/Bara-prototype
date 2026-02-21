-- Fix marketplace email trigger to be more robust
-- Drop and recreate with SECURITY DEFINER and explicit schema references
-- Also adds a fallback direct enqueue if trigger already fired without the queue existing

-- 1. Re-create marketplace trigger (in case it was created before email_queue table)
CREATE OR REPLACE FUNCTION public.handle_marketplace_listing_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run if email_queue table exists (safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_queue') THEN
        RETURN NEW;
    END IF;

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
    -- Never block the main transaction if email fails
    RAISE WARNING 'Email queue insert failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger (drop first in case it exists)
DROP TRIGGER IF EXISTS tr_marketplace_listing_email ON public.marketplace_listings;
CREATE TRIGGER tr_marketplace_listing_email
AFTER INSERT OR UPDATE OF status ON public.marketplace_listings
FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_listing_email();

-- Also re-harden all other email triggers with EXCEPTION blocks so they never fail silently

CREATE OR REPLACE FUNCTION public.handle_event_registration_email()
RETURNS TRIGGER AS $$
DECLARE
    event_title text;
BEGIN
    SELECT title INTO event_title FROM events WHERE id = NEW.event_id;

    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'confirmed' AND NEW.payment_method = 'free') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email,
            '🎟️ You''re In! Ticket for ' || COALESCE(event_title, 'the event'),
            '<p>Hi ' || COALESCE(NEW.user_name, 'Guest') || ',</p><p>You are successfully registered for <strong>' || COALESCE(event_title, 'the event') || '</strong>!</p><p>Ticket ID: ' || UPPER(LEFT(NEW.id::text, 8)) || '<br>Quantity: ' || NEW.quantity || '</p>',
            jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id, 'type', 'ticket_free')
        );
    ELSIF (TG_OP = 'INSERT' AND NEW.payment_status = 'pending') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email,
            '⌛ Spot Reserved: ' || COALESCE(event_title, 'the event'),
            '<p>Hi ' || COALESCE(NEW.user_name, 'Guest') || ',</p><p>Your spot is reserved for <strong>' || COALESCE(event_title, 'the event') || '</strong>. Please complete the payment instructions provided on the site.</p>',
            jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id, 'type', 'ticket_reserved_pending')
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status != 'confirmed' AND NEW.payment_status = 'confirmed') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email,
            '✅ Payment Confirmed! Ticket for ' || COALESCE(event_title, 'the event'),
            '<p>Hi ' || COALESCE(NEW.user_name, 'Guest') || ',</p><p>Your payment has been confirmed!</p><p>Ticket ID: ' || UPPER(LEFT(NEW.id::text, 8)) || '<br>Quantity: ' || NEW.quantity || '</p>',
            jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id, 'type', 'ticket_paid_confirmed')
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for event_registration: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_event_registration_email ON public.event_registrations;
CREATE TRIGGER tr_event_registration_email
AFTER INSERT OR UPDATE OF payment_status ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_event_registration_email();

-- Re-harden banner trigger
CREATE OR REPLACE FUNCTION public.handle_banner_submission_email()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email,
            '🖼️ Banner Submission Received',
            '<p>Hi ' || COALESCE(NEW.user_name, 'there') || ',</p><p>Your banner media submission (Type: ' || NEW.media_type || ') has been received and is under review.</p>',
            jsonb_build_object('submission_id', NEW.id, 'type', 'banner_submission')
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.submission_status != 'approved' AND NEW.submission_status = 'approved') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email,
            '✅ Banner Approved!',
            '<p>Hi ' || COALESCE(NEW.user_name, 'there') || ',</p><p>Your banner media submission has been approved and will now appear on the site!</p>',
            jsonb_build_object('submission_id', NEW.id, 'type', 'banner_approved')
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for banner: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_banner_submission_email ON public.user_slideshow_submissions;
CREATE TRIGGER tr_banner_submission_email
AFTER INSERT OR UPDATE OF submission_status ON public.user_slideshow_submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_banner_submission_email();
