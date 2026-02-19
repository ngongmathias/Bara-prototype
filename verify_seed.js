import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying table existence and data...');

    // Check existence
    const { data: tablesInfo, error: tablesError } = await supabase
        .rpc('get_tables_count', {}, { head: false }); // Wait, maybe I don't have this RPC.

    // Let's just try simple selects
    const tables = ['artists', 'albums', 'songs', 'sports_news', 'sports_videos', 'leagues', 'teams', 'matches'];

    for (const table of tables) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);

        if (error) {
            console.log(`Table ${table} Error:`, error.message || error);
        } else {
            console.log(`Table ${table}: ${count} rows found.`);
            if (data && data.length > 0) {
                console.log(`  Sample data in ${table} exists.`);
            }
        }
    }
}

verify();
