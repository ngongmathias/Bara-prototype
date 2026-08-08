-- ============================================================
-- Follow-up to 20260808_manual_orders.sql — make the REVOKEs actually bite
-- ============================================================
-- Run this AFTER 20260808_manual_orders.sql. Safe to re-run.
--
-- The parent migration ended with:
--     REVOKE EXECUTE ON FUNCTION ... FROM anon;
-- and a live probe with the public anon key showed all three functions were
-- still callable. The revoke was a no-op.
--
-- Cause: Postgres grants EXECUTE on every new function to PUBLIC by default.
-- `anon` inherits that grant through PUBLIC, so revoking from `anon` alone
-- removes a grant it never separately held. This is the same shape as the bug
-- 20260806_security_hardening.sql §K3 found on songs.plays, where a standing
-- table-wide grant made a column-level REVOKE meaningless — worth remembering
-- as a pattern: always revoke from PUBLIC first, then grant back deliberately.
--
-- NOT exploitable in the meantime: all three functions read identity from the
-- Clerk JWT and return {'success': false, 'error': 'not_signed_in'} before
-- touching anything, which the probe confirmed (advertising_requests stayed at
-- 0 rows). This is defence in depth, not an incident — but a function that only
-- fails safe because of a check inside its body is one refactor away from not
-- failing safe at all.
-- ============================================================

SET lock_timeout = '5s';

-- Order matters: revoke from PUBLIC (which is what anon actually inherits),
-- then grant back only to the role the app authenticates as.
REVOKE EXECUTE ON FUNCTION public.marketplace_reserve(UUID, UUID, INTEGER, TEXT)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.marketplace_order_set_payment(UUID, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.advertising_request_submit(TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.marketplace_reserve(UUID, UUID, INTEGER, TEXT)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_order_set_payment(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.advertising_request_submit(TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) TO authenticated;

-- Verify after running — each of these should now be denied to the anon key:
--   node --env-file=.env -e "...rpc('marketplace_reserve', {...})"
-- expecting error 42501 rather than a {'success': false} payload.
