// Phase 27.3.5 — proof that flattening the early curve never demotes anyone.
// Run: node scripts/verify-level-curve.mjs
//
// Asserts:
//  1. For every XP total, the NEW level >= the OLD level (nobody drops).
//  2. NEW and OLD agree for all XP >= 27,000 (L10+ curve unchanged).
//  3. getXPForLevel is strictly increasing, and calculateLevel(getXPForLevel(L))
//     is within {L-1, L} (a floored threshold sits one XP below the real
//     boundary — the same artifact the original curve had), and one XP above
//     the threshold is at level L.

const BASE = 1000;
const MULT = 1.5;
const L10_XP = Math.floor(BASE * Math.pow(9, MULT)); // 27,000

// --- OLD curve (pre-27.3.5) ---
const oldLevel = (xp) => (xp < BASE ? 1 : Math.floor(Math.pow(xp / BASE, 1 / MULT)) + 1);

// --- NEW curve (27.3.5) ---
const newLevel = (xp) => {
  if (xp >= L10_XP) return Math.floor(Math.pow(xp / BASE, 1 / MULT)) + 1;
  if (xp < BASE / 2) return 1;
  return Math.min(9, Math.floor(Math.pow(xp / (BASE / 2), 1 / MULT)) + 1);
};
const newXPForLevel = (L) => {
  if (L <= 1) return 0;
  if (L < 10) return Math.floor((BASE * Math.pow(L - 1, MULT)) / 2);
  return Math.floor(BASE * Math.pow(L - 1, MULT));
};

let failures = 0;
const fail = (msg) => { console.error('FAIL:', msg); failures++; };

// 1 + 2: sweep a wide XP range.
for (let xp = 0; xp <= 700000; xp += 1) {
  const o = oldLevel(xp);
  const n = newLevel(xp);
  if (n < o) fail(`xp=${xp}: new level ${n} < old level ${o}`);
  if (xp >= L10_XP && n !== o) fail(`xp=${xp} (>=27000): new ${n} !== old ${o}`);
}

// 3: monotonicity + tolerant inverse (floored thresholds sit 1 XP low).
let prev = -1;
for (let L = 1; L <= 120; L++) {
  const threshold = newXPForLevel(L);
  if (threshold <= prev && L > 1) fail(`getXPForLevel(${L})=${threshold} not > previous ${prev}`);
  prev = threshold;
  const back = newLevel(threshold);
  if (back !== L && back !== L - 1) fail(`getXPForLevel(${L})=${threshold} maps back to level ${back} (expected ${L} or ${L - 1})`);
  // One XP past the (floored) threshold must be exactly level L.
  if (newLevel(threshold + 1) !== L) fail(`xp=${threshold + 1} (just past L${L} threshold) gives level ${newLevel(threshold + 1)}, expected ${L}`);
}

// Report a few example thresholds for eyeballing.
console.log('Example thresholds (XP to reach level):');
for (const L of [2, 3, 5, 9, 10, 11, 21, 41, 71]) {
  console.log(`  L${L}: new=${newXPForLevel(L)}  (old=${L <= 1 ? 0 : Math.floor(BASE * Math.pow(L - 1, MULT))})`);
}

if (failures === 0) {
  console.log('\nOK — no XP total maps to a lower level than before; L10+ unchanged; inverses consistent.');
  process.exit(0);
} else {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
}
