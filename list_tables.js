import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('Listing tables via REST API...');

    // Try to fetching the OpenAPI spec which lists tables
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const spec = await response.json();
        if (spec.definitions) {
            console.log('Available tables in definitions:');
            Object.keys(spec.definitions).forEach(table => console.log(` - ${table}`));
        } else {
            console.log('Could not find definitions in spec.');
        }
    } catch (e) {
        console.log('Exception fetching spec:', e.message);
    }
}

listTables();
