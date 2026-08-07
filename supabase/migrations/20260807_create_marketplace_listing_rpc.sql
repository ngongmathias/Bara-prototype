-- ============================================================
-- Atomic listing creation — create_marketplace_listing(payload jsonb)
--
-- WHY: posting an ad was four sequential client-side inserts —
--   1. marketplace_listings
--   2. marketplace_listing_images
--   3. marketplace_listing_countries
--   4. marketplace_listing_variants
-- with a `throw` between each. If step 2 failed, the listing row from step 1
-- was already committed, so the seller saw an error, retried, and created a
-- SECOND listing — while the first sat in the marketplace with no photos.
-- Nothing cleaned either up.
--
-- One RPC = one transaction. Everything lands, or nothing does, and the
-- seller can safely retry.
--
-- Ownership: created_by comes from the verified Clerk JWT (`sub` claim), not
-- from the payload, so a caller cannot post on someone else's behalf. This
-- also makes it impossible to write the empty created_by that would render a
-- listing invisible in its owner's My Ads.
--
-- SECURITY DEFINER because marketplace RLS is still permissive and due to be
-- tightened; routing writes through here means that hardening only has to
-- account for one path rather than four separate client inserts.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_marketplace_listing(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id    text;
    v_listing_id uuid;
    v_image      jsonb;
    v_country    jsonb;
    v_variant    jsonb;
    v_idx        int := 0;
BEGIN
    -- Identity comes from the token, never the payload.
    v_user_id := NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not signed in' USING ERRCODE = '28000';
    END IF;

    IF COALESCE(TRIM(payload->>'title'), '') = '' THEN
        RAISE EXCEPTION 'A title is required' USING ERRCODE = '22023';
    END IF;
    IF payload->>'category_id' IS NULL THEN
        RAISE EXCEPTION 'A category is required' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.marketplace_listings (
        title, description, category_id, subcategory_id, country_id,
        price, currency, price_type, condition,
        seller_name, seller_email, seller_phone, seller_whatsapp, seller_type,
        location_details, status, created_by, attributes,
        is_premium, accepts_coins, coin_price
    )
    VALUES (
        payload->>'title',
        payload->>'description',
        (payload->>'category_id')::uuid,
        NULLIF(payload->>'subcategory_id', '')::uuid,
        NULLIF(payload->>'country_id', '')::uuid,
        COALESCE((payload->>'price')::numeric, 0),
        payload->>'currency',
        payload->>'price_type',
        NULLIF(payload->>'condition', ''),
        payload->>'seller_name',
        payload->>'seller_email',
        payload->>'seller_phone',
        payload->>'seller_whatsapp',
        payload->>'seller_type',
        payload->>'location_details',
        'active',
        v_user_id,
        COALESCE(payload->'attributes', '{}'::jsonb),
        COALESCE((payload->>'is_premium')::boolean, false),
        COALESCE((payload->>'accepts_coins')::boolean, false),
        NULLIF(payload->>'coin_price', '')::int
    )
    RETURNING id INTO v_listing_id;

    FOR v_image IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'images', '[]'::jsonb))
    LOOP
        INSERT INTO public.marketplace_listing_images (listing_id, image_url, display_order, is_primary)
        VALUES (
            v_listing_id,
            v_image->>'image_url',
            COALESCE((v_image->>'display_order')::int, 0),
            COALESCE((v_image->>'is_primary')::boolean, false)
        );
    END LOOP;

    FOR v_country IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'country_ids', '[]'::jsonb))
    LOOP
        INSERT INTO public.marketplace_listing_countries (listing_id, country_id)
        VALUES (v_listing_id, (v_country #>> '{}')::uuid);
    END LOOP;

    FOR v_variant IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'variants', '[]'::jsonb))
    LOOP
        INSERT INTO public.marketplace_listing_variants (
            listing_id, label, attributes, price_override,
            quantity, quantity_sold, image_url, is_available, sort_order
        )
        VALUES (
            v_listing_id,
            v_variant->>'label',
            COALESCE(v_variant->'attributes', '{}'::jsonb),
            NULLIF(v_variant->>'price_override', '')::numeric,
            COALESCE((v_variant->>'quantity')::int, 1),
            0,
            NULLIF(v_variant->>'image_url', ''),
            true,
            v_idx
        );
        v_idx := v_idx + 1;
    END LOOP;

    RETURN v_listing_id;
END;
$$;

-- authenticated only: the function reads the caller's Clerk id from the JWT,
-- so an anon call has no identity and would raise 28000 anyway. Being
-- explicit keeps it that way if the guard above is ever refactored.
REVOKE ALL ON FUNCTION public.create_marketplace_listing(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_marketplace_listing(jsonb) TO authenticated;

COMMENT ON FUNCTION public.create_marketplace_listing(jsonb) IS
    'Creates a marketplace listing with its images, country links and variants in ONE transaction. Ownership is taken from the Clerk JWT sub claim, never the payload. Replaces four sequential client inserts that could leave an orphaned listing behind on partial failure.';
