-- Lyrics column for songs. Stored as plain text with newline-separated lines.
ALTER TABLE public.songs
    ADD COLUMN IF NOT EXISTS lyrics text;
