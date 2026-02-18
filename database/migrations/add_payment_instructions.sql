-- Add payment instruction fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS payment_instructions TEXT,
ADD COLUMN IF NOT EXISTS payment_contact TEXT;

-- Update the handle_new_user function to be more robust (optional cleanup found during audit, but keeping focused on events for now)
