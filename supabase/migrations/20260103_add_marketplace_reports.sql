-- Create marketplace reports table
CREATE TABLE IF NOT EXISTS marketplace_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  reported_by TEXT,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_listing ON marketplace_reports(listing_id);
CREATE INDEX idx_reports_status ON marketplace_reports(status);
CREATE INDEX idx_reports_created ON marketplace_reports(created_at DESC);
