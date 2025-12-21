-- Add admin_notes column to sponsored_banners table
-- This column stores internal notes from admins about each banner

ALTER TABLE sponsored_banners 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN sponsored_banners.admin_notes IS 'Internal admin notes about this banner (not visible to advertisers)';
