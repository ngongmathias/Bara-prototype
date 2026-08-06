// Builds a candidate Google News RSS URL for every active country on the site
// and VERIFIES it by live fetch, counting <item> elements. Nothing is written
// to the database — this exists so we only ever persist URLs that are proven
// to return articles.
//
// Run: node scripts/verify_rss_urls.mjs
//
// Why an explicit map rather than interpolating the country code: the site's
// codes are not all ISO (ED, US-BA, GB-BA, EU-BA, BR-BA are people-groups, not
// countries) and one is simply wrong (Morocco is stored as MC, which is
// Monaco). Interpolating those into a Google News URL produces a wrong or
// empty edition, which is exactly the bug we are fixing.

const OVERRIDES = {
  // People-groups / diaspora — topical queries, hosted in the relevant edition
  'US-BA': { query: 'African American news', gl: 'US', hl: 'en-US', ceid: 'US:en' },
  'GB-BA': { query: 'Black British news', gl: 'GB', hl: 'en-GB', ceid: 'GB:en' },
  'EU-BA': { query: 'Black Europeans Africa diaspora', gl: 'GB', hl: 'en-GB', ceid: 'GB:en' },
  'BR-BA': { query: 'afro-brasileiros', gl: 'BR', hl: 'pt-BR', ceid: 'BR:pt-419' },
  'ED': { query: 'HBCU', gl: 'US', hl: 'en-US', ceid: 'US:en' },
  // Morocco is stored under Monaco's ISO code — force the real edition
  'MC': { query: 'Morocco news', gl: 'MA', hl: 'en-MA', ceid: 'MA:en' },
};

const COUNTRIES = `AO|Angola
AG|Antigua and Barbuda
BB|Barbados
BZ|Belize
BJ|Benin
US-BA|Black/African Americans
BR-BA|Black/African Brazilians
GB-BA|Black/African British
EU-BA|Black/African Europeans
BW|Botswana
BF|Burkina Faso
CM|Cameroon
CV|Cape Verde
DM|Dominica
EG|Egypt
ET|Ethiopia
GA|Gabon
GH|Ghana
GD|Grenada
HT|Haiti
ED|HBCU
JM|Jamaica
KE|Kenya
MW|Malawi
MC|Morocco
NA|Namibia
NG|Nigeria
RW|Rwanda
LC|Saint Lucia
VC|Saint Vincent and the Grenadines
SN|Senegal
SC|Seychelles
ZA|South Africa
TZ|Tanzania
BS|The Bahamas
GM|The Gambia
TT|Trinidad & Tobago
UG|Uganda
ZM|Zambia
ZW|Zimbabwe`
  .split('\n')
  .map((l) => { const [code, ...rest] = l.split('|'); return { code, name: rest.join('|') }; });

function buildUrl(code, name) {
  const o = OVERRIDES[code];
  if (o) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(o.query)}&hl=${o.hl}&gl=${o.gl}&ceid=${encodeURIComponent(o.ceid)}`;
  }
  // Default: "<Country> news" in that country's English edition.
  return `https://news.google.com/rss/search?q=${encodeURIComponent(name + ' news')}&hl=en-${code}&gl=${code}&ceid=${encodeURIComponent(code + ':en')}`;
}

async function countItems(url) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; BaraAfrikaBot/1.0)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return { count: -1, note: `HTTP ${res.status}` };
    const xml = await res.text();
    return { count: (xml.match(/<item>/g) || []).length, note: '' };
  } catch (e) {
    return { count: -1, note: e.name === 'TimeoutError' ? 'timeout' : e.message.slice(0, 40) };
  }
}

const results = [];
for (const { code, name } of COUNTRIES) {
  const url = buildUrl(code, name);
  const { count, note } = await countItems(url);
  results.push({ code, name, count, note, url });
  const flag = count > 0 ? 'OK  ' : 'FAIL';
  console.log(`${flag} ${String(count).padStart(4)}  ${code.padEnd(6)} ${name}${note ? '  (' + note + ')' : ''}`);
}

const bad = results.filter((r) => r.count <= 0);
console.log(`\n=== ${results.length - bad.length}/${results.length} returning articles ===`);
if (bad.length) {
  console.log('NEEDS A DIFFERENT QUERY:');
  bad.forEach((r) => console.log(`  ${r.code} ${r.name} -> ${r.url}`));
}

// Emit the SQL-ready mapping for the migration, only for verified-good URLs.
console.log('\n--- verified URLs (code<TAB>url) ---');
results.filter((r) => r.count > 0).forEach((r) => console.log(`${r.code}\t${r.url}`));
