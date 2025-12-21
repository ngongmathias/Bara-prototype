-- Create storage buckets for country information images
-- These buckets store flags, leader images, monuments, coat of arms, and country page ads

-- Create country-flags bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-flags',
  'country-flags',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create country-leaders bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-leaders',
  'country-leaders',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create country-coat-of-arms bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-coat-of-arms',
  'country-coat-of-arms',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create country-monuments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-monuments',
  'country-monuments',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create country-page-ads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-page-ads',
  'country-page-ads',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for country-flags bucket
-- Allow public read access
CREATE POLICY "Public read access for country flags"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'country-flags');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload country flags"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'country-flags');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update country flags"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'country-flags');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete country flags"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'country-flags');

-- Storage policies for country-leaders bucket
CREATE POLICY "Public read access for country leaders"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'country-leaders');

CREATE POLICY "Authenticated users can upload country leaders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'country-leaders');

CREATE POLICY "Authenticated users can update country leaders"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'country-leaders');

CREATE POLICY "Authenticated users can delete country leaders"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'country-leaders');

-- Storage policies for country-coat-of-arms bucket
CREATE POLICY "Public read access for coat of arms"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'country-coat-of-arms');

CREATE POLICY "Authenticated users can upload coat of arms"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'country-coat-of-arms');

CREATE POLICY "Authenticated users can update coat of arms"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'country-coat-of-arms');

CREATE POLICY "Authenticated users can delete coat of arms"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'country-coat-of-arms');

-- Storage policies for country-monuments bucket
CREATE POLICY "Public read access for monuments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'country-monuments');

CREATE POLICY "Authenticated users can upload monuments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'country-monuments');

CREATE POLICY "Authenticated users can update monuments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'country-monuments');

CREATE POLICY "Authenticated users can delete monuments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'country-monuments');

-- Storage policies for country-page-ads bucket
CREATE POLICY "Public read access for country page ads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'country-page-ads');

CREATE POLICY "Authenticated users can upload country page ads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'country-page-ads');

CREATE POLICY "Authenticated users can update country page ads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'country-page-ads');

CREATE POLICY "Authenticated users can delete country page ads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'country-page-ads');
