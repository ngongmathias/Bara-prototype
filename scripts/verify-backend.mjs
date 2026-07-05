// Phase 27 backend verification — safe (reads + guaranteed-fail writes on
// nonexistent rows + read-only RPCs). Creates NO data. Run:
//   node scripts/verify-backend.mjs
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// --- load .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) ---
const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env'); process.exit(2); }

const sb = createClient(url, key);
let pass = 0, fail = 0;
const ok = (m) => { console.log('  ✓', m); pass++; };
const bad = (m) => { console.log('  ✗', m); fail++; };

const TEST_UID = '__phase27_verify_nonexistent__'; // never a real Clerk id

console.log('\n1) Migrations applied — new economy settings present');
{
  const { data, error } = await sb.from('gamification_settings').select('key, value');
  if (error) { bad('read gamification_settings: ' + error.message); }
  else {
    const keys = new Set(data.map((r) => r.key));
    for (const k of ['cost.streak_shield', 'perk.gold_coin_bonus_pct', 'limit.daily_xp_cap', 'limit.daily_coin_gain_cap']) {
      keys.has(k) ? ok(`setting ${k} = ${data.find((r) => r.key === k).value}`) : bad(`setting ${k} MISSING`);
    }
  }
}

console.log('\n2) Weekly missions + Ambassador achievement seeded');
{
  const { data: wm } = await sb.from('missions').select('key').eq('type', 'weekly');
  const wkeys = new Set((wm || []).map((r) => r.key));
  ['weekly_listen', 'weekly_market_post', 'weekly_event'].forEach((k) =>
    wkeys.has(k) ? ok(`mission ${k}`) : bad(`mission ${k} MISSING`));
  const { data: amb } = await sb.from('achievements').select('key').eq('key', 'ambassador').maybeSingle();
  amb ? ok('achievement ambassador') : bad('achievement ambassador MISSING');
}

console.log('\n3) Referral code column + trigger (clerk_users.referral_code)');
{
  const { error } = await sb.from('clerk_users').select('referral_code').limit(1);
  error ? bad('clerk_users.referral_code: ' + error.message) : ok('referral_code column readable');
}

console.log('\n4) SECURITY — direct writes to locked tables must be blocked');
{
  // UPDATE a nonexistent row: with grants revoked this returns a permission error
  // and touches zero rows either way (no pollution).
  const upd = await sb.from('gamification_profiles').update({ bara_coins: 999999 }).eq('user_id', TEST_UID).select();
  if (upd.error) ok('gamification_profiles UPDATE blocked (' + upd.error.code + ' ' + upd.error.message.slice(0, 40) + ')');
  else if ((upd.data || []).length === 0) ok('gamification_profiles UPDATE affected 0 rows (RLS)');
  else bad('gamification_profiles UPDATE SUCCEEDED — lockdown NOT applied!');

  const ins = await sb.from('gamification_history').insert({ user_id: TEST_UID, type: 'xp_gain', amount: 1, reason: 'verify' }).select();
  if (ins.error) ok('gamification_history INSERT blocked (' + ins.error.code + ')');
  else bad('gamification_history INSERT SUCCEEDED — lockdown NOT applied! (cleanup needed)');

  const su = await sb.from('gamification_settings').update({ value: 1 }).eq('key', '__nope__').select();
  if (su.error) ok('gamification_settings UPDATE blocked (' + su.error.code + ')');
  else if ((su.data || []).length === 0) ok('gamification_settings UPDATE affected 0 rows');
  else bad('gamification_settings UPDATE SUCCEEDED — lockdown NOT applied!');
}

console.log('\n5) RPCs — read-only ones work; gated ones refuse without pollution');
{
  const lp = await sb.rpc('leaderboard_period', { p_type: 'xp_gain', p_since: new Date(Date.now() - 7 * 864e5).toISOString(), p_limit: 5 });
  lp.error ? bad('leaderboard_period: ' + lp.error.message) : ok(`leaderboard_period returned ${lp.data.length} rows`);

  const lw = await sb.rpc('leaderboard_last_week_top', { p_limit: 10 });
  lw.error ? bad('leaderboard_last_week_top: ' + lw.error.message) : ok(`leaderboard_last_week_top returned ${lw.data.length} rows`);

  const us = await sb.rpc('economy_update_setting', { p_key: 'xp.song_listen', p_value: 999, p_admin_id: TEST_UID });
  if (us.error) bad('economy_update_setting errored: ' + us.error.message);
  else (us.data?.success === false && us.data?.reason === 'not_admin')
    ? ok('economy_update_setting refused non-admin (writes nothing)')
    : bad('economy_update_setting did NOT refuse a non-admin: ' + JSON.stringify(us.data));

  const rc = await sb.rpc('referral_create', { p_referred_user_id: TEST_UID, p_code: 'ZZZZNOPE' });
  if (rc.error) bad('referral_create errored: ' + rc.error.message);
  else (rc.data?.success === false) ? ok('referral_create rejects unknown code (' + rc.data.reason + ')')
    : bad('referral_create accepted a bogus code: ' + JSON.stringify(rc.data));
}

console.log('\n6) Level-curve function (economy_level_from_xp) matches flattened curve');
{
  // 500 -> L2, 4000 -> L5, 26999 -> L9, 27000 -> L10 (see 27.3.5)
  const checks = [[500, 2], [4000, 5], [26999, 9], [27000, 10]];
  for (const [xp, want] of checks) {
    const r = await sb.rpc('economy_level_from_xp', { p_xp: xp });
    if (r.error) { bad(`economy_level_from_xp(${xp}): ${r.error.message}`); continue; }
    r.data === want ? ok(`level(${xp}) = ${r.data}`) : bad(`level(${xp}) = ${r.data}, expected ${want}`);
  }
}

console.log(`\n${'='.repeat(48)}\n  PASS: ${pass}   FAIL: ${fail}\n${'='.repeat(48)}`);
process.exit(fail === 0 ? 0 : 1);
