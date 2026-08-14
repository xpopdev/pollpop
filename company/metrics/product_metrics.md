# Product metrics

> §29 labels. f95878d VERIFIED green 5/5 checks: test 11/11 + e2e 2/2 + build + deploy + report (mock webServer). File instrumentation VERIFIED (`app/lib/store.ts:getMetrics`/`recordEvent`, `004_storage.sql` on disk, `scripts/verify-06am.sh` ready). Prod POST 500 block VERIFIED until 06:00 manual (Vercel env + `poll-images` bucket per `done_later.md` §1–2) — live CTR/K remain ESTIMATE until `scripts/verify-06am.sh` 5 curls pass.

**Infra:** Prod `pollpop-five.vercel.app` → Supabase `dgurslguhkatnshlzvfcy`; fallback `.pollpop-mock.json`.

**Binding (P0-6):**
- CTR `cta_click / poll_view` — ESTIMATE ≥0.08 PASS; <50 views no verdict.
- K `polls_via_cta / poll_view` — ESTIMATE paired w/ retention.
- Referred retention 2nd poll 7d — ESTIMATE (HYPOTHESIS).

**Next:** 5 curls live → ESTIMATE→VERIFIED; `competitor_watch.md` INFERRED until WebFetch recovers §25; then 7-day run to 50+ poll_views.
