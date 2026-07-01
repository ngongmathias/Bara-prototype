# BARA Afrika — Rewards & Gamification: The Complete Guide

> Audience: the BARA team. Purpose: understand exactly how XP, Levels, Bara Coins,
> streaks, missions, achievements and the spin wheel work today — then a plan to
> explore options and a prioritised list of improvements.
>
> Source of truth in code: `src/lib/gamificationService.ts` (the engine),
> `src/hooks/useGamification.ts`, `src/components/gamification/*`, and the
> `gamification_*` Supabase tables. Status of product decisions: see
> `[[project_economy_decisions]]` and MASTER_PLAN Phase 26.9.

---

## 1. The big picture (the loop)

BARA rewards people for being active across the whole platform (music, marketplace,
events, blog, sports). Activity earns **XP** (status) and **Bara Coins** (a
spendable token). XP raises your **Level** and **Prestige tier** (Explorer →
Diamond). Coins are spent on perks (ad-free, boosts, themes). **Streaks** (logging
in daily) apply an XP **multiplier**. **Daily missions**, **achievements** and a
**daily spin wheel** add bite-sized goals and surprise rewards.

```
   Do something on BARA ──► earn XP (+ sometimes Coins)
        │                         │
        │                         ├─► XP raises Level → Prestige tier (status)
        │                         └─► Coins go to your balance (spendable)
        ▼
   Daily login ──► streak +1 ──► XP multiplier (up to 2×) ──► +50 XP bonus
   Daily missions / achievements / spin wheel ──► extra XP + Coins
```

---

## 2. The three "currencies"

| Currency | What it is | Earn | Use | Status |
|---|---|---|---|---|
| **XP** | Status/progression only. Drives Level & Prestige. | Almost every action (see §4) | Nothing — pure rank | ✅ working |
| **Bara Coins** | The spendable token. | Level-ups, blog, missions, achievements, spin wheel, admin grants | Ad-free, boosts, themes (song purchases **deferred**) | ✅ working as a closed reward loop |
| **Trust Rank** | A reputation number. | Mission `reputation_reward` (rare) | **Nothing** — never used | ⚠️ removed from the UI (vestigial) |

---

## 3. Levels & Prestige (the maths)

**Formulas** (`gamificationService.ts`): base `1000`, exponent `1.5`.
- XP needed to *reach* a level: `getXPForLevel(L) = floor(1000 × (L−1)^1.5)`
- Level from XP: `calculateLevel(xp) = floor((xp/1000)^(1/1.5)) + 1`

**Example thresholds** (cumulative XP needed):

| Level | XP needed | Prestige tier |
|---|---|---|
| 1 | 0 | **Explorer** (1–10) |
| 2 | 1,000 | Explorer |
| 5 | 8,000 | Explorer |
| 10 | 27,000 | Explorer |
| 11 | 31,623 | **Bronze** (11–20) |
| 21 | 89,443 | **Silver** (21–40) |
| 41 | 252,982 | **Gold** (41–70) |
| 71 | 585,662 | **Diamond** (71+) |

Each level-up also pays a **coin bonus = newLevel × 10** (e.g. reaching L12 pays 120 coins).
Prestige tier is purely cosmetic/status today (shown on the profile/leaderboard).

**Intuition:** at +10 XP per song, Level 2 ≈ 100 songs; the curve steepens fast, so
levels are mostly driven by the *daily* sources (login bonus, missions, spin) for
casual users.

---

## 4. How you EARN

### XP sources (with the streak multiplier applied)
| Action | XP | Where (file) |
|---|---|---|
| Listen to a song (≥30s, once per song) | **10** | `AudioPlayerContext` |
| Daily login / streak bonus | **50** | `GamificationService.checkDailyStreak` |
| Create a playlist | **100** | `StreamsSidebar` |
| Post a marketplace listing | **200** | `PostListing` |
| Register for an event (ticket) | **500** | `TicketPurchaseModal` |
| Upload an event photo (each) | **25** | `EventGalleryUpload` |
| Blog article published | **150** | `AdminBlog` (on approval) |
| Daily spin wheel (XP segments) | 10–100 | `DailySpinWheel` |
| Mission claim / achievement | varies | service |
| Level-up | — (pays coins, not XP) | service |

> All XP is multiplied by the streak **multiplier** (1×–2×) before it's added.

### Coin sources
| Source | Coins |
|---|---|
| Starting balance (new profile) | **100** |
| Level-up bonus | level × 10 |
| Blog published | +25 |
| Spin wheel (coin segments) | 5–50 (avg ≈ **6.25/day**) |
| Missions / achievements (coin_reward) | varies |
| Admin grant (god-mode) | any |

