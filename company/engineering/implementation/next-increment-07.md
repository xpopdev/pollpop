# Next increment 07 — Docs sign-off §33 PASS

**Picked:** (a) docs sign-off file-based PARTIAL→PASS. Defers (b) WebFetch competitive re-verify (403-risk, INFERRED) and (c) Realtime 001_init.sql publication + live 2-tab probe (needs live writes) — costlier.

**Why:** 06 lean pass 11/17→12/17 but docs still PARTIAL; §33 needs arch/spec/runbook matching code (c2a6c77, CI 8d0d793 green, prod 5/5) before 7-day CTR. Cheapest P2, no infra.

**What to build:** Audit `architecture.md`, `product_spec.md`, `README.md` vs code: Next+Supabase+004 Storage+OG png-sharp+Realtime+5s fallback+HttpOnly x-vercel dedup; fix stale run steps, label VERIFIED/INFERRED/ESTIMATE. Confirm limitations list vote 3.6s>500ms FAIL, Realtime UNKNOWN, CTR/K ESTIMATE; keep competitor_watch INFERRED.

**Acceptance:** `quality-bar --docs` PASS; `npm run build` green; diff ≤3 docs; no code.

**Risk:** None reversible. **Estimate:** 20–30 min. **Out of scope:** VERIFIED pricing, RLS, live bench, CTR, chaos, CEO re-review.
