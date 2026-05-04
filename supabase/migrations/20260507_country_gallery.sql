-- BARA Global Gallery (25.5.1) — admin-managed photo gallery per country.
-- Replaces the previous 2-image hardcoded slots (gallery_image_1_url, gallery_image_2_url
-- on country_info) with a proper one-to-many table so admins can upload an
-- arbitrary number of photos per country page.

-- =========================
-- Table
-- =========================

CREATE TABLE IF NOT EXISTS public.country_gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    uploaded_by_clerk_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_country_gallery_country
    ON public.country_gallery_photos(country_id);

CREATE INDEX IF NOT EXISTS idx_country_gallery_country_order
    ON public.country_gallery_photos(country_id, display_order);

-- =========================
-- RLS — admin gating happens in the frontend AdminAuthGuard, matching the
-- pattern used by country_info / marketplace_categories / etc.
-- =========================

ALTER TABLE public.country_gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read country gallery photos" ON public.country_gallery_photos;
CREATE POLICY "Public read country gallery photos"
    ON public.country_gallery_photos
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Authenticated insert country gallery photos" ON public.country_gallery_photos;
CREATE POLICY "Authenticated insert country gallery photos"
    ON public.country_gallery_photos
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update country gallery photos" ON public.country_gallery_photos;
CREATE POLICY "Authenticated update country gallery photos"
    ON public.country_gallery_photos
    FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated delete country gallery photos" ON public.country_gallery_photos;
CREATE POLICY "Authenticated delete country gallery photos"
    ON public.country_gallery_photos
    FOR DELETE
    TO authenticated
    USING (true);

-- =========================
-- updated_at trigger
-- =========================

CREATE OR REPLACE FUNCTION public.country_gallery_photos_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_country_gallery_photos_set_updated_at ON public.country_gallery_photos;
CREATE TRIGGER tr_country_gallery_photos_set_updated_at
    BEFORE UPDATE ON public.country_gallery_photos
    FOR EACH ROW EXECUTE FUNCTION public.country_gallery_photos_set_updated_at();

-- =========================
-- Storage bucket — separate from existing country-* buckets so quota /
-- retention / abuse rules can be tuned independently.
-- =========================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'country-gallery',
    'country-gallery',
    true,
    5242880, -- 5 MB per file (frontend pre-compresses to ~500 KB target)
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS — same shape as the other country-* buckets.

DROP POLICY IF EXISTS "Public read country gallery" ON storage.objects;
CREATE POLICY "Public read country gallery"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'country-gallery');

DROP POLICY IF EXISTS "Authenticated upload country gallery" ON storage.objects;
CREATE POLICY "Authenticated upload country gallery"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'country-gallery');

DROP POLICY IF EXISTS "Authenticated update country gallery" ON storage.objects;
CREATE POLICY "Authenticated update country gallery"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'country-gallery');

DROP POLICY IF EXISTS "Authenticated delete country gallery" ON storage.objects;
CREATE POLICY "Authenticated delete country gallery"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'country-gallery');

-- =========================
-- Grants — match the convention used by recent migrations
-- (e.g. 20260428_fix_blog_comments_grants.sql).
-- =========================

GRANT SELECT ON public.country_gallery_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.country_gallery_photos TO authenticated;
