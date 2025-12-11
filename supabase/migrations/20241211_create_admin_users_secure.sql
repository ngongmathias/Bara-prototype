-- Create admin_users table with proper security
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- super_admin, admin, moderator
  permissions TEXT[] DEFAULT ARRAY['read', 'write'], -- read, write, delete, admin
  is_active BOOLEAN DEFAULT true,
  added_by TEXT, -- Clerk user ID of who added this admin
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (backend) full access
CREATE POLICY "Service role has full access to admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can read their own admin record
CREATE POLICY "Users can read their own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Policy: Super admins can read all admin records
CREATE POLICY "Super admins can read all admin records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()::text
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Policy: Super admins can insert new admin records
CREATE POLICY "Super admins can insert admin records"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()::text
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Policy: Super admins can update admin records
CREATE POLICY "Super admins can update admin records"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()::text
      AND role = 'super_admin'
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()::text
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Policy: Super admins can delete admin records (except themselves)
CREATE POLICY "Super admins can delete admin records"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    user_id != auth.uid()::text -- Can't delete yourself
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()::text
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at_trigger ON admin_users;
CREATE TRIGGER update_admin_users_updated_at_trigger
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert the first super admin (YOU)
-- Replace 'your-clerk-user-id' and 'your-email@example.com' with your actual details
-- You'll need to get your Clerk user ID after signing in once
INSERT INTO admin_users (user_id, email, first_name, last_name, role, permissions, is_active, added_by)
VALUES (
  'PLACEHOLDER_USER_ID', -- We'll update this after you sign in
  'PLACEHOLDER_EMAIL', -- Your email
  'Super',
  'Admin',
  'super_admin',
  ARRAY['read', 'write', 'delete', 'admin'],
  true,
  'system'
)
ON CONFLICT (user_id) DO NOTHING;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- added_admin, removed_admin, changed_role, etc.
  target_user_id TEXT, -- User affected by the action
  target_email TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for admin activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user_id ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- Enable RLS for activity log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can read all activity logs
CREATE POLICY "Super admins can read activity logs"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()::text
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Policy: Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs"
  ON admin_activity_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE admin_users IS 'Stores admin user information with role-based access control';
COMMENT ON TABLE admin_activity_log IS 'Audit log for admin management actions';
