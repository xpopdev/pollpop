# Product metrics

> §29 labels. Prod POST 500 VERIFIED block until 06:00 manual (Vercel env + `poll-images` bucket per `done_later.md` §1–2). File instrumentation VERIFIED (`app/lib/store.ts:getMetrics`/`recordEvent`, `004_storage.sql` on disk, 11 vitest + 2 e2e green on CI, `4c54264` `scripts/verify-06am.sh` ready).

**Infra:** Prod `pollpop-five.vercel.app` → Supabase `dgurslguhkatnshlzvfcy` (events); file fallback `.pollpop-mock.json`.

**Binding (P0-6):**
- CTR `cta_click / poll_view` — ESTIMATE, ≥0.08 PASS; <50 views no verdict.
- K `polls_via_cta / poll_view` — ESTIMATE, paired w/ retention.
- Referred retention 2nd poll in 7d — ESTIMATE (HYPOTHESIS).

**Next:** 5 curls `scripts/verify-06am.sh` must pass live before ESTIMATE→VERIFIED; `competitor_watch.md` INFERRED until WebFetch recovers §25; then 7-day run to 50+ poll_views.
