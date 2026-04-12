-- ============================================================
-- Remove duplicate/conflicting RLS policies on marketplace_favorites
-- ============================================================

-- Drop all old policies that conflict with Clerk JWT policies
DROP POLICY IF EXISTS "Allow deletes to favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Allow inserts to favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Allow public read access to favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Allow updates to favorites" ON marketplace_favorites;
DROP POLICY IF EXISTS "Users can manage their marketplace favorites" ON marketplace_favorites;

-- The correct Clerk-based policies should remain:
-- - favorites_select (using current_setting JWT)
-- - favorites_insert (using current_setting JWT)
-- - favorites_delete (using current_setting JWT)

-- Verify the correct policies exist
DO $$
BEGIN
  -- Ensure favorites_insert has WITH CHECK clause
  DROP POLICY IF EXISTS "favorites_insert" ON marketplace_favorites;
  CREATE POLICY "favorites_insert" ON marketplace_favorites
    FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub'));
END $$;
