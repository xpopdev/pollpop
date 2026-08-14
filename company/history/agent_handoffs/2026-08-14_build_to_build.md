# Handoff — Phase 3 Build → Build — 2026-08-14

SOURCE AGENT: COO / Engineering (Phase 3 BUILD, 0194cd8)
TARGET AGENT: Engineering (next Phase B loop)

OBJECTIVE: Continue loop from green baseline; apply Storage 004, verify prod, perf bench → quality-bar → §40.

WHAT WE KNOW:
- 0194cd8 green: vitest 11/11 + e2e 2/2 + build + deploy. Prod pollpop-five live. Design exact 56c2bcf.
- Supabase dgurslguhkatnshlzvfcy: 001-003 applied; 004 poll-images bucket ready, not applied.
- X cookies .x_cookies.json gitignored; last tweet 401.

EVIDENCE:
- 0194cd8: TS implicit any fix; b5dd855: Storage data URL→bucket; 56c2bcf design; 53ad2e8 e2e enabled (mock webServer).
- Fixes: meta 2KB, CSP, CTA dismiss, grid 2×2, RLS 003 (anon read), OG nodejs SVG, 429 {code:RATE_LIMITED}.

ASSUMPTIONS:
- 004 applies cleanly in dashboard, fixes 26MB data URL risk.
- X cookies refresh restores post ability.

DECISIONS:
- Bucket upload over unbounded image_url text; RLS tightening; Anthropic parchment+clay; npm install not ci (Termux symlink).

OPEN QUESTIONS:
- Perf not benched (15s create/500ms vote/Realtime <2s); security sign-off pending; viral CTR/K still INFERRED.

FAILED APPROACHES:
- sharp in edge → node:crypto; npm ci --no-bin-links → missing bins; profanity includes('xxx') false positive.

FILES TO READ:
- company/company_state.md, company/daily_report.md, supabase/migrations/004*, company/history/audit_log.md, app/package.json

EXPECTED OUTPUT:
- Apply 004, anon probe, perf bench, daily-report + quality-bar update.

SUCCESS CRITERIA:
- Next build green; images in bucket; quality-bar >9/17; no regressions.
