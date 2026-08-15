# Perf Bench — 2026-08-15 LIVE RE-BENCH (prod 347f22c)

> Probe `https://pollpop-five.vercel.app` 07:14 UTC, 347f22c RPC-only `increment_vote` (no `update({})`), Supabase 002/004/005. `urllib`, honest §34.

| Target | Budget | Measured VERIFIED | Status |
|---|---|---|---|
| Create poll `POST /api/polls` picsum×2 | ≤15s | **2724–5300ms** 201 (`eypks9s3` 5300, `2cq3c0b9` 2949) | **PASS** |
| Vote `POST /:id/vote` + `GET` | <500ms / <1.5s | **POST 3638–4687ms** (4687, 3638), GET 2748/2275ms durable 1,0 | **FAIL** POST >1.5s |
| Realtime poll channel + 5s fallback | <2s /5s | UNKNOWN — no 2-tab; code `store.ts` 5s fallback | ESTIMATE |
| Burst 10 `Promise.all` distinct voters | exactly 10 | Same IP: wall 6337ms POST 4025–6283ms GET `1,0` total1 (10/poll/IP/24h cap: single+10→11). Distinct `x-vercel-forwarded-for` 198.51.100.20-29: wall 6658ms POST 3051–6610ms **GET `10,0` total10**, +3s still 10 | **PASS isolated / FAIL same-IP** — RPC fixed prior 0,0 lost |
| OG `GET /:id/og` | 3600 png | **200** `image/png` 67965B `max-age=3600` `x-pollpop-og: png-sharp` 1839/1872ms | **PASS** |

**Summary 2.5/5 PASS.** Burst now exactly 10 vs prior 0,0 — `update({})` no-op fixed; verified `2cq3c0b9` 10/10 durable. Same-IP burst fails by rate limit, not atomic loss. Vote latency still >3s. `bj4ryv0s` healed 6,5 total11. Metrics stale `votes:24 polls:5` — ESTIMATE.
