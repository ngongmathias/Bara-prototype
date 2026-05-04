-- Add listing_rejected branch to the marketplace email trigger.
-- Matches the payload shape AdminMarketplace.updateListingStatus was sending
-- via direct send-email invoke, so the direct call site can be removed
-- (closes 22.5.1 / 22.5.6 in MASTER_PLAN.md).

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
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'rejected' AND NEW.status = 'rejected') THEN
        INSERT INTO public.email_queue (to_email, subject, metadata)
        VALUES (
            NEW.seller_email,
            'Marketplace Ad Update - Bara Afrika',
            jsonb_build_object(
                'type', 'listing_rejected',
                'data', jsonb_build_object(
                    'userFirstname', COALESCE(SPLIT_PART(NEW.seller_name, ' ', 1), 'User'),
                    'listingTitle', NEW.title,
                    'reason', 'Does not meet community guidelines'
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
