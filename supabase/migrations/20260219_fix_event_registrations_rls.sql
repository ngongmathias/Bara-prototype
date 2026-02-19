-- Fix RLS Policies for event_registrations
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS (already enabled, but let's be sure)
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Organizers can view event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.event_registrations;

-- 3. Create permissive policies for Prototype (since Auth is handled by Clerk)
-- This allows the frontend to manage registrations directly while we refine the Auth integration
CREATE POLICY "Enable all access for all users" ON public.event_registrations FOR ALL USING (true) WITH CHECK (true);

-- 4. Grant permissions to anon, authenticated, and service_role
GRANT ALL ON TABLE public.event_registrations TO anon;
GRANT ALL ON TABLE public.event_registrations TO authenticated;
GRANT ALL ON TABLE public.event_registrations TO service_role;

-- 5. Repeat for event_tickets if it exists and needs RLS fix
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_tickets') THEN
        ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access" ON public.event_tickets;
         DROP POLICY IF EXISTS "Enable all access for all users" ON public.event_tickets;
        CREATE POLICY "Enable all access for all users" ON public.event_tickets FOR ALL USING (true) WITH CHECK (true);
        GRANT ALL ON TABLE public.event_tickets TO anon;
        GRANT ALL ON TABLE public.event_tickets TO authenticated;
        GRANT ALL ON TABLE public.event_tickets TO service_role;
    END IF;
END $$;
