# Handoff — Phase 3 Build → Continuous — 2026-08-14 06:00

SOURCE AGENT: Engineering+QA (a5f398e/4c54264)
TARGET AGENT: Engineering/QA at 06:00 after Vercel log + bucket check (fresh session)

OBJECTIVE: Verify 004 Storage live via scripts/verify-06am.sh 5 curls, then perf bench live → quality-bar → §40.

WHAT WE KNOW: CI a5f398e green all 5 (test 11/11, e2e 2/2, build, deploy, report-build-status). Design exact 56c2bcf. 004_storage.sql on disk (poll-images public bucket + RLS anon read/service write) but live POST /api/polls 500 VERIFIED (picsum fetch failed, data: Image upload failed). Blocked on manual per company/history/done_later.md steps 1-3.

EVIDENCE: 4c54264 verify-06am.sh (5 curls), 7336fa2 docs 399w, 6d9dff4 HttpOnly Secure + x-vercel-forwarded-for, 3e4df9f PollCard flat, 0194cd8/b5dd855 Storage, 003 RLS.

ASSUMPTIONS: Vercel env (SUPABASE_URL/ANON/SERVICE_ROLE/IP_HASH_SALT/APP_URL) correct after Dashboard check; bucket public=true fixes getPublicUrl; 004 idempotent applies cleanly.

DECISIONS: Bucket upload over unbounded data URL (26MB guard); service_role write; npm install not ci (Termux symlink); parchment+clay.

OPEN QUESTIONS: Perf 15s create/500ms vote/Realtime <2s not yet measured live; Realtime publication + optimistic transient ESTIMATE; CTR/K HYPOTHESIS until live re-measure.

FAILED APPROACHES: sharp in edge→node:crypto; npm ci --no-bin-links missing bins; profanity includes('xxx') false positive; live 500 not fixable without dashboard (1ee6279/6581f61).

FILES TO READ: company/company_state.md, company/history/done_later.md, scripts/verify-06am.sh, company/daily_report.md, app/supabase/migrations/004_storage.sql, company/history/audit_log.md

EXPECTED OUTPUT: Do done_later.md 1-3 (Vercel env/logs prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM + Storage public), then ./scripts/verify-06am.sh 5 PASS (201 poll-images URL, 200s), timed perf bench on pollpop-five, quality-bar + daily-report update.

SUCCESS CRITERIA: 5 curls PASS (picsum 201, data: → poll-images URL, GET poll/metrics/og 200), images in bucket, no regressions, quality-bar 10→12/17+.
