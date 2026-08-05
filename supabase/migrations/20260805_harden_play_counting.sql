-- ============================================================
-- Stream-count integrity (STREAMS_MASTER_PLAN.md §D / D3)
--
-- Problems fixed:
--   1. increment_play_count had no dedupe — one listener refreshing/
--      replaying a song could inflate its count arbitrarily.
--   2. songs.plays was directly UPDATE-able by anon/authenticated clients,
--      so a chart position could be gamed with a raw REST call.
--   3. play_history accepted an arbitrary client-supplied user_id, so a
--      malicious client could write fake listening history for anyone.
--
-- Fix: a single SECURITY DEFINER RPC (record_play) becomes the only path
-- that can increment songs.plays or insert play_history. It determines the
-- caller's identity itself from the verified Clerk JWT (never trusts a
-- client-supplied user id) and falls back to a client-supplied device id
-- for anonymous listeners (anon plays still count, per D3 — just rate-
-- limited). Table/column grants for direct writes are revoked so the RPC
-- is the only route in either case.
-- ============================================================

-- Tracks the last time a given actor (verified user id, or device id for
-- anonymous listeners) played a given song, purely for dedupe — never
-- exposed to clients directly.
CREATE TABLE IF NOT EXISTS public.song_play_dedupe (
    actor text NOT NULL,
    song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    last_played_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (actor, song_id)
);

ALTER TABLE public.song_play_dedupe ENABLE ROW LEVEL SECURITY;
-- No policies granted to anon/authenticated on purpose — only the
-- SECURITY DEFINER function below (which bypasses RLS as its owner) may
-- read or write this table.
REVOKE ALL ON public.song_play_dedupe FROM anon, authenticated;
GRANT ALL ON public.song_play_dedupe TO service_role;

CREATE OR REPLACE FUNCTION public.record_play(p_song_id uuid, p_device_id text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id text;
    v_actor text;
    v_last timestamptz;
    v_window interval := interval '60 seconds';
BEGIN
    -- Verified caller identity from the Clerk-issued JWT (sub claim) —
    -- this is set by PostgREST from the request's Authorization header,
    -- never from a client-supplied parameter.
    v_user_id := NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
    v_actor := COALESCE(v_user_id, NULLIF(p_device_id, ''));

    -- No way to identify the caller at all (no session, no device id) —
    -- still count the play (D3: anon plays count), just skip dedupe/history.
    IF v_actor IS NULL THEN
        UPDATE public.songs SET plays = COALESCE(plays, 0) + 1 WHERE id = p_song_id;
        RETURN;
    END IF;

    SELECT last_played_at INTO v_last
      FROM public.song_play_dedupe
     WHERE actor = v_actor AND song_id = p_song_id
     FOR UPDATE;

    IF v_last IS NOT NULL AND now() - v_last < v_window THEN
        RETURN; -- deduped: same actor replayed this song within the window
    END IF;

    INSERT INTO public.song_play_dedupe (actor, song_id, last_played_at)
    VALUES (v_actor, p_song_id, now())
    ON CONFLICT (actor, song_id) DO UPDATE SET last_played_at = now();

    UPDATE public.songs SET plays = COALESCE(plays, 0) + 1 WHERE id = p_song_id;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.play_history (user_id, song_id) VALUES (v_user_id, p_song_id);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_play(uuid, text) TO anon, authenticated;

-- Old RPC had no dedupe and is fully superseded by record_play — block it
-- so nothing can bypass the new dedupe/verified-identity path through it.
REVOKE EXECUTE ON FUNCTION public.increment_play_count(uuid) FROM anon, authenticated;

-- D3: songs.plays is RPC-only now. record_play runs SECURITY DEFINER, so
-- it's unaffected by this revoke — only direct client UPDATEs are blocked.
REVOKE UPDATE (plays) ON public.songs FROM anon, authenticated;

-- D4: play_history is RPC-only now — no more direct client inserts with an
-- arbitrary user_id. record_play inserts using the verified JWT sub.
DROP POLICY IF EXISTS "Users can insert play history" ON public.play_history;
REVOKE INSERT ON public.play_history FROM anon, authenticated;
