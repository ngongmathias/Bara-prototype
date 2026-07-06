-- Phase 27.8.8 — Legal language for music uploads.
-- Stores when the uploader accepted the rights/ownership declaration
-- ("I confirm I own all rights to this content or am licensed to distribute
-- it, and I accept the BARA Afrika Content Terms" — /content-terms).
-- NULL on legacy rows uploaded before the checkbox existed.

ALTER TABLE public.songs
    ADD COLUMN IF NOT EXISTS rights_accepted_at timestamptz;

-- Album creation is a separate flow with the same declaration.
ALTER TABLE public.albums
    ADD COLUMN IF NOT EXISTS rights_accepted_at timestamptz;
