
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = fs.existsSync(path.resolve(process.cwd(), '.env.local'))
    ? path.resolve(process.cwd(), '.env.local')
    : path.resolve(process.cwd(), '.env');

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/"/g, '');
        env[key] = value;
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditCountries() {
    const { data: countries } = await supabase
        .from('countries')
        .select('id, name, code, is_active')
        .eq('is_active', true)
        .order('name');

    const { data: sources } = await supabase
        .from('rss_feed_sources')
        .select('country_name, country_code, is_active, url')
        .eq('is_active', true);

    const sourceByCode = new Map(sources?.map(s => [s.country_code, s]));

    let output = '| Country Name | Code | Status | Source URL |\n';
    output += '|---|---|---|---|\n';

    if (countries) {
        countries.forEach(c => {
            let status = '✅ OK';
            const source = sourceByCode.get(c.code);
            let url = 'N/A';

            if (!source) {
                status = '⚠️ MISSING';
            } else {
                url = source.url;
            }

            output += `| ${c.name.padEnd(30)} | ${c.code.padEnd(5)} | ${status.padEnd(10)} | ${url} |\n`;
        });
    }

    fs.writeFileSync('audit_results.txt', output);
    console.log('Audit saved to audit_results.txt');
}

auditCountries();
