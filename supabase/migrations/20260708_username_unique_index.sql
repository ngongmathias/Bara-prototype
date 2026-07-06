-- Phase 27.8.1 — Auto-proposed usernames: global, case-insensitive uniqueness.
-- Sign-up derives a username from first + last name (client appends the
-- smallest free numeric suffix on collision); this index is the authoritative
-- guard so races and the profile-settings edit path can never create
-- case-insensitive duplicates.

-- 1) Resolve any existing case-insensitive duplicates by appending the
--    smallest free numeric suffix to all but the oldest row, so the unique
--    index below can be created.
DO $$
DECLARE
    dup RECORD;
    candidate TEXT;
    n INT;
BEGIN
    FOR dup IN
        SELECT id, username
        FROM (
            SELECT id, username,
                   ROW_NUMBER() OVER (PARTITION BY lower(username) ORDER BY created_at NULLS LAST, id) AS rn
            FROM clerk_users
            WHERE username IS NOT NULL AND username <> ''
        ) t
        WHERE t.rn > 1
    LOOP
        n := 2;
        LOOP
            candidate := lower(dup.username) || n::text;
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM clerk_users WHERE lower(username) = candidate
            );
            n := n + 1;
        END LOOP;
        UPDATE clerk_users SET username = candidate WHERE id = dup.id;
    END LOOP;
END $$;

-- 2) The guard itself. Partial so legacy rows with no username are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS clerk_users_username_lower_unique
    ON clerk_users (lower(username))
    WHERE username IS NOT NULL AND username <> '';
