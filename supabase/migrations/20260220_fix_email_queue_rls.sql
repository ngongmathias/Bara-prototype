-- Add RLS policy for email_queue to allow inserts from authenticated and anon users for testing
-- In a production app, you might want to restrict this or have a more complex logic,
-- but for the prototype and testing, we need to allow the frontend to enqueue emails.

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert emails into the queue" ON public.email_queue;
CREATE POLICY "Anyone can insert emails into the queue" ON public.email_queue
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own enqueued emails" ON public.email_queue;
CREATE POLICY "Users can view their own enqueued emails" ON public.email_queue
    FOR SELECT 
    TO authenticated 
    USING (to_email = (SELECT email FROM public.user_profiles WHERE user_id = auth.uid()));

-- Also ensure the service_role still has all access
DROP POLICY IF EXISTS "Service role can manage email_queue" ON public.email_queue;
CREATE POLICY "Service role can manage email_queue" ON public.email_queue
    FOR ALL 
    TO service_role 
    USING (true);
