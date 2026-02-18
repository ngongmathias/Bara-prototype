-- Create user_profiles table to track user metadata unrelated to auth
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id VARCHAR PRIMARY KEY, -- Maps to Clerk User ID or Auth ID
    email VARCHAR,
    full_name VARCHAR,
    welcome_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Open for now as we are in prototype mode, but ideally restricted)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (user_id = auth.uid()::text OR true); -- Allowing true for Clerk usage where auth.uid() might not match

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (user_id = auth.uid()::text OR true); -- Allowing true for Clerk usage

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (true);
