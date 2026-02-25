-- Add total_amount to event_registrations
ALTER TABLE public.event_registrations
ADD COLUMN total_amount NUMERIC DEFAULT 0;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
