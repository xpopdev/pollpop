# Product metrics

> Tracked per §22. All values ESTIMATE per §29 until live 7-day measurement — do not cite as VERIFIED.

**Infra:** Prod `pollpop-five.vercel.app` → Supabase `dgurslguhkatnshlzvfcy` (events table). CI `50fe5d4` green (vitest 11/11 + build) enables live measurement. Instrumentation per `company/product/requirements.md` P0-6 and `app/lib/store.ts:getMetrics()`.

**Binding (P0-6):**
- CTR `cta_click / poll_view` — ESTIMATE (fake-door was INFERRED; live events exist but <50 poll_views, no verdict). Threshold ≥0.08 PASS per `decisions/approved.md`.
- K-factor `polls_created_via_cta / poll_view` — ESTIMATE; paired with referred retention.
- Referred retention `referred_creators_with_2nd_poll_in_7d / referred_creators` — ESTIMATE (HYPOTHESIS).

**Next:** 7-day live run to 50+ poll_views; check `company/research/competitor_watch.md` next cycle (§25).
