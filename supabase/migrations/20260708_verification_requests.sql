-- ============================================================
-- Phase 27.8.2 — Account verification for businesses & artists
-- ============================================================
-- Verification = a form + uploaded documents, reviewed by an admin.
-- The app talks to Supabase with the tokenless anon client, so auth.uid()
-- RLS is unavailable — ALL access to verification_requests goes through
-- SECURITY DEFINER RPCs (same pattern as the economy hardening): the table
-- itself is fully revoked from anon/authenticated, and admin operations are
-- gated on admin_users inside the functions.
-- ============================================================

-- 1. The requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id  TEXT NOT NULL,
    account_type   TEXT NOT NULL CHECK (account_type IN ('business', 'artist')),
    status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted      JSONB NOT NULL DEFAULT '{}'::jsonb,  -- form fields (name, country, contact, …)
    doc_paths      TEXT[] NOT NULL DEFAULT '{}',        -- storage paths in verification-docs
    reviewer_notes TEXT,
    reviewed_by    TEXT,
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON public.verification_requests (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_pending ON public.verification_requests (created_at) WHERE status = 'pending';

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
-- No direct client access at all — RPCs only (they run as the definer).
REVOKE ALL ON public.verification_requests FROM anon, authenticated;
GRANT ALL ON public.verification_requests TO service_role;

-- 2. Private storage bucket for the documents. NOT public: no public URLs.
--    Owners upload from the form; admins read via short-lived signed URLs.
--    NOTE (same caveat as the 'music' bucket): the app's tokenless anon client
--    needs INSERT to upload and SELECT to create signed URLs, so those are
--    granted at bucket level and REAL privacy comes from the bucket being
--    non-public + unguessable paths. Before real launch, move doc reads to a
--    Clerk-authed client or an Edge Function and drop the anon SELECT policy.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-docs',
    'verification-docs',
    false,                -- private: nothing is served publicly
    20971520,             -- 20 MB per document
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO UPDATE
   SET public = false,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "verification docs upload" ON storage.objects;
CREATE POLICY "verification docs upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'verification-docs');

DROP POLICY IF EXISTS "verification docs read" ON storage.objects;
CREATE POLICY "verification docs read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'verification-docs');

-- 3. Submit a request (owner path). One live pending request per
--    (user, account_type); resubmission allowed after rejection.
CREATE OR REPLACE FUNCTION public.verification_submit(
    p_user_id      TEXT,
    p_account_type TEXT,
    p_submitted    JSONB,
    p_doc_paths    TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_user_id IS NULL OR p_account_type NOT IN ('business', 'artist') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid');
    END IF;

    IF EXISTS (
        SELECT 1 FROM verification_requests
         WHERE clerk_user_id = p_user_id AND account_type = p_account_type
           AND status = 'pending'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_pending');
    END IF;

    IF EXISTS (
        SELECT 1 FROM verification_requests
         WHERE clerk_user_id = p_user_id AND account_type = p_account_type
           AND status = 'approved'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_verified');
    END IF;

    INSERT INTO verification_requests (clerk_user_id, account_type, submitted, doc_paths)
    VALUES (p_user_id, p_account_type, COALESCE(p_submitted, '{}'::jsonb), COALESCE(p_doc_paths, '{}'))
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- 4. The owner's own requests (status page + nudge suppression).
CREATE OR REPLACE FUNCTION public.verification_my_requests(p_user_id TEXT)
RETURNS TABLE (id UUID, account_type TEXT, status TEXT, reviewer_notes TEXT, created_at TIMESTAMPTZ, reviewed_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id, account_type, status, reviewer_notes, created_at, reviewed_at
      FROM verification_requests
     WHERE clerk_user_id = p_user_id
     ORDER BY created_at DESC;
$$;

-- 5. Admin queue — full rows, gated on admin_users.
CREATE OR REPLACE FUNCTION public.verification_admin_list(p_admin_id TEXT, p_status TEXT DEFAULT NULL)
RETURNS SETOF verification_requests
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN;
    END IF;
    RETURN QUERY
        SELECT * FROM verification_requests
         WHERE p_status IS NULL OR status = p_status
         ORDER BY created_at ASC;
END;
$$;

-- 6. Admin review: approve/reject with a note. Approval also flips the
--    existing verified flag the UI already renders — artists.is_verified for
--    artists, marketplace_partners.verification_level for businesses — and
--    notifies the requester.
CREATE OR REPLACE FUNCTION public.verification_admin_review(
    p_admin_id   TEXT,
    p_request_id UUID,
    p_approve    BOOLEAN,
    p_notes      TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req verification_requests%ROWTYPE;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;

    SELECT * INTO v_req FROM verification_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;
    IF v_req.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_reviewed');
    END IF;

    UPDATE verification_requests
       SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
           reviewer_notes = p_notes,
           reviewed_by = p_admin_id,
           reviewed_at = now(),
           updated_at = now()
     WHERE id = p_request_id;

    IF p_approve THEN
        IF v_req.account_type = 'artist' THEN
            UPDATE artists SET is_verified = true WHERE user_id = v_req.clerk_user_id;
        ELSE
            UPDATE marketplace_partners
               SET verification_level = 'business_verified'
             WHERE owner_user_id = v_req.clerk_user_id;
        END IF;
    END IF;

    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        v_req.clerk_user_id,
        CASE WHEN p_approve THEN 'success' ELSE 'info' END,
        CASE WHEN p_approve THEN 'Your account is verified!' ELSE 'Verification request update' END,
        CASE WHEN p_approve
             THEN 'Your ' || v_req.account_type || ' verification was approved. Your verified badge is now live.'
             ELSE COALESCE('Your verification request was not approved. ' || NULLIF(p_notes, ''),
                           'Your verification request was not approved. You can submit a new request with updated documents.')
        END,
        '/verify-account'
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verification_submit(TEXT, TEXT, JSONB, TEXT[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verification_my_requests(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verification_admin_list(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verification_admin_review(TEXT, UUID, BOOLEAN, TEXT) TO anon, authenticated;
