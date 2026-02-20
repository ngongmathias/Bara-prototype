-- Create Email Status Enum
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
        CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');
    END IF;
END $$;

-- Create Email Queue Table
CREATE TABLE IF NOT EXISTS public.email_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email text NOT NULL,
    subject text NOT NULL,
    html_content text NOT NULL,
    status email_status DEFAULT 'pending',
    retry_count int DEFAULT 0,
    error_message text,
    created_at timestamptz DEFAULT now(),
    sent_at timestamptz,
    metadata jsonb -- For storing extra context like event_id or user_id
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage the queue
DROP POLICY IF EXISTS "Service role can manage email_queue" ON public.email_queue;
CREATE POLICY "Service role can manage email_queue" ON public.email_queue
    FOR ALL TO service_role USING (true);

-- 1. Function to Enqueue Event Confirmation Email
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
            '🎟️ You''re In! Ticket for ' || event_title,
            '<p>Hi ' || COALESCE(NEW.user_name, 'Guest') || ',</p><p>You are successfully registered for <strong>' || event_title || '</strong>!</p><p>Ticket ID: ' || UPPER(LEFT(NEW.id::text, 8)) || '<br>Quantity: ' || NEW.quantity || '</p>',
            jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id, 'type', 'ticket_free')
        );
    ELSIF (TG_OP = 'INSERT' AND NEW.payment_status = 'pending') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email, 
            '⌛ Spot Reserved: ' || event_title,
            '<p>Hi ' || COALESCE(NEW.user_name, 'Guest') || ',</p><p>Your spot is reserved for <strong>' || event_title || '</strong>. Please complete the payment instructions provided on the site.</p><p>The organizer will verify your payment and confirm your ticket shortly.</p>',
            jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id, 'type', 'ticket_reserved_pending')
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status != 'confirmed' AND NEW.payment_status = 'confirmed') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email, 
            '✅ Payment Confirmed! Ticket for ' || event_title,
            '<p>Hi ' || COALESCE(NEW.user_name, 'Guest') || ',</p><p>Your payment for <strong>' || event_title || '</strong> has been confirmed!</p><p>Ticket ID: ' || UPPER(LEFT(NEW.id::text, 8)) || '<br>Quantity: ' || NEW.quantity || '</p>',
            jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id, 'type', 'ticket_paid_confirmed')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Event Registrations
DROP TRIGGER IF EXISTS tr_event_registration_email ON public.event_registrations;
CREATE TRIGGER tr_event_registration_email
AFTER INSERT OR UPDATE OF payment_status ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_event_registration_email();

-- 2. Function for Welcome Email
CREATE OR REPLACE FUNCTION public.handle_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
    VALUES (
        NEW.email,
        '🌍 Welcome to Bara Afrika!',
        '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>We are excited to have you on board the Bara Afrika prototype. Start exploring music, sports, and local communities today!</p>',
        jsonb_build_object('user_id', NEW.id, 'type', 'welcome_email')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Users
DROP TRIGGER IF EXISTS tr_welcome_email ON public.clerk_users;
CREATE TRIGGER tr_welcome_email
AFTER INSERT ON public.clerk_users
FOR EACH ROW EXECUTE FUNCTION public.handle_welcome_email();

-- 3. Function for Marketplace Listings
CREATE OR REPLACE FUNCTION public.handle_marketplace_listing_email()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.seller_email, 
            '🛒 Listing Received: ' || NEW.title,
            '<p>Hi ' || NEW.seller_name || ',</p><p>Your marketplace listing <strong>' || NEW.title || '</strong> has been received and is currently <strong>' || NEW.status || '</strong>.</p><p>We will notify you once it is approved and published.</p>',
            jsonb_build_object('listing_id', NEW.id, 'type', 'marketplace_submission')
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active') THEN
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.seller_email, 
            '✅ Listing Published! ' || NEW.title,
            '<p>Hi ' || NEW.seller_name || ',</p><p>Good news! Your listing <strong>' || NEW.title || '</strong> is now active on the Bara Marketplace.</p>',
            jsonb_build_object('listing_id', NEW.id, 'type', 'marketplace_published')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Marketplace Listings
DROP TRIGGER IF EXISTS tr_marketplace_listing_email ON public.marketplace_listings;
CREATE TRIGGER tr_marketplace_listing_email
AFTER INSERT OR UPDATE OF status ON public.marketplace_listings
FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_listing_email();

-- 4. Function for Banner Submissions
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Banner Submissions
DROP TRIGGER IF EXISTS tr_banner_submission_email ON public.user_slideshow_submissions;
CREATE TRIGGER tr_banner_submission_email
AFTER INSERT OR UPDATE OF submission_status ON public.user_slideshow_submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_banner_submission_email();
