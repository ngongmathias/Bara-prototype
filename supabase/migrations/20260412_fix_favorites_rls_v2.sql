-- ============================================================
-- FIX: marketplace_favorites RLS policies
-- ============================================================
-- The JWT from Clerk via getToken({ template: 'supabase' }) puts the
-- Clerk user_id in the 'sub' claim. The Supabase REST API makes JWT
-- claims available via current_setting('request.jwt.claims').
--
-- However, the issue may be that:
-- 1. The table was created without an 'id' column (fixed in code)
-- 2. The RLS USING expression fails for INSERT (upsert needs SELECT too)
--
-- Solution: Use simpler RLS that checks auth role + user_id match

-- Ensure table has id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_favorites' AND column_name = 'id'
  ) THEN
    ALTER TABLE marketplace_favorites ADD COLUMN id UUID DEFAULT uuid_generate_v4();
  END IF;
END $$;

-- Drop ALL existing policies on marketplace_favorites
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'marketplace_favorites'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON marketplace_favorites', pol.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;

-- Create simple policies that work with Clerk JWT
-- The 'sub' claim in the JWT contains the Clerk user ID
CREATE POLICY "favorites_select_policy" ON marketplace_favorites
  FOR SELECT USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

CREATE POLICY "favorites_insert_policy" ON marketplace_favorites
  FOR INSERT WITH CHECK (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

CREATE POLICY "favorites_delete_policy" ON marketplace_favorites
  FOR DELETE USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

-- Also fix cart policies the same way
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'marketplace_cart_items'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON marketplace_cart_items', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE marketplace_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_select_policy" ON marketplace_cart_items
  FOR SELECT USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

CREATE POLICY "cart_insert_policy" ON marketplace_cart_items
  FOR INSERT WITH CHECK (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

CREATE POLICY "cart_update_policy" ON marketplace_cart_items
  FOR UPDATE USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

CREATE POLICY "cart_delete_policy" ON marketplace_cart_items
  FOR DELETE USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::jsonb->>'sub',
      ''
    )
  );

-- Ensure grants
GRANT SELECT, INSERT, DELETE ON marketplace_favorites TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_cart_items TO anon, authenticated;