### Streaks & the multiplier (`checkDailyStreak`)
- Runs on app load when signed in. Compares today's date to `last_activity_at`.
- Same day → no change. Next calendar day → streak **+1**. Gap → resets to **1**.
- Multiplier tiers: **3+ days = 1.2×, 7+ = 1.5×, 30+ = 2.0×** (applied to all XP).
- On a new streak day it also pays the **+50 XP** login bonus and progresses the
  `daily_login` mission. Streak is stored in both `consecutive_days` and
  `daily_streak` (kept in sync; Header/Leaderboard read `daily_streak`).

### Daily Spin Wheel (`DailySpinWheel`)
- One spin per calendar day (checked via a `gamification_history` row with reason
  `Daily Spin Wheel`). Weighted segments:

| Prize | Probability |
|---|---|
| 5 Coins | 30% |
| 10 XP | 25% |
| 10 Coins | 20% |
| 25 XP | 12% |
| 25 Coins | 8% |
| 50 XP | 3% |
| 50 Coins | 1.5% |
| 100 XP | 0.5% |

Expected value ≈ **6.25 coins** or some XP per spin.

**Net for an active daily user:** ~+50 XP (login) + spin + missions ≈ **150–300 XP**
and **~15–30 coins** per day before one-off actions.

---

## 5. How you SPEND coins (the sinks)
| Sink | Cost | File |
|---|---|---|
| Ad-free browsing (24h) | 20 | `useAdFree` |
| Marketplace listing boost | 50 | `PostListing` |
| Track boost (Creator Portal) | 50 | `ArtistDashboard` |
| Profile themes | per theme | `useProfileTheme` |
| Sports prediction bets | wager | `SportsPredictions` — **paused** |
| Song purchases | song price | `AudioPlayerContext` — **deferred** |
| Coin top-up store (buy coins) | $1.99–$24.99 | `CoinStorePage` — **disabled** |

---

## 6. Missions (daily goals)
- Defined in the `missions` table; per-user progress in `user_missions`.
- **Seeded daily missions:** `daily_login` (1), `daily_listen` (listen to 5 songs),
  `daily_market_view` (view 10 listings), `daily_social_share` (share 1),
  `event_photo_upload` (upload 3 photos). Each gives XP + a few coins (+ small
  reputation) on **claim**.
- Progress is tracked by `trackMissionProgress(userId, key, +n)` sprinkled across the
  app (e.g. the player calls `daily_listen`, marketplace detail pages call
  `daily_market_view` / `daily_social_share`).
- Daily missions **reset** once per day via the `reset_daily_missions_for_user` RPC.
- Completing a mission fires a `bara_mission_completed` event (UI celebration);
  the user then **claims** to actually receive the reward (`claimMissionReward`).

---

## 7. Achievements (one-off badges)
- Master list in `achievements`; earned rows in `user_achievements`.
- **Defined (≈13):** early_adopter, first_listen/music_lover, playlist_creator,
  market_entry/first_purchase, event_goer/event_host/event_explorer, top_seller,
  prolific_writer, streak_7, streak_30.
- **Actually awarded in code (only 3):** `playlist_creator` (create playlist),
  `market_entry` (post listing), `event_goer` (buy ticket). On award: celebration
  event + XP + coins.
- ⚠️ **The rest are defined but never granted** (music_lover, streak_7/30,
  top_seller, prolific_writer, first_purchase, event_host, etc.). They show as
  "locked" forever today. (See Improvements.)

---

## 8. Data model (Supabase)
- `gamification_profiles` — one row per user: `total_xp, current_level, bara_coins,
  daily_streak, consecutive_days, multiplier, trust_rank, last_activity_at`. (user_id
  migrated to **TEXT** for Clerk ids; RLS opened for the tokenless client.)
- `missions` / `user_missions` — mission defs and per-user progress/claims.
- `achievements` / `user_achievements` — badge defs and earned badges.
- `gamification_history` — audit log of every `xp_gain` / `coin_gain` / `coin_spend`
  with `reason` (also powers spin-eligibility and the admin transaction view).

---

## 9. Where it shows up in the product
- **Header** — coins + streak.
- **Streams sidebar** — `XPProgressBar` (level + XP-to-next).
- **`GamificationPage`** (`/gamification`) — the user hub (level, coins, missions,
  achievements, history).
- **`LeaderboardPage`** — ranks users by XP/level/streak.
- **Floating feedback** — `GlobalGamification` listens for `bara_xp_gain`,
  `bara_coin_gain`, `bara_achievement_earned`, `bara_mission_completed` and shows
  toasts/animations.
