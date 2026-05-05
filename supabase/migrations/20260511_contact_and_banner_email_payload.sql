-- Wire ContactFormConfirmationEmail (22.2) + upgrade BannerRequestEmail
-- payload to the nested metadata.data shape (22.1.4 / 22.5.1).
--
-- (1) The contact form (ContactUsPage / useContactMessages) inserts into
--     contact_messages but never sends a confirmation email — the user
--     just sees a toast. Add a DB trigger that enqueues
--     ContactFormConfirmationEmail on INSERT.
--
-- (2) The banner submission trigger handle_banner_submission_email
--     already exists and fires on user_slideshow_submissions INSERT, but
--     it writes the OLD flat metadata shape ({ submission_id, type })
--     instead of the nested { type, data: {...} } shape that send-email
--     reads. Result: BannerRequestEmail has been rendering with all
--     defaults — "Hi Advertiser," "Homepage Banner" — even though the
--     submission carries a real user_name and media_type. Same class of
--     bug as the event_approval payload fix from 20260510.
--
-- Subject lines also de-emojified to match the 22.1.2 hygiene applied to
-- the React Email templates themselves.

-- =========================
-- (1) Contact form confirmation
-- =========================

CREATE OR REPLACE FUNCTION public.handle_contact_message_email()
RETURNS TRIGGER AS $$
DECLARE
    user_first_name TEXT;
BEGIN
    user_first_name := COALESCE(NULLIF(TRIM(NEW.first_name), ''), 'there');

    INSERT INTO public.email_queue (to_email, subject, metadata)
    VALUES (
        NEW.email,
        'We received your message',
        jsonb_build_object(
            'type', 'contact_form_confirmation',
            'data', jsonb_build_object(
                'userName', user_first_name,
                'subject', COALESCE(NULLIF(TRIM(NEW.subject), ''), 'your inquiry')
            )
        )
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for contact_messages: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_contact_message_email ON public.contact_messages;
CREATE TRIGGER tr_contact_message_email
    AFTER INSERT ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_contact_message_email();

-- =========================
-- (2) Banner submission — upgrade to nested metadata.data shape
-- =========================

CREATE OR REPLACE FUNCTION public.handle_banner_submission_email()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.user_email,
            'Banner Submission Received',
            jsonb_build_object(
                'type', 'banner_submission',
                'data', jsonb_build_object(
                    'userName', COALESCE(NEW.user_name, 'Advertiser'),
                    'bannerType', INITCAP(COALESCE(NEW.media_type, 'banner')) || ' Banner'
                )
            )
        );
    ELSIF (TG_OP = 'UPDATE'
           AND OLD.submission_status != 'approved'
           AND NEW.submission_status = 'approved') THEN
        -- 'banner_approved' has no React Email template yet (see send-email
        -- index.ts case statement); fall through to a plain html_content
        -- so the queue+webhook still delivers SOMETHING. Add a dedicated
        -- BannerApprovedEmail later if the team wants a richer template.
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.user_email,
            'Banner Approved',
            '<p>Hi ' || COALESCE(NEW.user_name, 'there') || ',</p>' ||
            '<p>Your banner submission has been approved and is now live on Bara Afrika.</p>',
            jsonb_build_object(
                'type', 'banner_approved',
                'data', jsonb_build_object(
                    'userName', COALESCE(NEW.user_name, 'Advertiser')
                )
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for banner: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
