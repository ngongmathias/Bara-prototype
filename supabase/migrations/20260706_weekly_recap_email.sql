-- ============================================================
-- Phase 27.3.6 — Weekly recap email ("Your week on BARA")
-- ============================================================
-- A server-side job that, for each active user, builds the getWeeklyRecap data
-- (XP / coins / songs over the last 7 days) and INSERTs a black/white email
-- into email_queue (RULES 15–16). Scheduled weekly via pg_cron when available;
-- otherwise call enqueue_weekly_recaps() from a scheduled Edge Function / any
-- external scheduler.
-- ============================================================

-- Email preference (opt-out). Default true = receive the weekly recap.
ALTER TABLE public.clerk_users
    ADD COLUMN IF NOT EXISTS weekly_recap_emails BOOLEAN DEFAULT true;

CREATE OR REPLACE FUNCTION public.enqueue_weekly_recaps()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r         RECORD;
    v_since   TIMESTAMPTZ := now() - interval '7 days';
    v_xp      BIGINT;
    v_coins   BIGINT;
    v_listens BIGINT;
    v_html    TEXT;
    v_count   INTEGER := 0;
BEGIN
    FOR r IN
        SELECT cu.clerk_user_id, cu.email, cu.full_name
          FROM clerk_users cu
         WHERE cu.email IS NOT NULL
           AND cu.clerk_user_id IS NOT NULL
           AND COALESCE(cu.weekly_recap_emails, true) = true
           -- active in the last 7 days
           AND EXISTS (
                SELECT 1 FROM gamification_history h
                 WHERE h.user_id = cu.clerk_user_id AND h.created_at >= v_since
           )
           -- not already sent this ISO week (idempotent)
           AND NOT EXISTS (
                SELECT 1 FROM email_queue e
                 WHERE e.metadata->>'user_id' = cu.clerk_user_id
                   AND e.metadata->>'type' = 'weekly_recap'
                   AND e.created_at >= date_trunc('week', now())
           )
    LOOP
        SELECT
            COALESCE(SUM(CASE WHEN type = 'xp_gain' THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN type IN ('coin_gain', 'coin_purchase') THEN amount ELSE 0 END), 0)
          INTO v_xp, v_coins
          FROM gamification_history
         WHERE user_id = r.clerk_user_id AND created_at >= v_since;

        SELECT COUNT(*) INTO v_listens
          FROM play_history
         WHERE user_id = r.clerk_user_id AND played_at >= v_since;

        IF v_xp = 0 AND v_coins = 0 AND v_listens = 0 THEN
            CONTINUE;
        END IF;

        v_html :=
            '<div style="font-family:Arial,Helvetica,sans-serif;color:#111111;max-width:560px;margin:0 auto;padding:8px;">'
         || '<h1 style="font-size:22px;font-weight:800;margin:0 0 4px;">Your week on BARA</h1>'
         || '<p style="color:#555555;font-size:14px;margin:0 0 20px;">Hi ' || COALESCE(r.full_name, 'there')
         || ', here''s what you got up to in the last 7 days.</p>'
         || '<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px;">'
         || '<tr>'
         || '<td style="padding:14px;border:1px solid #eeeeee;text-align:center;"><div style="font-size:24px;font-weight:800;">+'
              || v_xp || '</div><div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:.05em;">XP earned</div></td>'
         || '<td style="padding:14px;border:1px solid #eeeeee;text-align:center;"><div style="font-size:24px;font-weight:800;">+'
              || v_coins || '</div><div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:.05em;">Coins earned</div></td>'
         || '<td style="padding:14px;border:1px solid #eeeeee;text-align:center;"><div style="font-size:24px;font-weight:800;">'
              || v_listens || '</div><div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:.05em;">Songs played</div></td>'
         || '</tr></table>'
         || '<a href="https://baraafrika.com/gamification" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:6px;">See your progress</a>'
         || '<p style="color:#999999;font-size:11px;margin-top:28px;border-top:1px solid #eeeeee;padding-top:16px;">'
         || 'You''re receiving this weekly recap because you''re active on BARA Afrika. '
         || '<a href="https://baraafrika.com/settings" style="color:#555555;">Manage email preferences</a>.</p>'
         || '</div>';

        INSERT INTO email_queue (to_email, subject, html_content, metadata)
        VALUES (
            r.email,
            'Your week on BARA Afrika',
            v_html,
            jsonb_build_object('type', 'weekly_recap', 'user_id', r.clerk_user_id)
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- Cron/admin only — not client-callable.
REVOKE ALL ON FUNCTION public.enqueue_weekly_recaps() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_weekly_recaps() TO service_role;

-- Schedule weekly (Mondays 08:00 UTC) if pg_cron is installed. Safe no-op
-- otherwise — enable pg_cron and re-run this block, or trigger the function
-- from a scheduled Edge Function.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        BEGIN
            PERFORM cron.unschedule('weekly-recap');
        EXCEPTION WHEN OTHERS THEN
            NULL; -- not scheduled yet
        END;
        PERFORM cron.schedule('weekly-recap', '0 8 * * 1', 'SELECT public.enqueue_weekly_recaps();');
    END IF;
END $$;
