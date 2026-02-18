-- Create sports_news table
CREATE TABLE IF NOT EXISTS public.sports_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'PSL', 'EPL', 'Transfer News', etc.
    image_url TEXT,
    content TEXT,
    author TEXT DEFAULT 'Bara Sports',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sports_videos table
CREATE TABLE IF NOT EXISTS public.sports_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL, -- YouTube ID or URL
    thumbnail_url TEXT,
    duration TEXT, -- '1:26'
    league TEXT, -- 'English Premier League'
    is_live BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.sports_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_videos ENABLE ROW LEVEL SECURITY;

-- Policies for sports_news
CREATE POLICY "Public read sports_news" ON public.sports_news
    FOR SELECT USING (true);

CREATE POLICY "Admin full access sports_news" ON public.sports_news
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Policies for sports_videos
CREATE POLICY "Public read sports_videos" ON public.sports_videos
    FOR SELECT USING (true);

CREATE POLICY "Admin full access sports_videos" ON public.sports_videos
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Grant access
GRANT SELECT ON public.sports_news TO anon, authenticated;
GRANT SELECT ON public.sports_videos TO anon, authenticated;
GRANT ALL ON public.sports_news TO service_role;
GRANT ALL ON public.sports_videos TO service_role;
