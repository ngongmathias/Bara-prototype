-- ============================================================
-- Artist claim flow (STREAMS_MASTER_PLAN.md §E1)
--
-- Admin-seeded artists (artists.user_id IS NULL) had no way to become
-- claimable by the real artist — and nothing stopped two rows existing for
-- the same person, or a race creating a duplicate on first upload. Adds:
--   1. A UNIQUE constraint on artists.user_id (multiple NULLs still allowed
--      — that's the normal "unclaimed, admin-seeded" state).
--   2. artist_claims: a verification-style request queue, reviewed the same
--      way verification_requests already is.
--   3. artist_claim_review RPC mirroring verification_admin_review's shape.
-- ============================================================

-- 1. Enforce one artist row per real user going forward. If duplicate
-- non-null user_id rows already exist this constraint will fail to apply —
-- that's a genuine data issue to resolve by hand before it can land, not
-- something safe to silently paper over here.
ALTER TABLE public.artists
  ADD CONSTRAINT artists_user_id_unique UNIQUE (user_id);

-- 2. Claim requests
CREATE TABLE IF NOT EXISTS public.artist_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    requester_user_id TEXT NOT NULL,
    evidence TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artist_claims_artist ON public.artist_claims(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_claims_requester ON public.artist_claims(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_artist_claims_status ON public.artist_claims(status);

-- One pending claim per (artist, requester) at a time — resubmitting while
-- already pending should update the existing row, not pile up duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_claims_one_pending
  ON public.artist_claims(artist_id, requester_user_id)
  WHERE status = 'pending';

ALTER TABLE public.artist_claims ENABLE ROW LEVEL SECURITY;

-- Requesters can see and create their own claims (Clerk JWT sub, same
-- pattern as user_follows/user_song_likes elsewhere in this project).
DROP POLICY IF EXISTS "artist_claims_own_select" ON public.artist_claims;
CREATE POLICY "artist_claims_own_select" ON public.artist_claims
FOR SELECT USING (
    requester_user_id = NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')
);

DROP POLICY IF EXISTS "artist_claims_own_insert" ON public.artist_claims;
CREATE POLICY "artist_claims_own_insert" ON public.artist_claims
FOR INSERT WITH CHECK (
    requester_user_id = NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')
);

-- Admins review through the RPC below (SECURITY DEFINER), not direct table
-- access, so no admin SELECT/UPDATE policy is needed here.
GRANT SELECT, INSERT ON public.artist_claims TO authenticated;
GRANT ALL ON public.artist_claims TO service_role;

-- 3. Review RPC — same shape as verification_admin_review.
CREATE OR REPLACE FUNCTION public.artist_claim_review(
    p_admin_id TEXT,
    p_claim_id UUID,
    p_approve  BOOLEAN,
    p_notes    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_claim artist_claims%ROWTYPE;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;

    SELECT * INTO v_claim FROM artist_claims WHERE id = p_claim_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;
    IF v_claim.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_reviewed');
    END IF;

    UPDATE artist_claims
       SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
           reviewer_notes = p_notes,
           reviewed_by = p_admin_id,
           reviewed_at = now(),
           updated_at = now()
     WHERE id = p_claim_id;

    IF p_approve THEN
        -- Only claim it if still unclaimed — the UNIQUE constraint would
        -- reject this anyway if the requester already owns a different
        -- artist row, or if someone else claimed this one in the meantime.
        UPDATE artists
           SET user_id = v_claim.requester_user_id
         WHERE id = v_claim.artist_id AND user_id IS NULL;

        IF NOT FOUND THEN
            UPDATE artist_claims SET status = 'pending', reviewed_by = NULL, reviewed_at = NULL WHERE id = p_claim_id;
            RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
        END IF;
    END IF;

    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        v_claim.requester_user_id,
        CASE WHEN p_approve THEN 'success' ELSE 'info' END,
        CASE WHEN p_approve THEN 'Artist profile claimed!' ELSE 'Artist claim update' END,
        CASE WHEN p_approve
             THEN 'Your artist profile claim was approved. It''s now linked to your account.'
             ELSE COALESCE('Your artist claim was not approved. ' || NULLIF(p_notes, ''),
                           'Your artist claim was not approved.')
        END,
        '/streams/creator'
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.artist_claim_review(TEXT, UUID, BOOLEAN, TEXT) TO anon, authenticated;
