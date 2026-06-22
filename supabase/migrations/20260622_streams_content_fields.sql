-- ============================================
-- Missing content columns for songs/albums (description was being collected in
-- the UI but silently dropped because the column didn't exist). Idempotent.
-- Run this in your Supabase SQL Editor.
-- ============================================

ALTER TABLE public.songs  ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS description TEXT;

-- albums.type already exists ('album' | 'single' | 'ep' | ...). The create-album
-- form was writing a non-existent `album_type` column; the code now writes `type`.
