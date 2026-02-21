-- 20260221_business_claims_system.sql
-- Create business_claims table for verification workflow

CREATE TABLE IF NOT EXISTS public.business_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    claimer_id TEXT NOT NULL, -- Clerk User ID
    claimer_name TEXT,
    claimer_email TEXT NOT NULL,
    proof_url TEXT, -- Optional link to proof document
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own claims" ON public.business_claims
    FOR SELECT USING (claimer_id = auth.uid()::text);

CREATE POLICY "Users can insert their own claims" ON public.business_claims
    FOR INSERT WITH CHECK (claimer_id = auth.uid()::text);

-- Trigger for email notification on claim submission
CREATE OR REPLACE FUNCTION public.handle_business_claim_email()
RETURNS TRIGGER AS $$
DECLARE
    business_record RECORD;
BEGIN
    SELECT * INTO business_record FROM businesses WHERE id = NEW.business_id;

    IF (TG_OP = 'INSERT') THEN
        -- Notify the claimer
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.claimer_email,
            '🏢 Claim Received: ' || COALESCE(business_record.name, 'Business'),
            '<p>Hi ' || COALESCE(NEW.claimer_name, 'there') || ',</p><p>We have received your claim for <strong>' || COALESCE(business_record.name, 'the business') || '</strong>. Our team will review your request and get back to you shortly.</p><p>Status: <strong>Pending Review</strong></p>',
            jsonb_build_object('business_id', NEW.business_id, 'claim_id', NEW.id, 'type', 'business_claim_submission')
        );
        
        -- Also notify the business email if different from claimer email (as a security measure)
        IF business_record.email IS NOT NULL AND business_record.email != NEW.claimer_email THEN
            INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
            VALUES (
                business_record.email,
                '⚠️ Business Claim Alert: ' || business_record.name,
                '<p>Hello,</p><p>A claim has been submitted for your business <strong>' || business_record.name || '</strong> by ' || NEW.claimer_name || ' (' || NEW.claimer_email || ').</p><p>If this was not you, please contact support immediately.</p>',
                jsonb_build_object('business_id', NEW.business_id, 'claim_id', NEW.id, 'type', 'business_claim_alert')
            );
        END IF;

    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved') THEN
        -- Notify the claimer of approval
        INSERT INTO public.email_queue (to_email, subject, html_content, metadata)
        VALUES (
            NEW.claimer_email,
            '✅ Business Claim Approved! ' || COALESCE(business_record.name, 'Business'),
            '<p>Hi ' || COALESCE(NEW.claimer_name, 'there') || ',</p><p>Congratulations! Your claim for <strong>' || COALESCE(business_record.name, 'the business') || '</strong> has been approved. You can now manage your listing from the dashboard.</p>',
            jsonb_build_object('business_id', NEW.business_id, 'claim_id', NEW.id, 'type', 'business_claim_approved')
        );
        
        -- Mark business as verified
        UPDATE businesses SET is_verified = true WHERE id = NEW.business_id;
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Email queue insert failed for business_claim: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_business_claim_email ON public.business_claims;
CREATE TRIGGER tr_business_claim_email
AFTER INSERT OR UPDATE OF status ON public.business_claims
FOR EACH ROW EXECUTE FUNCTION public.handle_business_claim_email();
