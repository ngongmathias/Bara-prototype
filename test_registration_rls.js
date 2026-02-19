import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjk4NzYsImV4cCI6MjA4MTc0NTg3Nn0.EpIoS1esjFPzJ4ruKhTiJoVNk09Em4edd9beTdVRpRw';
const supabase = createClient(supabaseUrl, anonKey);

async function testRegistration() {
    console.log('Testing event_registrations insertion with ANON key...');

    // Try to find a valid event_ticket first
    const { data: tickets } = await supabase.from('event_tickets').select('id').limit(1);
    if (!tickets || tickets.length === 0) {
        console.log('No tickets available to test registration.');
        return;
    }

    const ticketId = tickets[0].id;
    const testEmail = `test_${Math.floor(Math.random() * 10000)}@example.com`;

    const { data, error } = await supabase
        .from('event_registrations')
        .insert([
            {
                ticket_id: ticketId,
                user_name: 'Test Runner',
                user_email: testEmail,
                status: 'confirmed'
            }
        ]);

    if (error) {
        console.log('Insertion Error:', error.message);
    } else {
        console.log('Success! Registration inserted successfully.');
        // Cleanup
        await supabase.from('event_registrations').delete().eq('user_email', testEmail);
    }
}

testRegistration();
