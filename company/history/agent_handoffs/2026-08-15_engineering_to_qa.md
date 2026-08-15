SOURCE AGENT: Engineering (backend + frontend + AI/ML + devops, led by engineering-manager)
TARGET AGENT: QA (qa-lead) + Security (security-engineer) + Growth (growth-analytics-manager) — next Phase B iteration

OBJECTIVE: Verify the dfdc8f0/a800d6f Phase B docs lean pass and the 5/5 prod verify (dgurls DNS fix + 005_color) before seeding 7-day CTR. Engineering just completed docs lean 07 (architecture + product_spec 12/17 docs pass) and security lean + metrics refresh (003/004 VERIFIED file + live INFERRED).

WHAT WE KNOW:
- Prod pollpop-five.vercel.app is 5/5 verify PASS (201 picsum 9pnqtv54, 201 data:→poll-images, GET poll 200 2 opts, metrics 200, OG png-sharp 200) after DNS typo fix (Vercel env prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM corrected to https://dgurlsguhkatnslzvfcy.supabase.co) and 005_color.sql (poll_options color text) applied via MCP.
- CI a800d6f was 12/17 docs pass, prior c2a6c77 12/17, 8d0d793 2.5/5 perf (burst 10/10 isolated PASS, vote 3.6-4.6s FAIL cold infra, OG PASS). Tests now 11 vitest + 2 e2e green on Vercel (mock webServer), local Termux shared storage EACCES not runnable.
- Design exact 56c2bcf parchment+clay (canvas #f0eee6, card #faf9f5 24px, clay #d97757), RLS 003 anon read/service write, 004 poll-images public, 002 RPC atomic, HttpOnly Secure + x-vercel-forwarded-for trust (6d9dff4).

EVIDENCE:
- company/company_state.md PHASE 3 BUILD quality-bar 11/17 after re-bench (was 10/17)
- company/product/architecture.md (004 Storage png-sharp nodejs + Realtime + HttpOnly per code 347f22c)
- company/product/product_spec.md Known limitations 12/17 honest (perf FAIL, Realtime UNKNOWN, CTR/K ESTIMATE, 5 fixes VERIFIED)
- company/research/competitor_watch.md INFERRED 400/451
- company/engineering/implementation/next-increment-07.md (docs sign-off, 128w)
- company/engineering/tests/qa-2026-08-15-continue.md (11 vitest +2 e2e green, live prod POST now 5/5 PASS)
- company/engineering/security/security-2026-08-15-lean.md (002/003/004 + CSP + rate fixed, security PARTIAL)
- company/metrics/product_metrics.md (004 VERIFIED file + live INFERRED, CTR/K ESTIMATE)
- app/supabase/migrations/005_color.sql, 004_storage.sql, 003_rls_tighten.sql, 002_vote_rpc.sql
- scripts/verify-06am.sh 5/5 PASS log (2026-08-15 06:09)

ASSUMPTIONS:
- Supabase dgurlsguhkatnslzvfcy remains ACTIVE_HEALTHY ap-southeast-2, bucket public true.
- Vercel prod env now has correct NEXT_PUBLIC_SUPABASE_URL + anon/service keys + IP_HASH_SALT (verified via prod 5/5, not via MCP list env vars which doesn't exist).
- Vote 3.6-4.6s is cold Vercel+Supabase infra, not code — will stay ESTIMATE until live 2-tab probe.
- 7-day CTR seeding (8 polls → 12-15 chats, CTR≥0.08 per approved.md) not yet run — still ESTIMATE.

DECISIONS:
- PollPop 003 WEAKEN→VALIDATE → human YES 2026-08-14 with kill CTR<0.03, 0.03-0.08 one retry, ≥0.08 PASS; binding 7-day.
- Design system now exact Anthropic parchment+clay (not INFERRED #FFFEFB) — committed 4927449+56c2bcf.
- RLS 003 tightening, 004 Storage, 005 color, 002 RPC all committed; prod 5/5 verify is the live proof.

OPEN QUESTIONS:
- Will 7-day CTR actually hit ≥0.08 in live 12-15 chats (not just fake-door human YES)?
- Vote latency <2s Realtime vs 5s fallback — what does live 2-tab probe show after atomic fix?
- Competitive live pricing (WebFetch still 400/451 INFERRED) — re-verify when fetch recovers?

FAILED APPROACHES:
- WebSearch 400 max_uses and WebFetch 403/451/haiku model error — all INFERRED fallback, logged per §29, not used for decisions.
- Termux shared storage npm install EACCES symlink (vitest: not found) — solved by CI Node 24 ubuntu (green on 8d0d793+).
- X cookies auth_token 401 Could not authenticate — manual X post for PollPop launch.
- Vercel 500 No outgoing requests before DNS fix — early throw before DB fetch due to dgurs typo, fixed via env correction.

FILES TO READ:
- company/company_state.md
- company/decisions/approved.md (binding CTR kill criteria)
- company/product/problem.md, users.md, requirements.md, product_spec.md, architecture.md, ux.md
- company/research/opportunity_map.md (10 candidates, 2 KILL 1 WEAKEN→VALIDATE), ceo_report_2026-08-14.md
- company/validation/seeding-plan-2026-08-15.md (8→12-15, CTR≥0.08)
- company/engineering/implementation/next-increment-07.md
- app/supabase/migrations/005_color.sql, 004_storage.sql, 003_rls_tighten.sql, 002_vote_rpc.sql
- scripts/verify-06am.sh, company/history/done_later.md (prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM)
- company/metrics/product_metrics.md, company/research/competitor_watch.md

EXPECTED OUTPUT:
- QA live probe after 06:00 manual: verify-06am.sh 5 curls again + Realtime 2-tab <2s + burst 50 atomic 10/10 with distinct x-vercel-forwarded-for.
- Security formal sign-off attempt (live anon POST probe for 003/004).
- Daily-report refresh + quality-bar re-score (expect still 11-12/17 until CTR seeding).

SUCCESS CRITERIA:
- All 5 verify curls 201/200 with poll-images URL and png-sharp, CTR/K still ESTIMATE but prod writes VERIFIED, CI test 11/11 + e2e 2/2 + build green, handoff written.
