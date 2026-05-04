-- E-books table + storage bucket (25.2.1).
-- The frontend (EbooksPage, EbookDetailPage, AdminEbooks, UserMyEbooks) was
-- already coded against this schema with graceful fallback when the table
-- doesn't exist (error code 42P01). This migration finally creates the
-- backing storage so the section can move from "static fallback" to live data.

-- =========================
-- Table
-- =========================

CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    year INTEGER,
    pages INTEGER,
    language TEXT DEFAULT 'en',
    country TEXT,
    cover_url TEXT,
    file_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_free BOOLEAN NOT NULL DEFAULT true,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON public.ebooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_download_count ON public.ebooks(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_genre ON public.ebooks(genre);
CREATE INDEX IF NOT EXISTS idx_ebooks_uploaded_by ON public.ebooks(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_ebooks_is_featured ON public.ebooks(is_featured) WHERE is_featured = true;

-- =========================
-- RLS — public read, authenticated write. Admin gating is enforced in the
-- frontend via AdminAuthGuard (consistent with country_info / songs / etc.).
-- =========================

ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read ebooks" ON public.ebooks;
CREATE POLICY "Public read ebooks"
    ON public.ebooks FOR SELECT
    TO public USING (true);

DROP POLICY IF EXISTS "Authenticated insert ebooks" ON public.ebooks;
CREATE POLICY "Authenticated insert ebooks"
    ON public.ebooks FOR INSERT
    TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update ebooks" ON public.ebooks;
CREATE POLICY "Authenticated update ebooks"
    ON public.ebooks FOR UPDATE
    TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated delete ebooks" ON public.ebooks;
CREATE POLICY "Authenticated delete ebooks"
    ON public.ebooks FOR DELETE
    TO authenticated USING (true);

-- =========================
-- updated_at trigger
-- =========================

CREATE OR REPLACE FUNCTION public.ebooks_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ebooks_set_updated_at ON public.ebooks;
CREATE TRIGGER tr_ebooks_set_updated_at
    BEFORE UPDATE ON public.ebooks
    FOR EACH ROW EXECUTE FUNCTION public.ebooks_set_updated_at();

-- =========================
-- Storage bucket — AdminEbooks already references BUCKET = "ebooks".
-- Larger file size cap than image-only buckets because PDFs are bigger.
-- =========================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ebooks',
    'ebooks',
    true,
    52428800, -- 50 MB per file (covers + ebook PDFs)
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf',
        'application/epub+zip'
    ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read ebooks bucket" ON storage.objects;
CREATE POLICY "Public read ebooks bucket"
    ON storage.objects FOR SELECT
    TO public USING (bucket_id = 'ebooks');

DROP POLICY IF EXISTS "Authenticated upload ebooks bucket" ON storage.objects;
CREATE POLICY "Authenticated upload ebooks bucket"
    ON storage.objects FOR INSERT
    TO authenticated WITH CHECK (bucket_id = 'ebooks');

DROP POLICY IF EXISTS "Authenticated update ebooks bucket" ON storage.objects;
CREATE POLICY "Authenticated update ebooks bucket"
    ON storage.objects FOR UPDATE
    TO authenticated USING (bucket_id = 'ebooks');

DROP POLICY IF EXISTS "Authenticated delete ebooks bucket" ON storage.objects;
CREATE POLICY "Authenticated delete ebooks bucket"
    ON storage.objects FOR DELETE
    TO authenticated USING (bucket_id = 'ebooks');

-- =========================
-- Grants
-- =========================

GRANT SELECT ON public.ebooks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ebooks TO authenticated;
