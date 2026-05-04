-- BARA Global Key Listings (25.5.2) — admin-managed directory of important
-- institutions per country (ministries, regulators, agencies, sports
-- federations, charities, NGOs).

-- =========================
-- Enum for listing type
-- =========================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'country_key_listing_type') THEN
        CREATE TYPE country_key_listing_type AS ENUM (
            'government_ministry',
            'regulator',
            'agency',
            'sports_federation',
            'charity',
            'ngo'
        );
    END IF;
END $$;

-- =========================
-- Table
-- =========================

CREATE TABLE IF NOT EXISTS public.country_key_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    listing_type country_key_listing_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    web_link TEXT,
    logo_url TEXT,
    logo_storage_path TEXT,
    address TEXT,
    telephone TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_by_clerk_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT country_key_listings_web_link_https
        CHECK (web_link IS NULL OR web_link ~* '^https://')
);

CREATE INDEX IF NOT EXISTS idx_country_key_listings_country
    ON public.country_key_listings(country_id);

CREATE INDEX IF NOT EXISTS idx_country_key_listings_country_type_order
    ON public.country_key_listings(country_id, listing_type, display_order);

-- =========================
-- RLS
-- =========================

ALTER TABLE public.country_key_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read country key listings" ON public.country_key_listings;
CREATE POLICY "Public read country key listings"
    ON public.country_key_listings
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Authenticated insert country key listings" ON public.country_key_listings;
CREATE POLICY "Authenticated insert country key listings"
    ON public.country_key_listings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update country key listings" ON public.country_key_listings;
CREATE POLICY "Authenticated update country key listings"
    ON public.country_key_listings
    FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated delete country key listings" ON public.country_key_listings;
CREATE POLICY "Authenticated delete country key listings"
    ON public.country_key_listings
    FOR DELETE
    TO authenticated
    USING (true);

-- =========================
-- updated_at trigger
-- =========================

CREATE OR REPLACE FUNCTION public.country_key_listings_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_country_key_listings_set_updated_at ON public.country_key_listings;
CREATE TRIGGER tr_country_key_listings_set_updated_at
    BEFORE UPDATE ON public.country_key_listings
    FOR EACH ROW EXECUTE FUNCTION public.country_key_listings_set_updated_at();

-- =========================
-- Storage bucket for logos — kept separate from country-gallery so the
-- 100 KB icon limit can be enforced at the bucket level.
-- =========================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'country-key-listing-logos',
    'country-key-listing-logos',
    true,
    102400, -- 100 KB hard cap, "Coat of Arms"-style icon
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read country key listing logos" ON storage.objects;
CREATE POLICY "Public read country key listing logos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'country-key-listing-logos');

DROP POLICY IF EXISTS "Authenticated upload country key listing logos" ON storage.objects;
CREATE POLICY "Authenticated upload country key listing logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'country-key-listing-logos');

DROP POLICY IF EXISTS "Authenticated update country key listing logos" ON storage.objects;
CREATE POLICY "Authenticated update country key listing logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'country-key-listing-logos');

DROP POLICY IF EXISTS "Authenticated delete country key listing logos" ON storage.objects;
CREATE POLICY "Authenticated delete country key listing logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'country-key-listing-logos');

-- =========================
-- Grants
-- =========================

GRANT SELECT ON public.country_key_listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.country_key_listings TO authenticated;
