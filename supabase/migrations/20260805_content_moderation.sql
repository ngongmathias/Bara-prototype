-- ============================================================
-- Content moderation & reporting (STREAMS_MASTER_PLAN.md §F / D4)
--
-- Post-publish + reports model: instant publishing stays, but users can
-- report a song/album/artist/playlist (copyright, inappropriate,
-- impersonation, other), anyone can file a DMCA/copyright claim without an
-- account, and admins review a queue that can dismiss or take content down.
--
-- Same locked-down shape as verification_requests/artist_claims: no direct
-- table grants at all, every read/write goes through a SECURITY DEFINER RPC
-- so anonymous DMCA submission works without needing a Clerk JWT, and admin
-- access is gated on admin_users inside the function, not RLS.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type       TEXT NOT NULL CHECK (entity_type IN ('song', 'album', 'artist', 'playlist')),
    entity_id         UUID NOT NULL,
    reporter_user_id  TEXT,           -- NULL for anonymous/DMCA submissions
    reporter_email    TEXT,           -- for anonymous follow-up; optional for signed-in reporters too
    category          TEXT NOT NULL CHECK (category IN ('copyright', 'inappropriate', 'impersonation', 'other')),
    description       TEXT,
    status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'actioned')),
    reviewer_notes    TEXT,
    reviewed_by       TEXT,
    reviewed_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_entity ON public.content_reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_pending ON public.content_reports(created_at) WHERE status = 'pending';

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.content_reports FROM anon, authenticated;
GRANT ALL ON public.content_reports TO service_role;

-- 1. Submit — used by both the signed-in Report action and the public,
--    no-login DMCA form. p_reporter_user_id is whatever the client claims;
--    it's advisory only (shown to the admin), never used for access control,
--    since this table has no per-reporter read access anyway.
CREATE OR REPLACE FUNCTION public.content_report_submit(
    p_entity_type      TEXT,
    p_entity_id        UUID,
    p_category         TEXT,
    p_description      TEXT DEFAULT NULL,
    p_reporter_user_id TEXT DEFAULT NULL,
    p_reporter_email   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_entity_type NOT IN ('song', 'album', 'artist', 'playlist') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_entity_type');
    END IF;
    IF p_category NOT IN ('copyright', 'inappropriate', 'impersonation', 'other') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_category');
    END IF;
    IF p_entity_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'missing_entity');
    END IF;

    INSERT INTO content_reports (entity_type, entity_id, category, description, reporter_user_id, reporter_email)
    VALUES (p_entity_type, p_entity_id, p_category, NULLIF(p_description, ''), NULLIF(p_reporter_user_id, ''), NULLIF(p_reporter_email, ''))
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.content_report_submit(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 2. Admin queue — full rows, gated on admin_users.
CREATE OR REPLACE FUNCTION public.content_reports_admin_list(p_admin_id TEXT, p_status TEXT DEFAULT NULL)
RETURNS SETOF content_reports
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
        SELECT * FROM content_reports
         WHERE p_status IS NULL OR status = p_status
         ORDER BY created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.content_reports_admin_list(TEXT, TEXT) TO anon, authenticated;

-- 3. Admin review: dismiss, or take down (unpublish, not hard delete) +
--    notify the owner. Takedown is only wired for 'song' right now — that's
--    the only entity type with a publish/draft state (Phase 5, §E4); album/
--    artist/playlist reports can still be dismissed, but "takedown" for them
--    is a future addition once they grow the same status column.
CREATE OR REPLACE FUNCTION public.content_report_review(
    p_admin_id  TEXT,
    p_report_id UUID,
    p_action    TEXT, -- 'dismiss' | 'takedown'
    p_notes     TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report content_reports%ROWTYPE;
    v_owner_user_id TEXT;
    v_title TEXT;
BEGIN
    IF p_admin_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_admin');
    END IF;
    IF p_action NOT IN ('dismiss', 'takedown') THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_action');
    END IF;

    SELECT * INTO v_report FROM content_reports WHERE id = p_report_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_found');
    END IF;
    IF v_report.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_reviewed');
    END IF;

    IF p_action = 'takedown' AND v_report.entity_type <> 'song' THEN
        RETURN jsonb_build_object('success', false, 'error', 'takedown_unsupported_for_entity_type');
    END IF;

    UPDATE content_reports
       SET status = CASE WHEN p_action = 'takedown' THEN 'actioned' ELSE 'dismissed' END,
           reviewer_notes = p_notes,
           reviewed_by = p_admin_id,
           reviewed_at = now(),
           updated_at = now()
     WHERE id = p_report_id;

    IF p_action = 'takedown' THEN
        UPDATE songs SET status = 'draft' WHERE id = v_report.entity_id;

        SELECT a.user_id, s.title INTO v_owner_user_id, v_title
          FROM songs s JOIN artists a ON a.id = s.artist_id
         WHERE s.id = v_report.entity_id;

        IF v_owner_user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES (
                v_owner_user_id,
                'warning',
                'Content taken down',
                COALESCE('"' || v_title || '" was taken down after a report.', 'Your content was taken down after a report.')
                    || ' ' || COALESCE(p_notes, 'Contact support if you believe this was a mistake.'),
                '/streams/creator'
            );
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.content_report_review(TEXT, UUID, TEXT, TEXT) TO anon, authenticated;
