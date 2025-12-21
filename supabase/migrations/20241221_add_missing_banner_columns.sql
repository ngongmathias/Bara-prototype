-- Add missing columns to sponsored_banners table
-- These columns are required for the admin edit functionality

-- Add status column (workflow status: pending, approved, active, rejected, inactive)
ALTER TABLE sponsored_banners 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'rejected', 'inactive'));

-- Add admin_notes column (internal notes from admins)
ALTER TABLE sponsored_banners 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add contact information columns
ALTER TABLE sponsored_banners 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add approved_at timestamp
ALTER TABLE sponsored_banners 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN sponsored_banners.status IS 'Banner approval workflow status: pending (awaiting review), approved (ready to activate), active (currently live), rejected (not approved), inactive (paused)';
COMMENT ON COLUMN sponsored_banners.admin_notes IS 'Internal admin notes about this banner (not visible to advertisers)';
COMMENT ON COLUMN sponsored_banners.contact_name IS 'Advertiser contact person name';
COMMENT ON COLUMN sponsored_banners.contact_email IS 'Advertiser contact email';
COMMENT ON COLUMN sponsored_banners.contact_phone IS 'Advertiser contact phone number';
COMMENT ON COLUMN sponsored_banners.approved_at IS 'Timestamp when banner was approved by admin';

-- Update existing banners to have a default status if null
UPDATE sponsored_banners 
SET status = 'pending' 
WHERE status IS NULL;

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_sponsored_banners_status ON sponsored_banners(status);
CREATE INDEX IF NOT EXISTS idx_sponsored_banners_status_active ON sponsored_banners(status, is_active) WHERE is_active = true;
