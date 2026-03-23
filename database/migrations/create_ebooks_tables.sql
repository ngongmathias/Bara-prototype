-- ============================================================
-- BARA AFRIKA — Ebooks Tables
-- Run in Supabase SQL Editor
-- ============================================================

-- Ebooks table
CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    year INTEGER,
    pages INTEGER DEFAULT 0,
    language TEXT DEFAULT 'en',
    country TEXT,
    cover_url TEXT,
    file_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    price NUMERIC(10,2) DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ebook categories
CREATE TABLE IF NOT EXISTS public.ebook_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT
);

-- Ebook library (user's personal bookshelf)
CREATE TABLE IF NOT EXISTS public.ebook_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE,
    reading_progress INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, ebook_id)
);

-- Ebook purchases
CREATE TABLE IF NOT EXISTS public.ebook_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE,
    price_paid NUMERIC(10,2) DEFAULT 0,
    platform_commission NUMERIC(10,2) DEFAULT 0,
    purchased_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, ebook_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ebooks_genre ON public.ebooks(genre);
CREATE INDEX IF NOT EXISTS idx_ebooks_featured ON public.ebooks(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_ebook_library_user ON public.ebook_library(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_user ON public.ebook_purchases(user_id);

-- RLS Policies
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_purchases ENABLE ROW LEVEL SECURITY;

-- Public read on ebooks and categories
CREATE POLICY "ebooks_public_read" ON public.ebooks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ebook_categories_public_read" ON public.ebook_categories FOR SELECT TO anon, authenticated USING (true);

-- Authenticated full access on ebooks (admin manages via service role, but allow for now)
CREATE POLICY "ebooks_auth_all" ON public.ebooks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ebook_categories_auth_all" ON public.ebook_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Library: users manage their own
CREATE POLICY "ebook_library_own" ON public.ebook_library FOR ALL TO authenticated USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub') WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Purchases: users see their own
CREATE POLICY "ebook_purchases_own" ON public.ebook_purchases FOR ALL TO authenticated USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub') WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Grants for anon (public browsing)
GRANT SELECT ON public.ebooks TO anon;
GRANT SELECT ON public.ebook_categories TO anon;
GRANT ALL ON public.ebooks TO authenticated;
GRANT ALL ON public.ebook_categories TO authenticated;
GRANT ALL ON public.ebook_library TO authenticated;
GRANT ALL ON public.ebook_purchases TO authenticated;

-- Seed ebook categories
INSERT INTO public.ebook_categories (name, slug, description, icon) VALUES
    ('Fiction', 'fiction', 'Novels, short stories, and literary fiction', 'BookOpen'),
    ('Non-Fiction', 'non-fiction', 'Biographies, history, science, and more', 'Book'),
    ('African Literature', 'african-literature', 'Works by African authors', 'Globe'),
    ('Business', 'business', 'Entrepreneurship, finance, and leadership', 'Briefcase'),
    ('Education', 'education', 'Textbooks, study guides, and learning materials', 'GraduationCap'),
    ('Self-Help', 'self-help', 'Personal development and wellness', 'Heart'),
    ('Poetry', 'poetry', 'Poetry collections and spoken word', 'Feather'),
    ('Children', 'children', 'Books for young readers', 'Baby')
ON CONFLICT (name) DO NOTHING;
