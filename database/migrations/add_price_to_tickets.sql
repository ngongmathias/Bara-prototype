-- Add price to event_tickets table
ALTER TABLE event_tickets
ADD COLUMN price NUMERIC DEFAULT 0;

-- Optional: Add a check constraint to ensure price is not negative
ALTER TABLE event_tickets
ADD CONSTRAINT check_ticket_price_positive CHECK (price >= 0);

-- Update RLS policies to allow price matching? It's on tickets, so public reading is likely already fine. 
