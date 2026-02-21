-- Fix RLS policies for email_queue
-- Allow inserts from authenticated and anon users (for frontend testing and trigger-based inserts)

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + logged in) to insert emails into the queue
DROP POLICY IF EXISTS "Anyone can insert emails into the queue" ON public.email_queue;
CREATE POLICY "Anyone can insert emails into the queue" ON public.email_queue
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Allow authenticated users to view their own enqueued emails
-- NOTE: auth.uid() is uuid but user_id in user_profiles is text, so we cast
DROP POLICY IF EXISTS "Users can view their own enqueued emails" ON public.email_queue;
CREATE POLICY "Users can view their own enqueued emails" ON public.email_queue
    FOR SELECT 
    TO authenticated 
    USING (to_email = (SELECT email FROM public.user_profiles WHERE user_id = auth.uid()::text));

-- Service role retains full access for background processing
DROP POLICY IF EXISTS "Service role can manage email_queue" ON public.email_queue;
CREATE POLICY "Service role can manage email_queue" ON public.email_queue
    FOR ALL 
    TO service_role 
    USING (true);
