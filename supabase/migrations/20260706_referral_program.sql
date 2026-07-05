-- ============================================================
-- Phase 27.2.2 — Referral program end-to-end
-- ============================================================
-- Adds a stable per-user referral_code, a referrals ledger, and two
-- SECURITY DEFINER RPCs (referral_create on sign-up, referral_activate on the
-- referred user's first claimed mission) that pay both parties + milestone
-- bonuses via the Phase 27.2.1 hardened coin RPCs. All guards (self-referral,
-- one row per referred user, milestones-pay-once) are enforced server-side.
-- ============================================================

-- ------------------------------------------------------------
-- 1. referral_code on clerk_users (+ backfill + auto-generate trigger)
--    Derived from md5(clerk_user_id) so it's stable, unique-ish and NOT the
--    old user.id.slice(0,8) (which was near-identical for everyone because
--    Clerk ids share the "user_" prefix).
-- ------------------------------------------------------------
ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS referral_code TEXT;

CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.referral_code IS NULL AND NEW.clerk_user_id IS NOT NULL THEN
        NEW.referral_code := upper(substr(md5(NEW.clerk_user_id), 1, 8));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON public.clerk_users;
CREATE TRIGGER trg_set_referral_code
    BEFORE INSERT OR UPDATE ON public.clerk_users
    FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- Backfill existing users.
UPDATE public.clerk_users
   SET referral_code = upper(substr(md5(clerk_user_id), 1, 8))
 WHERE referral_code IS NULL AND clerk_user_id IS NOT NULL;

-- Unique (partial — rows without a clerk id can stay null).
CREATE UNIQUE INDEX IF NOT EXISTS clerk_users_referral_code_key
    ON public.clerk_users (referral_code) WHERE referral_code IS NOT NULL;

-- ------------------------------------------------------------
-- 2. referrals ledger
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id  TEXT NOT NULL,
    referred_user_id  TEXT NOT NULL UNIQUE,   -- one referral per referred user
    code              TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending',  -- pending | activated
    created_at        timestamptz NOT NULL DEFAULT now(),
    activated_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- SELECT-only for the app clients (InvitePage reads counts). Writes go through
-- the RPCs below, consistent with the Phase 27.2.1 lockdown.
DROP POLICY IF EXISTS "referrals_select" ON public.referrals;
CREATE POLICY "referrals_select" ON public.referrals FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.referrals FROM anon, authenticated;
GRANT SELECT ON public.referrals TO anon, authenticated;
GRANT ALL ON public.referrals TO service_role;

-- ------------------------------------------------------------
-- 3. Ambassador achievement (milestone badge; coins come from the milestone).
-- ------------------------------------------------------------
INSERT INTO public.achievements (key, title, description, xp_reward, coin_reward, category)
VALUES ('ambassador', 'Ambassador', 'Referred 5 friends who joined BARA Afrika', 250, 0, 'community')
ON CONFLICT (key) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward, coin_reward = EXCLUDED.coin_reward, category = EXCLUDED.category;

-- ------------------------------------------------------------
-- 4. referral_create — called after the referred user's profile row exists.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.referral_create(p_referred_user_id TEXT, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referrer TEXT;
    v_code TEXT := upper(trim(COALESCE(p_code, '')));
BEGIN
    IF v_code = '' THEN
        RETURN jsonb_build_object('success', false, 'reason', 'no_code');
    END IF;

    SELECT clerk_user_id INTO v_referrer
      FROM clerk_users WHERE referral_code = v_code LIMIT 1;

    IF v_referrer IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'unknown_code');
    END IF;

    IF v_referrer = p_referred_user_id THEN
        RETURN jsonb_build_object('success', false, 'reason', 'self');
    END IF;

    IF EXISTS (SELECT 1 FROM referrals WHERE referred_user_id = p_referred_user_id) THEN
        RETURN jsonb_build_object('success', false, 'reason', 'already_referred');
    END IF;

    INSERT INTO referrals (referrer_user_id, referred_user_id, code, status)
    VALUES (v_referrer, p_referred_user_id, v_code, 'pending')
    ON CONFLICT (referred_user_id) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'referrer_user_id', v_referrer);
END;
$$;

-- ------------------------------------------------------------
-- 5. referral_activate — the referred user's first claimed mission activates
--    the referral: pays 25 to the friend + 50 to the referrer, then checks
--    referrer milestones (5 → +300 + Ambassador, 10 → +1,000,
--    25 → +3,000 + referral_champion theme). Idempotent (status guard + a
--    per-milestone history check so each pays once).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.referral_activate(p_referred_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref referrals%ROWTYPE;
    v_count INTEGER;
    v_milestone INTEGER := NULL;
BEGIN
    SELECT * INTO v_ref FROM referrals
     WHERE referred_user_id = p_referred_user_id FOR UPDATE;

    IF NOT FOUND OR v_ref.status = 'activated' THEN
        RETURN jsonb_build_object('activated', false);
    END IF;

    UPDATE referrals SET status = 'activated', activated_at = NOW() WHERE id = v_ref.id;

    -- Pay both parties via the hardened coin RPC (audited as 'Referral bonus').
    PERFORM economy_add_coins(p_referred_user_id, 25, 'Referral bonus');
    PERFORM economy_add_coins(v_ref.referrer_user_id, 50, 'Referral bonus');

    SELECT count(*) INTO v_count
      FROM referrals
     WHERE referrer_user_id = v_ref.referrer_user_id AND status = 'activated';

    IF v_count = 5 THEN
        v_milestone := 5;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 5') THEN
            PERFORM economy_add_coins(v_ref.referrer_user_id, 300, 'Referral milestone: 5');
            PERFORM economy_award_achievement(v_ref.referrer_user_id, 'ambassador');
        END IF;
    ELSIF v_count = 10 THEN
        v_milestone := 10;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 10') THEN
            PERFORM economy_add_coins(v_ref.referrer_user_id, 1000, 'Referral milestone: 10');
        END IF;
    ELSIF v_count = 25 THEN
        v_milestone := 25;
        IF NOT EXISTS (SELECT 1 FROM gamification_history
                        WHERE user_id = v_ref.referrer_user_id AND reason = 'Referral milestone: 25') THEN
            PERFORM economy_add_coins(v_ref.referrer_user_id, 3000, 'Referral milestone: 25');
            INSERT INTO user_profile_themes (user_id, theme_id, is_active)
            VALUES (v_ref.referrer_user_id, 'referral_champion', false)
            ON CONFLICT (user_id, theme_id) DO NOTHING;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'activated', true,
        'friend_coins', 25,
        'referrer_coins', 50,
        'milestone', v_milestone,
        'referrer_user_id', v_ref.referrer_user_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.referral_create(TEXT, TEXT)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.referral_activate(TEXT)       TO anon, authenticated;
