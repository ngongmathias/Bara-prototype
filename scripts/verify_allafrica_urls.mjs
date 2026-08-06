// Verifies AllAfrica per-country RSS feeds by live fetch.
//
// Why this exists: Google News returns HTTP 503 to Supabase Edge Function
// datacenter IPs for every request (measured: 44/44 Google sources failed
// while 5/5 direct-outlet sources succeeded in the same run). Routing through
// rss2json works but its free tier 403s after ~10 requests. AllAfrica serves
// per-country RSS directly, permits server-side fetching, and is already one
// of the sources that works from the edge function today.
//
// Run: node scripts/verify_allafrica_urls.mjs

const COUNTRIES = [
  ['AO', 'Angola'], ['BJ', 'Benin'], ['BW', 'Botswana'], ['BF', 'Burkina Faso'],
  ['CM', 'Cameroon'], ['CV', 'Cape Verde'], ['EG', 'Egypt'], ['ET', 'Ethiopia'],
  ['GA', 'Gabon'], ['GH', 'Ghana'], ['GM', 'The Gambia'], ['KE', 'Kenya'],
  ['MW', 'Malawi'], ['MC', 'Morocco'], ['NA', 'Namibia'], ['NG', 'Nigeria'],
  ['RW', 'Rwanda'], ['SN', 'Senegal'], ['SC', 'Seychelles'], ['ZA', 'South Africa'],
  ['TZ', 'Tanzania'], ['UG', 'Uganda'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'],
];

// AllAfrica slugs mostly equal the lowercased name with spaces removed, but a
// few differ from the site's naming.
const SLUG_OVERRIDES = {
  'The Gambia': 'gambia',
  'Cape Verde': 'capeverde',
  'South Africa': 'southafrica',
  'Burkina Faso': 'burkinafaso',
};

const slugFor = (name) => SLUG_OVERRIDES[name] ?? name.toLowerCase().replace(/[^a-z]/g, '');

const results = [];
for (const [code, name] of COUNTRIES) {
  const url = `https://allafrica.com/tools/headlines/rdf/${slugFor(name)}/headlines.rdf`;
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'BaraAfrika-NewsBot/1.0 (+https://baraafrika.com)' },
      signal: AbortSignal.timeout(20000),
    });
    const t = r.ok ? await r.text() : '';
    const n = (t.match(/<item/g) || []).length;
    results.push({ code, name, n, url });
    console.log(`${n > 0 ? 'OK  ' : 'FAIL'} ${String(n).padStart(3)}  ${code.padEnd(3)} ${name}`);
  } catch (e) {
    results.push({ code, name, n: 0, url });
    console.log(`FAIL   0  ${code.padEnd(3)} ${name}  (${e.message.slice(0, 30)})`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

const good = results.filter((r) => r.n > 0);
console.log(`\n=== ${good.length}/${results.length} AllAfrica feeds returning items ===`);
console.log('\n--- code<TAB>url ---');
good.forEach((r) => console.log(`${r.code}\t${r.url}`));