- **Admin** — `AdminGamification` (manage missions/achievements), and
  `AdminUsers` "Economy God-Mode" to override a user's coin balance.

---

## 10. Current product decisions (from the Jun-23 deep-dive)
- **Bara Coin = hybrid** target (free to earn + cash-bought later); for now no real
  money flows in.
- **Paid music deferred** — all songs free; price/purchase hidden behind
  `PAID_MUSIC_ENABLED` (`src/lib/features.ts`).
- **Trust Rank removed** from the UI.
- **Sports betting paused** behind `SPORTS_BETTING_ENABLED`.
- **Coin top-up store disabled** ("under maintenance").

---

## 11. Known issues & inconsistencies (the "fix" list)
1. **🔴 Security — coins/XP are client-mutated with open RLS.** The browser writes
   balances directly via the anon client, so a user can grant themselves coins by
   calling the API. Low-stakes while coins buy only farmable perks, but it **must**
   move to a server-side Edge Function / RPC before coins carry real cash value.
   *(Still open — needs a coordinated deployment; see §12 Phase B.)*
2. ~~**Streak stuck at 1**~~ ✅ **Fixed** — used UTC days + no null guard; now uses the
   user's local calendar days and is defensive. (Streaks increment once per day.)
3. ~~**No anti-abuse on listen-XP**~~ ✅ **Fixed** — `awardSongListenXP` caps listen-XP
   at 50 songs/day.
4. **Unearnable achievements** — ✅ mostly fixed: `first_listen`, `streak_7`,
   `streak_30`, `music_lover` (1,000 listens), `first_purchase`, `event_host` and
   `early_adopter` (granted on first profile creation) are now wired. Still unwired:
   `top_seller` (10 sales), `prolific_writer` (10 blogs), `event_explorer` (10 events)
   — count-based, need the sale-complete / blog-count / event-save flows.
5. ~~**No weekly layer**~~ 🟡 improved — a **"Your last 7 days" recap** now shows on the
   Rewards hub (`getWeeklyRecap`). Still missing: weekly *missions*, seasons,
   leaderboard resets, and a push/notification recap.
6. **Trust Rank is dead weight** — pick a purpose or remove the column.
7. **Mission/achievement key drift** — keep the code's award keys and the seed in
   lockstep (e.g. `market_entry` vs `first_purchase`).
8. **Coin economy has no anchor** — with the store disabled, coins only inflate;
   nothing defines what 1 coin is worth (decide in Phase A). 🟡 Coins now have a
   working, discoverable sink: **Ad-Free** is purchasable inline on the Coin Store.
9. **No "How rewards work" for users** — ✅ **Fixed** — `/rewards` explains it.

---

## 12. A plan to explore the options (phased)

**Phase A — Define & document (this doc).** Agree what each currency is *for*.
Decision checklist:
- What does **1 Bara Coin** represent? (reward token vs cash-backed)
- What should **Trust Rank** do, if anything? (seller reputation? remove?)
- What is the **headline behaviour** we want to drive? (daily listening? marketplace
  activity? referrals?)
- Which **achievements** matter, and what triggers each?

**Phase B — Harden & make honest (no new economy).** Server-side coin/XP mutations
(Edge Function + RLS lockdown), wire up the unearned achievements, fix key drift,
add basic anti-farm caps. *This is the real "fix" and is prerequisite to anything
with money.*

**Phase C — Depth.** Weekly missions + weekly recap/"Wrapped", seasons/leaderboard
resets, a clear **coin store of perks** with sensible prices, referral rewards.

**Phase D — Monetisation (only after B).** Stripe top-ups via a secure webhook,
cash-backed coins, and (if desired) re-enable paid music + creator payouts.

---

## 13. Improvement recommendations (prioritised)

**Now (high value, low risk):**
- Wire the **streak achievements** (`streak_7`, `streak_30`) into `checkDailyStreak`
  and the **music_lover** (1,000 listens) / **first_purchase** etc. into their flows —
  instant wins; users already "earned" them.
- Add a tiny **daily XP cap on passive listening** to curb farming.
- Surface a clear **"How rewards work"** page for users (this guide, simplified).

**Next (needs a short build):**
- **Server-side coin/XP** (Edge Function) + lock RLS — the security fix.
- **Weekly recap** ("Your week on BARA") — the single best retention feature.
- A real **Perks store** (define the catalogue + prices) to give coins meaning.

**Later (product calls):**
- Decide Trust Rank's fate; decide cash-backed coins + payouts; referral program;
  seasons.

---

*Keep this guide updated as the economy evolves. Pair with `STREAMS_STANDARD.md`
(music) and MASTER_PLAN Phase 26.9.*
