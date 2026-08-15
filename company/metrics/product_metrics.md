# Product metrics

> §29 labels.

**Verify 2026-08-15 VERIFIED:** `verify-06am.sh` 5/5 PASS — POST picsum 201, POST data: 201 →poll-images, GET poll 200 (2 options), GET metrics 200 totals, GET og 200 png-sharp + x-pollpop-og.

**Instrumentation VERIFIED:** File `getMetrics`/`recordEvent` works (fallback `.pollpop-mock.json`; prod Supabase `dgurslguhkatnshlzvfcy` on `pollpop-five.vercel.app`).

**Live CTR/K ESTIMATE:** CTR `cta_click/poll_view` ≥0.08 and K `polls_via_cta/poll_view` paired w/ retention — both ESTIMATE until seeding-plan 7-day (8 polls→12-15 chats) yields ≥50 poll_view, then ESTIMATE→VERIFIED. Referred retention 7d HYPOTHESIS.

**Docs:** Architecture 004 Storage + OG png-sharp + Realtime + HttpOnly VERIFIED per code 347f22c; competitive INFERRED per competitor_watch.md.
