-- Add pricing fields to events and event_tickets tables
-- Run this in Supabase SQL Editor

-- Add pricing fields to events table for simple free/paid indication
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS entry_fee numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD';

-- Add price field to event_tickets table for detailed ticket pricing
ALTER TABLE event_tickets
ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD';

-- Add comment to explain the fields
COMMENT ON COLUMN events.is_free IS 'True if the event is completely free to attend';
COMMENT ON COLUMN events.entry_fee IS 'General entry fee if event has simple pricing (not using tickets)';
COMMENT ON COLUMN events.currency IS 'Currency code for entry fee (USD, EUR, GBP, RWF, etc.)';
COMMENT ON COLUMN event_tickets.price IS 'Price for this specific ticket type';
COMMENT ON COLUMN event_tickets.currency IS 'Currency code for ticket price';
