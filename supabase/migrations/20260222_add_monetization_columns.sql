-- Migration to add monetization and premium columns
-- Targets marketplace_listings, businesses, and events

-- 1. Updates for marketplace_listings
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_listings_premium ON public.marketplace_listings(is_premium) WHERE is_premium = true;

-- 2. Updates for businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_tier TEXT DEFAULT 'standard' CHECK (user_tier IN ('standard', 'pro', 'elite'));

CREATE INDEX IF NOT EXISTS idx_businesses_premium ON public.businesses(is_premium) WHERE is_premium = true;

-- 3. Updates for events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_premium ON public.events(is_premium) WHERE is_premium = true;

-- 4. Updates for sponsored_banners (The MIT Auction Model)
ALTER TABLE public.sponsored_banners
ADD COLUMN IF NOT EXISTS bid_per_click DECIMAL(10, 4) DEFAULT 0.01,
ADD COLUMN IF NOT EXISTS daily_budget DECIMAL(15, 2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS current_spend DECIMAL(15, 2) DEFAULT 0.00;

-- Add comments for clarity
COMMENT ON COLUMN public.marketplace_listings.is_premium IS 'Indicates if the listing has paid for premium/top placement';
COMMENT ON COLUMN public.marketplace_listings.boosted_until IS 'Timestamp when the premium/boosted status expires';
COMMENT ON COLUMN public.businesses.is_premium IS 'Indicates if the business has a premium subscription/verification';
COMMENT ON COLUMN public.events.is_premium IS 'Indicates if the event is sponsored or featured at the top';
