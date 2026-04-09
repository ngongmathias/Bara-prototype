-- ============================================================
-- BARA Marketplace — Phase 11 Partner + Trust Infrastructure
-- Run this in Supabase SQL Editor.
--
-- Adds:
--   1. Missing columns on marketplace_listings (is_premium, slug, video_url,
--      verification_level, response_time_hours, member_since)
--   2. marketplace_partners — branded storefront + business profile
--   3. marketplace_partner_members — multi-user access to a partner
--   4. marketplace_seller_ratings — buyer ratings of sellers
--   5. marketplace_leads — unified lead capture across contact channels
--   6. marketplace_offers — "Make an offer" flow
--   7. marketplace_saved_searches — saved searches + alerts
--   8. RLS + GRANTs for every new table
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Missing columns on marketplace_listings
-- ─────────────────────────────────────────
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_slug ON marketplace_listings(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_partner ON marketplace_listings(partner_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_is_premium ON marketplace_listings(is_premium);

-- ─────────────────────────────────────────
-- 2. marketplace_partners (seller profiles / storefronts)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id TEXT NOT NULL UNIQUE,   -- Clerk ID of the owner
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    business_type TEXT DEFAULT 'individual',  -- individual | dealer | agent | company
    verification_level TEXT NOT NULL DEFAULT 'unverified',
        -- unverified | email_verified | phone_verified | id_verified | business_verified
    verification_notes TEXT,
    country_id UUID REFERENCES countries(id),
    city TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_whatsapp TEXT,
    website TEXT,
    total_ads INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    response_time_hours INTEGER,   -- nullable; computed from lead responses
    avg_rating NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    member_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_partners_owner ON marketplace_partners(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_partners_slug ON marketplace_partners(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_partners_verification ON marketplace_partners(verification_level);

-- Now add the FK from marketplace_listings.partner_id → marketplace_partners.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'marketplace_listings_partner_fk'
    ) THEN
        ALTER TABLE marketplace_listings
        ADD CONSTRAINT marketplace_listings_partner_fk
        FOREIGN KEY (partner_id) REFERENCES marketplace_partners(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ─────────────────────────────────────────
-- 3. marketplace_partner_members (multi-user access)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_partner_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES marketplace_partners(id) ON DELETE CASCADE,
    member_user_id TEXT NOT NULL,   -- Clerk ID
    role TEXT NOT NULL DEFAULT 'agent',   -- owner | admin | agent
    invited_by TEXT,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(partner_id, member_user_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_members_partner ON marketplace_partner_members(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_members_member ON marketplace_partner_members(member_user_id);

-- ─────────────────────────────────────────
-- 4. marketplace_seller_ratings
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_seller_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_user_id TEXT NOT NULL,   -- Clerk ID of the seller
    rater_user_id TEXT NOT NULL,    -- Clerk ID of the buyer/rater
    ad_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_user_id, rater_user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller ON marketplace_seller_ratings(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_seller_ratings_ad ON marketplace_seller_ratings(ad_id);

-- ─────────────────────────────────────────
-- 5. marketplace_leads (unified contact inbox)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    seller_user_id TEXT NOT NULL,
    buyer_user_id TEXT,   -- nullable: anonymous visitors
    contact_type TEXT NOT NULL,  -- chat | whatsapp | phone | email | website | offer
    buyer_name TEXT,
    buyer_email TEXT,
    buyer_phone TEXT,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    seen_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_ad ON marketplace_leads(ad_id);
CREATE INDEX IF NOT EXISTS idx_leads_seller ON marketplace_leads(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_buyer ON marketplace_leads(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON marketplace_leads(created_at DESC);

-- ─────────────────────────────────────────
-- 6. marketplace_offers (Make an offer)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer_user_id TEXT NOT NULL,
    seller_user_id TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | accepted | rejected | withdrawn | expired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_ad ON marketplace_offers(ad_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON marketplace_offers(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON marketplace_offers(seller_user_id);

-- ─────────────────────────────────────────
-- 7. marketplace_saved_searches
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    query_string TEXT,
    filters JSONB,
    email_alerts BOOLEAN DEFAULT false,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON marketplace_saved_searches(user_id);

-- ─────────────────────────────────────────
-- 8. RLS + GRANTs for all new tables (permissive, Clerk handles authz)
-- ─────────────────────────────────────────
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'marketplace_partners',
        'marketplace_partner_members',
        'marketplace_seller_ratings',
        'marketplace_leads',
        'marketplace_offers',
        'marketplace_saved_searches'
    ]) LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

        EXECUTE format('DROP POLICY IF EXISTS "%s_select" ON %I', t, t);
        EXECUTE format('CREATE POLICY "%s_select" ON %I FOR SELECT USING (true)', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "%s_insert" ON %I', t, t);
        EXECUTE format('CREATE POLICY "%s_insert" ON %I FOR INSERT WITH CHECK (true)', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "%s_update" ON %I', t, t);
        EXECUTE format('CREATE POLICY "%s_update" ON %I FOR UPDATE USING (true)', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "%s_delete" ON %I', t, t);
        EXECUTE format('CREATE POLICY "%s_delete" ON %I FOR DELETE USING (true)', t, t);

        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO anon', t);
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', t);
    END LOOP;
END $$;

-- ─────────────────────────────────────────
-- 9. Recalculate partner rating aggregates after a new rating
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION recalc_partner_rating(target_seller_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    new_avg NUMERIC;
    new_count INTEGER;
BEGIN
    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO new_avg, new_count
    FROM marketplace_seller_ratings
    WHERE seller_user_id = target_seller_user_id;

    UPDATE marketplace_partners
    SET avg_rating = ROUND(new_avg::numeric, 2),
        rating_count = new_count,
        updated_at = NOW()
    WHERE owner_user_id = target_seller_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION recalc_partner_rating(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION recalc_partner_rating(TEXT) TO authenticated;

-- Trigger to auto-recalc on insert/update/delete
CREATE OR REPLACE FUNCTION trg_recalc_partner_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM recalc_partner_rating(OLD.seller_user_id);
        RETURN OLD;
    ELSE
        PERFORM recalc_partner_rating(NEW.seller_user_id);
        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS seller_rating_change ON marketplace_seller_ratings;
CREATE TRIGGER seller_rating_change
AFTER INSERT OR UPDATE OR DELETE ON marketplace_seller_ratings
FOR EACH ROW EXECUTE FUNCTION trg_recalc_partner_rating();

-- ─────────────────────────────────────────
-- 10. Keep partner total_ads in sync on listing insert/delete
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_sync_partner_ad_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.partner_id IS NOT NULL THEN
            UPDATE marketplace_partners
            SET total_ads = total_ads + 1,
                updated_at = NOW()
            WHERE id = NEW.partner_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.partner_id IS NOT NULL THEN
            UPDATE marketplace_partners
            SET total_ads = GREATEST(total_ads - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.partner_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_partner_ad_count ON marketplace_listings;
CREATE TRIGGER sync_partner_ad_count
AFTER INSERT OR DELETE ON marketplace_listings
FOR EACH ROW EXECUTE FUNCTION trg_sync_partner_ad_count();

-- ─────────────────────────────────────────
-- Done.
-- ─────────────────────────────────────────
