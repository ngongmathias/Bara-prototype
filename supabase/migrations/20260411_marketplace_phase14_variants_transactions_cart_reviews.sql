-- Phase 14: Multi-variant listings, transactions, shopping cart, reviews & comments
-- Run in Supabase SQL Editor

-- ============================================================
-- 14.5 — Multi-variant listings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_listing_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  sku TEXT,
  label TEXT NOT NULL,                          -- e.g. "Size M / Red"
  attributes JSONB NOT NULL DEFAULT '{}',       -- {"size": "M", "color": "Red"}
  price_override NUMERIC(12,2),                 -- null = use listing base price
  quantity INTEGER NOT NULL DEFAULT 1,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variants_listing ON public.marketplace_listing_variants(listing_id);

-- RLS
ALTER TABLE public.marketplace_listing_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can read variants
CREATE POLICY "variants_select" ON public.marketplace_listing_variants
  FOR SELECT USING (true);

-- Listing owner can manage variants
CREATE POLICY "variants_insert" ON public.marketplace_listing_variants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.marketplace_listings WHERE id = listing_id AND created_by = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  );

CREATE POLICY "variants_update" ON public.marketplace_listing_variants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.marketplace_listings WHERE id = listing_id AND created_by = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  );

CREATE POLICY "variants_delete" ON public.marketplace_listing_variants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.marketplace_listings WHERE id = listing_id AND created_by = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  );

-- Grants
GRANT SELECT ON public.marketplace_listing_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.marketplace_listing_variants TO anon, authenticated;

-- ============================================================
-- 14.6 — Transactions (purchase confirmation)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id),
  variant_id UUID REFERENCES public.marketplace_listing_variants(id),
  buyer_user_id TEXT NOT NULL,
  seller_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_seller'
    CHECK (status IN ('pending_seller','confirmed','completed','cancelled_buyer','cancelled_seller','expired')),
  quantity INTEGER NOT NULL DEFAULT 1,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  buyer_message TEXT,
  seller_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transactions_listing ON public.marketplace_transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.marketplace_transactions(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.marketplace_transactions(seller_user_id);

-- RLS
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Buyer and seller can view their own transactions
CREATE POLICY "transactions_select" ON public.marketplace_transactions
  FOR SELECT USING (
    buyer_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    OR seller_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

-- Authenticated users can create transactions (as buyer)
CREATE POLICY "transactions_insert" ON public.marketplace_transactions
  FOR INSERT WITH CHECK (
    buyer_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

-- Buyer or seller can update their transactions
CREATE POLICY "transactions_update" ON public.marketplace_transactions
  FOR UPDATE USING (
    buyer_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    OR seller_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

GRANT SELECT, INSERT, UPDATE ON public.marketplace_transactions TO anon, authenticated;

-- ============================================================
-- 14.7 — Shopping cart
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.marketplace_listing_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON public.marketplace_cart_items(user_id);

-- RLS
ALTER TABLE public.marketplace_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_select" ON public.marketplace_cart_items
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

CREATE POLICY "cart_insert" ON public.marketplace_cart_items
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

CREATE POLICY "cart_update" ON public.marketplace_cart_items
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

CREATE POLICY "cart_delete" ON public.marketplace_cart_items
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_cart_items TO anon, authenticated;

-- ============================================================
-- 14.8 — Reviews & Comments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  reviewer_user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.marketplace_reviews(listing_id);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  parent_id UUID REFERENCES public.marketplace_listing_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_seller_response BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_listing ON public.marketplace_listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.marketplace_listing_comments(parent_id);

-- RLS for reviews
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select" ON public.marketplace_reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert" ON public.marketplace_reviews
  FOR INSERT WITH CHECK (
    reviewer_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

CREATE POLICY "reviews_update" ON public.marketplace_reviews
  FOR UPDATE USING (
    reviewer_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

CREATE POLICY "reviews_delete" ON public.marketplace_reviews
  FOR DELETE USING (
    reviewer_user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

GRANT SELECT ON public.marketplace_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.marketplace_reviews TO anon, authenticated;

-- RLS for comments
ALTER TABLE public.marketplace_listing_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON public.marketplace_listing_comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert" ON public.marketplace_listing_comments
  FOR INSERT WITH CHECK (
    user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

CREATE POLICY "comments_update" ON public.marketplace_listing_comments
  FOR UPDATE USING (
    user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

CREATE POLICY "comments_delete" ON public.marketplace_listing_comments
  FOR DELETE USING (
    user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

GRANT SELECT ON public.marketplace_listing_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.marketplace_listing_comments TO anon, authenticated;

-- Add aggregate rating columns to marketplace_listings for card display
ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
