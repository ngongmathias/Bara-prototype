-- Standardize Email Queue and Triggers for Template Support
-- 1. Make html_content nullable (so we can use type/data instead)
ALTER TABLE public.email_queue ALTER COLUMN html_content DROP NOT NULL;

-- 2. Update Event Registration Trigger (Tickets)
-- This now produces a payload identical to the working test page
CREATE OR REPLACE FUNCTION public.handle_event_registration_email()
RETURNS TRIGGER AS $$
DECLARE
    event_data record;
    total_amount text;
BEGIN
    -- Fetch event details
    SELECT title, start_date, currency, entry_fee INTO event_data FROM events WHERE id = NEW.event_id;

    -- Calculate total
    total_amount := COALESCE(NEW.quantity * event_data.entry_fee, 0) || ' ' || COALESCE(event_data.currency, 'RWF');

    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'confirmed' AND NEW.payment_method = 'free') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.user_email,
            '🎟️ Order Confirmed: ' || COALESCE(event_data.title, 'Your Event'),
            jsonb_build_object(
                'type', 'ticket_purchased',
                'data', jsonb_build_object(
                    'userFirstname', COALESCE(SPLIT_PART(NEW.user_name, ' ', 1), 'Guest'),
                    'eventName', COALESCE(event_data.title, 'Bara Event'),
                    'eventDate', to_char(event_data.start_date, 'Month DD, YYYY'),
                    'ticketCount', NEW.quantity,
                    'totalAmount', 'FREE',
                    'ticketId', UPPER(LEFT(NEW.id::text, 8))
                )
            )
        );
    ELSIF (TG_OP = 'INSERT' AND NEW.payment_status = 'pending') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.user_email,
            '⌛ Spot Reserved: ' || COALESCE(event_data.title, 'Your Event'),
            jsonb_build_object(
                'type', 'ticket_reserved_pending',
                'data', jsonb_build_object(
                    'userFirstname', COALESCE(SPLIT_PART(NEW.user_name, ' ', 1), 'Guest'),
                    'eventName', COALESCE(event_data.title, 'Bara Event'),
                    'eventDate', to_char(event_data.start_date, 'Month DD, YYYY'),
                    'ticketCount', NEW.quantity,
                    'totalAmount', total_amount,
                    'ticketId', UPPER(LEFT(NEW.id::text, 8))
                )
            )
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status != 'confirmed' AND NEW.payment_status = 'confirmed') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.user_email,
            '✅ Payment Confirmed! Ticket for ' || COALESCE(event_data.title, 'Your Event'),
            jsonb_build_object(
                'type', 'ticket_purchased',
                'data', jsonb_build_object(
                    'userFirstname', COALESCE(SPLIT_PART(NEW.user_name, ' ', 1), 'Guest'),
                    'eventName', COALESCE(event_data.title, 'Bara Event'),
                    'eventDate', to_char(event_data.start_date, 'Month DD, YYYY'),
                    'ticketCount', NEW.quantity,
                    'totalAmount', total_amount,
                    'ticketId', UPPER(LEFT(NEW.id::text, 8))
                )
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for registration: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Marketplace Trigger
CREATE OR REPLACE FUNCTION public.handle_marketplace_listing_email()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.seller_email,
            '🛒 Listing Received: ' || NEW.title,
            jsonb_build_object(
                'type', 'listing_created',
                'data', jsonb_build_object(
                    'sellerName', COALESCE(NEW.seller_name, 'Seller'),
                    'listingTitle', NEW.title,
                    'listingStatus', NEW.status
                )
            )
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.seller_email,
            '✅ Listing Published! ' || NEW.title,
            jsonb_build_object(
                'type', 'listing_approved',
                'data', jsonb_build_object(
                    'sellerName', COALESCE(NEW.seller_name, 'Seller'),
                    'listingTitle', NEW.title
                )
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for marketplace: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Event Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_event_creation_email()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.email_queue (to_email, subject, metadata)
    VALUES (
        COALESCE(NEW.organizer_email, NEW.created_by_email),
        '📅 Event Received: ' || NEW.title,
        jsonb_build_object(
            'type', 'event_submitted',
            'data', jsonb_build_object(
                'organizerName', COALESCE(NEW.organizer_name, NEW.created_by_name, 'Organizer'),
                'eventName', NEW.title
            )
        )
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for event creation: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update Welcome Email Trigger
CREATE OR REPLACE FUNCTION public.handle_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.email_queue (to_email, subject, metadata)
    VALUES (
        NEW.email,
        '🌍 Welcome to Bara Afrika!',
        jsonb_build_object(
            'type', 'welcome',
            'data', jsonb_build_object(
                'userFirstname', COALESCE(SPLIT_PART(NEW.full_name, ' ', 1), 'there')
            )
        )
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for welcome: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
