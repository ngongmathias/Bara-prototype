-- Add payment and capacity fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS payment_instructions TEXT,
ADD COLUMN IF NOT EXISTS payment_contact TEXT,
ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
ADD COLUMN IF NOT EXISTS current_registrations INTEGER DEFAULT 0;

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  ticket_type TEXT DEFAULT 'general',
  quantity INTEGER DEFAULT 1,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  payment_method TEXT, -- 'free', 'momo', 'bank_transfer', 'cash'
  payment_proof_url TEXT,
  confirmed_by_user BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON event_registrations(payment_status);

-- Add RLS policies
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own registrations
CREATE POLICY "Users can create registrations" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own registrations
CREATE POLICY "Users can update own registrations" ON event_registrations
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Event organizers can view all registrations for their events
CREATE POLICY "Organizers can view event registrations" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_registrations.event_id 
      AND events.created_by_user_id = auth.uid()::text
    )
  );

-- Function to increment registration count
CREATE OR REPLACE FUNCTION increment_event_registrations(event_uuid UUID, qty INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET current_registrations = COALESCE(current_registrations, 0) + qty,
      updated_at = NOW()
  WHERE id = event_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement registration count
CREATE OR REPLACE FUNCTION decrement_event_registrations(event_uuid UUID, qty INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET current_registrations = GREATEST(COALESCE(current_registrations, 0) - qty, 0),
      updated_at = NOW()
  WHERE id = event_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
