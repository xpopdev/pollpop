# Handoff — Phase 3 Build → Continuous — 2026-08-14 06:00

SOURCE AGENT: Engineering+QA (a1a9cc6)
TARGET AGENT: Engineering/QA at 06:00 after Vercel logs + bucket check (fresh session)

OBJECTIVE: Verify 004 Storage live via scripts/verify-06am.sh 5 curls, then timed perf bench live → quality-bar → §40.

WHAT WE KNOW: CI a1a9cc6 green (~16 tests: 11 vitest + 5 Storage mock/6MB/mime/validation). Prior f316494/a5f398e/56c2bcf green (design exact, RLS 003, 004_storage.sql on disk poll-images public+anon read/service write). Live POST /api/polls 500 VERIFIED (picsum fetch failed, data: Image upload failed) — blocked on manual done_later.md 1-3.

EVIDENCE: a1a9cc6 storage.test.ts (mock data URL→poll, >6MB 400, non-image 400, invalid 400, upload→poll-images URL); 4c54264 verify-06am.sh (5 curls); f316494 5/5 green; 6d9dff4 HttpOnly+x-vercel-forwarded-for; 3e4df9f PollCard flat.

ASSUMPTIONS: Vercel env (SUPABASE_URL/ANON/SERVICE_ROLE/IP_HASH_SALT/APP_URL) correct after Dashboard prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM; bucket public=true fixes getPublicUrl; 004 idempotent.

DECISIONS: Bucket upload over data URL (6MB guard + mime validation); service_role write; mock tests file-based (no live Supabase); parchment+clay.

OPEN QUESTIONS: Perf 15s create/500ms vote/Realtime <2s not yet live-measured; Realtime+poll fallback ESTIMATE; CTR/K HYPOTHESIS until re-measure.

FAILED APPROACHES: sharp edge→node:crypto; npm ci symlink; profanity includes false positive; live 500 needs dashboard (1ee6279/6581f61).

FILES TO READ: company/company_state.md, company/history/done_later.md, scripts/verify-06am.sh, app/supabase/migrations/004_storage.sql, app/app/api/polls/storage.test.ts, company/history/audit_log.md

EXPECTED OUTPUT: Do done_later.md 1-3 (Vercel env/logs + Storage public), run ./scripts/verify-06am.sh 5 PASS (201 poll-images URL, 200s), timed perf bench on pollpop-five (create/vote/Realtime), then quality-bar + daily-report.

SUCCESS CRITERIA: 5 curls PASS (picsum 201, data:→poll-images URL, GET poll/metrics/og 200), images in bucket, ~16 tests stay green, live perf measured, quality-bar 10→12/17+.
