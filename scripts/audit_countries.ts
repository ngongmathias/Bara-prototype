
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditCountries() {
    console.log('🔍 Auditing Country Codes for Diaspora Communities...\n');

    // 1. Fetch potential diaspora countries
    const { data: countries, error } = await supabase
        .from('countries')
        .select('id, name, code, is_active')
        .or('name.ilike.%Black%,name.ilike.%African%,name.ilike.%Native%,name.ilike.%Global%')
        .order('name');

    if (error) {
        console.error('❌ Error fetching countries:', error);
        return;
    }

    // 2. Fetch all RSS Feed Sources to compare
    const { data: sources, error: sourceError } = await supabase
        .from('rss_feed_sources')
        .select('country_name, country_code, is_active')
        .eq('is_active', true);

    if (sourceError) {
        console.error('❌ Error fetching RSS sources:', sourceError);
        return;
    }

    const sourceMap = new Map(sources?.map(s => [s.country_name, s.country_code]));

    console.log('| Country Name | Current Code | Is Active | RSS Source Code | Status |');
    console.log('|---|---|---|---|---|');

    let issuesFound = 0;

    countries?.forEach(c => {
        const rssCode = sourceMap.get(c.name) || 'NONE';
        let status = '✅ OK';

        // Check for mismatch
        if (rssCode !== 'NONE' && c.code !== rssCode) {
            status = '❌ MISMATCH'; // The country code doesn't match the RSS source code
            issuesFound++;
        } else if (rssCode === 'NONE') {
            status = '⚠️ NO RSS';
        } else if (c.code.length === 2 && (c.name.includes('Black') || c.name.includes('African'))) {
            // Heuristic: If it has "Black" in name but a 2-letter code, it's likely wrong (e.g. BE for Black Europeans)
            // Unless it's South Africa (ZA), etc.
            status = '❓ SUSPICIOUS ISO';
            if (c.code !== rssCode) issuesFound++;
        }

        console.log(`| ${c.name.padEnd(30)} | ${c.code.padEnd(10)} | ${String(c.is_active).padEnd(5)} | ${rssCode.padEnd(10)} | ${status} |`);
    });

    console.log(`\nFound ${issuesFound} potential configuration issues.`);
}

auditCountries();
