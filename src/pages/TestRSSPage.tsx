import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAndParseRSSFeed } from '@/lib/rssService';

export const TestRSSPage = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runTest = async () => {
        setLoading(true);
        setLogs([]);
        addLog('Starting RSS Diagnostic Test for EU-BA...');

        try {
            // 1. Check Source
            addLog('1. Checking rss_feed_sources table...');
            const { data: source, error: sourceError } = await supabase
                .from('rss_feed_sources')
                .select('*')
                .eq('country_code', 'EU-BA')
                .maybeSingle();

            if (sourceError) {
                addLog(`❌ Error fetching source: ${sourceError.message}`);
            } else if (!source) {
                addLog('❌ No source found for EU-BA');
            } else {
                addLog(`✅ Source found: ${source.name}`);
                addLog(`   URL: ${source.url}`);
                addLog(`   Active: ${source.is_active}`);
                addLog(`   Last Fetched: ${source.last_fetched_at}`);

                // 2. Test Live Fetch
                addLog('2. Testing Live Fetch using rssService...');
                const items = await fetchAndParseRSSFeed(source.url, source.name);
                addLog(`   Result: ${items.length} items fetched`);
                if (items.length > 0) {
                    addLog(`   Sample: ${items[0].title}`);
                } else {
                    addLog('   ❌ Live fetch returned 0 items. Check console for CORS/API errors.');
                }

                // 3. Check Stored Feeds
                addLog('3. Checking rss_feeds table (Existing Data)...');
                const { count, error: feedError } = await supabase
                    .from('rss_feeds')
                    .select('*', { count: 'exact', head: true })
                    .eq('country_code', 'EU-BA');

                if (feedError) {
                    addLog(`❌ Error counting feeds: ${feedError.message}`);
                } else {
                    addLog(`   Count: ${count} items stored in DB for EU-BA`);
                }
            }

        } catch (e: any) {
            addLog(`❌ Critical Error: ${e.message}`);
        } finally {
            setLoading(false);
            addLog('Test Complete.');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">RSS Diagnostic Tool</h1>
            <button
                onClick={runTest}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {loading ? 'Running...' : 'Run Test'}
            </button>

            <div className="mt-6 bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap min-h-[300px]">
                {logs.length === 0 ? 'Click Run Test to start...' : logs.join('\n')}
            </div>
        </div>
    );
};
