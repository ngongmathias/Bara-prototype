const supabaseUrl = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjk4NzYsImV4cCI6MjA4MTc0NTg3Nn0.EpIoS1esjFPzJ4ruKhTiJoVNk09Em4edd9beTdVRpRw';

async function testAnonFetch() {
    console.log('Fetching artists with ANON key...');
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/artists?select=*`, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            }
        });
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Data length:', data.length);
        if (data.length > 0) {
            console.log('Sample artist:', data[0].name);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

testAnonFetch();
