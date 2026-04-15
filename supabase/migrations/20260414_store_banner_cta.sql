-- Add banner CTA fields for store banner customization.

ALTER TABLE public.marketplace_partners
    ADD COLUMN IF NOT EXISTS banner_headline text,
    ADD COLUMN IF NOT EXISTS banner_cta_text text,
    ADD COLUMN IF NOT EXISTS banner_cta_url  text;
