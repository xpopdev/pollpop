# Next increment 06 — Docs lean pass (technical-writer)

**Picked:** (a) docs lean pass. Defers (b) WebFetch competitive re-verify (still 403-risk, §25 stays INFERRED) and (c) live Realtime 2-tab probe / vote <500ms bench (needs prod writes per done_later.md + 7-day CTR ESTIMATE). Pure file-based, moves quality-bar docs unchecked→checked 11/17→12/17.

**Why:** QA re-bench 8d0d793: docs unchecked while code is 5/5 prod verify PASS; cheapest §33 flip before seeding.

**What to build**
- `company/product/architecture.md` — confirm stack (Next+Supabase+Storage 004 + OG png-sharp + Realtime+5s fallback) + dedup HttpOnly plan from 04.
- `company/product/limitations.md` (or `product_spec.md` §) — list ESTIMATEs: vote 3.6s >500ms, Realtime UNKNOWN, CTR/K ESTIMATE until 7-day seed.
- `company/research/competitor_watch.md` keep INFERRED line per 05 (no WebFetch).

**Acceptance:** `quality-bar --docs` passes; no code change; `npm run build` green; diff ≤3 files.

**Risk:** None — docs-only, reversible. **Estimate:** 30–45 min. **Out of scope:** RLS/Storage code, live bench, 7-day CTR.
