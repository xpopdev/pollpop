# Perf Bench — 2026-08-15 — PollPop §33 — LIVE (prod 1da4b68)

> Live probe `https://pollpop-five.vercel.app` 03:39-03:42 UTC via `urllib` (no block). Honest per §34.

| Target | Method | Budget | Measured | Status |
|---|---|---|---|---|
| Create poll | `POST /api/polls` picsum×2 `Date.now()` | ≤15s | **3783ms** `201 id=bj4ryv0s` VERIFIED | **PASS** — API only; full Playwright 4G landing→share not measured → ESTIMATE |
| Vote optimistic / confirmed | `POST /:id/vote` + `GET /:id` timed | <500ms / <1.5s | **3125–5260ms** POST (4920 single, 3344–5260 burst 10, 3125 second), GET 454–549ms | **FAIL** — POST >1.5s; GET fast but stale |
| Realtime | `poll:{id}` Realtime + 5s polling fallback | <2s / 5s | **UNKNOWN** — no 2-tab live; code verified `store.ts` 5s poll fallback | **ESTIMATE** |
| Burst 10 concurrent | `Promise.all` 10 POST distinct `x-pollpop-cid` | exactly 10 | **FAIL** — wall 5358ms, POST `total:11` but `GET bj4ryv0s 0,0` lost; `gz89b3lx` POST `1,1 total2` but GET `1,0` | **FAIL** — `atomicIncrement` empty `update({})` fallback |
| OG edge cache | `GET /:id/og` headers | 3600 `x-pollpop-og` | **200** `png` 63823B `Cache-Control: public, max-age=3600` `x-pollpop-og: png-sharp` MISS 662ms HIT 259ms | **PASS** |

**Summary:** 2/5 PASS (create, OG), 3/5 FAIL/UNKNOWN. Vote latency Vercel+Supabase >3s exceeds budgets. Burst not durable. Metrics stale (`votes:0 polls:2` after creates). Realtime UNKNOWN.

**Next:** Fix `store.ts` `atomicIncrement` to `votes=votes+1` single UPDATE + RPC migration, re-bench vote/burst 50.
