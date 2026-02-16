import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const TestRSSPage = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runTest = async () => {
        setLoading(true);
        setLogs([]);
        addLog('Starting VERBOSE RSS Diagnostic...');

        try {
            // 1. Get Source URL
            const { data: source } = await supabase
                .from('rss_feed_sources')
                .select('*')
                .eq('country_code', 'EU-BA')
                .maybeSingle();

            if (!source) {
                addLog('❌ No source found for EU-BA');
                setLoading(false);
                return;
            }

            const feedUrl = source.url;
            addLog(`Target URL: ${feedUrl}`);

            // 2. Try rss2json
            addLog('\n--- Attempt 1: rss2json ---');
            try {
                const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
                addLog(`Fetching: ${apiUrl}`);
                const res = await fetch(apiUrl);
                addLog(`Status: ${res.status} ${res.statusText}`);

                if (res.ok) {
                    const data = await res.json();
                    addLog(`Response Status: ${data.status}`);
                    if (data.items) {
                        addLog(`✅ Items found: ${data.items.length}`);
                    } else {
                        addLog('❌ No items in response');
                        addLog(`Response: ${JSON.stringify(data).substring(0, 100)}...`);
                    }
                } else {
                    const text = await res.text();
                    addLog(`❌ Error Body: ${text.substring(0, 100)}`);
                }
            } catch (e: any) {
                addLog(`❌ Exception: ${e.message}`);
            }

            // 3. Try CORS Proxies
            const proxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
                // `https://cors-anywhere.herokuapp.com/${feedUrl}`, // Usually requires demo access
            ];

            for (const proxy of proxies) {
                addLog(`\n--- Attempt: Proxy (${proxy.substring(0, 30)}...) ---`);
                try {
                    const res = await fetch(proxy);
                    addLog(`Status: ${res.status}`);
                    if (res.ok) {
                        const text = await res.text();
                        addLog(`Received ${text.length} chars`);

                        // Try Parsing
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(text, 'text/xml');
                        const parseError = xmlDoc.querySelector('parsererror');
                        if (parseError) {
                            addLog(`❌ XML Parse Error: ${parseError.textContent}`);
                        } else {
                            const items = xmlDoc.querySelectorAll('item, entry');
                            addLog(`✅ XML Parsed. Items found: ${items.length}`);
                        }
                    } else {
                        addLog('❌ Request failed');
                    }
                } catch (e: any) {
                    addLog(`❌ Exception: ${e.message}`);
                }
            }

        } catch (e: any) {
            addLog(`❌ Critical Test Error: ${e.message}`);
        } finally {
            setLoading(false);
            addLog('\nTest Complete.');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Verbose RSS Debugger</h1>
            <button
                onClick={runTest}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
                {loading ? 'Running...' : 'Run Verbose Test'}
            </button>

            <div className="mt-6 bg-black text-green-400 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap min-h-[400px] overflow-auto">
                {logs.length === 0 ? 'Waiting to run...' : logs.join('\n')}
            </div>
        </div>
    );
};
