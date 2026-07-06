-- ============================================================
-- Phase 27.8.4 — Paid ad/service packages for businesses (scaffold)
-- ============================================================
-- Phase 15 (Flutterwave) is not integrated, so this is the STRUCTURE, not
-- the charge: admin-managed packages, a public "Advertise with us" page, and
-- pending_payment subscriptions fulfilled manually by the team. Feature hooks
-- (posting quotas, featured placement) are recorded in `features` jsonb only —
-- enforcement comes with Phase 15.
-- ============================================================

-- 1. Packages (admin CRUD via gated RPC below; public read for the pricing page)
CREATE TABLE IF NOT EXISTS public.business_packages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    price_usd   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    period      TEXT NOT NULL DEFAULT 'month' CHECK (period IN ('month', 'year', 'one_time')),
    features    JSONB NOT NULL DEFAULT '[]'::jsonb,   -- e.g. ["10 ads/month", "Featured placement"]
    active      BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_packages_select" ON public.business_packages;
CREATE POLICY "business_packages_select" ON public.business_packages FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.business_packages FROM anon, authenticated;
GRANT SELECT ON public.business_packages TO anon, authenticated;
GRANT ALL ON public.business_packages TO service_role;

-- 2. Subscriptions (created pending_payment from the public page; the team
--    completes payment manually and an admin flips the status)
CREATE TABLE IF NOT EXISTS public.business_package_subscriptions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL,
    package_id    UUID NOT NULL REFERENCES public.business_packages(id),
    status        TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'active', 'expired', 'cancelled')),
    starts_at     TIMESTAMPTZ,
    ends_at       TIMESTAMPTZ,
    contact_email TEXT,
    contact_phone TEXT,
    note          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bps_user ON public.business_package_subscriptions (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_bps_pending ON public.business_package_subscriptions (created_at) WHERE status = 'pending_payment';

ALTER TABLE public.business_package_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bps_select" ON public.business_package_subscriptions;
CREATE POLICY "bps_select" ON public.business_package_subscriptions FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.business_package_subscriptions FROM anon, authenticated;
GRANT SELECT ON public.business_package_subscriptions TO anon, authenticated;
GRANT ALL ON public.business_package_subscriptions TO service_role;

-- 3. Admin CRUD RPC (create/update; deactivating = active=false, never delete)
CREATE OR REPLACE FUNCTION public.business_package_upsert(
    p_admin_id    TEXT,
    p_id          UUID,          -- NULL to create
    p_name        TEXT,
    p_description TEXT,
    p_price_usd   NUMERIC,
    p_period      TEXT,
    p_features    JSONB,
    p_active      BOOLEAN,
    p_sort_order  INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;
    IF p_name IS NULL OR p_period NOT IN ('month', 'year', 'one_time') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid');
    END IF;

    IF p_id IS NULL THEN
        INSERT INTO business_packages (name, description, price_usd, period, features, active, sort_order)
        VALUES (p_name, p_description, COALESCE(p_price_usd, 0), p_period,
                COALESCE(p_features, '[]'::jsonb), COALESCE(p_active, true), COALESCE(p_sort_order, 0))
        RETURNING id INTO v_id;
    ELSE
        UPDATE business_packages
           SET name = p_name, description = p_description, price_usd = COALESCE(p_price_usd, 0),
               period = p_period, features = COALESCE(p_features, '[]'::jsonb),
               active = COALESCE(p_active, true), sort_order = COALESCE(p_sort_order, 0),
               updated_at = now()
         WHERE id = p_id
        RETURNING id INTO v_id;
        IF v_id IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', 'not_found');
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 4. Public subscribe RPC — creates the pending_payment subscription and
--    notifies every active admin ("manual fulfillment until Phase 15").
CREATE OR REPLACE FUNCTION public.business_package_subscribe(
    p_user_id       TEXT,
    p_package_id    UUID,
    p_contact_email TEXT,
    p_contact_phone TEXT,
    p_note          TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pkg business_packages%ROWTYPE;
    v_id  UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_signed_in');
    END IF;

    SELECT * INTO v_pkg FROM business_packages WHERE id = p_package_id AND active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'package_not_found');
    END IF;

    IF EXISTS (
        SELECT 1 FROM business_package_subscriptions
         WHERE clerk_user_id = p_user_id AND package_id = p_package_id
           AND status IN ('pending_payment', 'active')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_subscribed');
    END IF;

    INSERT INTO business_package_subscriptions (clerk_user_id, package_id, contact_email, contact_phone, note)
    VALUES (p_user_id, p_package_id, p_contact_email, p_contact_phone, p_note)
    RETURNING id INTO v_id;

    -- Tell the team there's a manual sale to complete.
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT a.user_id, 'info',
           'New package request: ' || v_pkg.name,
           'A business requested the "' || v_pkg.name || '" package ($' || v_pkg.price_usd || '/' || v_pkg.period || '). Contact them to complete payment.',
           '/admin/packages'
      FROM admin_users a
     WHERE a.is_active = true;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 5. Admin: flip a subscription's status after manual payment / expiry.
CREATE OR REPLACE FUNCTION public.business_package_set_subscription_status(
    p_admin_id TEXT,
    p_sub_id   UUID,
    p_status   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sub business_package_subscriptions%ROWTYPE;
    v_pkg business_packages%ROWTYPE;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;
    IF p_status NOT IN ('pending_payment', 'active', 'expired', 'cancelled') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_status');
    END IF;

    SELECT * INTO v_sub FROM business_package_subscriptions WHERE id = p_sub_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;

    UPDATE business_package_subscriptions
       SET status = p_status,
           starts_at = CASE WHEN p_status = 'active' AND starts_at IS NULL THEN now() ELSE starts_at END,
           ends_at = CASE
                        WHEN p_status = 'active' AND ends_at IS NULL THEN
                            (SELECT CASE period WHEN 'month' THEN now() + interval '1 month'
                                                WHEN 'year'  THEN now() + interval '1 year'
                                                ELSE NULL END
                               FROM business_packages WHERE id = v_sub.package_id)
                        ELSE ends_at
                     END,
           updated_at = now()
     WHERE id = p_sub_id;

    IF p_status = 'active' THEN
        SELECT * INTO v_pkg FROM business_packages WHERE id = v_sub.package_id;
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (v_sub.clerk_user_id, 'success', 'Your package is active!',
                'Your "' || COALESCE(v_pkg.name, 'business') || '" package is now active. Thanks for advertising with BARA Afrika.',
                '/packages');
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.business_package_upsert(TEXT, UUID, TEXT, TEXT, NUMERIC, TEXT, JSONB, BOOLEAN, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.business_package_subscribe(TEXT, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.business_package_set_subscription_status(TEXT, UUID, TEXT) TO anon, authenticated;

-- Starter packages (edit or deactivate in Admin → Packages; pricing TBD by team)
INSERT INTO public.business_packages (name, description, price_usd, period, features, sort_order)
SELECT * FROM (VALUES
    ('Starter', 'Get your business seen on BARA Afrika.', 19.00::numeric, 'month',
     '["10 marketplace ads per month", "Storefront badge", "Email support"]'::jsonb, 1),
    ('Growth', 'More reach for growing businesses.', 49.00::numeric, 'month',
     '["30 marketplace ads per month", "Featured placement on category pages", "Storefront promotion", "Priority support"]'::jsonb, 2),
    ('Premium', 'Maximum visibility across the platform.', 99.00::numeric, 'month',
     '["Unlimited marketplace ads", "Homepage featured slots", "Banner placement", "Dedicated account manager"]'::jsonb, 3)
) AS seed(name, description, price_usd, period, features, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.business_packages);
