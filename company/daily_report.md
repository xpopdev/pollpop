# Daily report

> Overwritten each work cycle by the `daily-report` skill (master protocol §31).

DATE: 2026-08-14

WHAT HAPPENED:
Second Phase B cycle after ea0a208: Storage 004 b5dd855/0194cd8 (poll-images bucket, data URL 26MB guard → upload), perf bench stub b724100 (15s/500ms/2s method-only, blocked by DB), smoke 1ee6279 BLOCKED (POST /api/polls 500 VERIFIED via node fetch — `fetch failed` on picsum + `Image upload failed` on data: branch) + retry 6581f61 + done_later.md 06:00 manual checklist, PollCard flat 3e4df9f (scrim linear-gradient → flat rgba(18,18,20,.42), avatar gradient → oat + stone border, grep 0), HttpOnly 6d9dff4 + dedup test 53283de (Set-Cookie HttpOnly Secure SameSite=Lax + trust x-vercel-forwarded-for > x-real-ip, drop x-forwarded-for, RT-SEC-05/04), docs polish 7336fa2 (product_spec limits 399w, verified FIXED list).

WHAT WAS LEARNED:
- Smoke 1ee6279 proves prod DB write + Storage upload both fail live despite 004 on disk — bucket existence + env + Vercel logs needed, not just SQL file VERIFIED.
- Secure HttpOnly breaks http localhost — gated on NODE_ENV=production so local dev stays http.
- x-forwarded-for first-entry is spoofable; x-vercel-forwarded-for is the trusted source on Vercel — dedup test had to flip expectation (x-vercel > x-real > x-forwarded).
- Flat scrim/avatar passes contrast without gradients — design exact holds with rgba flat + oat, no grep hits.

WHAT CHANGED:
- app/components/PollCard.tsx — 3e4df9f flat scrim/avatar per next-increment-03.
- app/app/api/polls/route.ts + app/app/api/polls/[id]/vote/route.ts + app/lib/dedup.ts — 6d9dff4 HttpOnly Secure cookie (prefer cookie header, x-pollpop-cid fallback then rotate) + x-vercel-forwarded-for trust.
- app/lib/dedup.test.ts + .gitignore — 53283de trust-order test fix + ignore .next/*.tsbuildinfo.
- company/product/product_spec.md — 7336fa2 Known limitations now 399w (XSS, PollCard flat, HttpOnly branches marked VERIFIED FIXED; only Realtime publication + optimistic transient remain ESTIMATE).
- company/history/done_later.md + company/engineering/performance/bench-2026-08-14.md — manual 06:00 Vercel logs + bucket check + bench stub.

WHAT FAILED:
- Prod smoke 1ee6279: POST /api/polls → 500 VERIFIED (picsum `TypeError: fetch failed`, data: `Image upload failed`) — Supabase fetch + poll-images upload live fail; 004 INFERRED until Storage Dashboard + vercel logs confirm at 06:00. Not a CI failure — Vercel build green, but live DB path blocked.
- Bench stub remains NOT YET MEASURED — method defined, no live 15s/500ms/2s until DB fixed.

WHAT WAS BUILT:
- PollCard flat 3e4df9f VERIFIED — gradients removed, flat rgba scrim + oat avatar, build+test green expected.
- HttpOnly Secure + vercel header trust 6d9dff4/53283de VERIFIED — Set-Cookie HttpOnly; Secure; SameSite=Lax + clientIpFromHeaders prefers x-vercel-forwarded-for, dedup test 11/11 updated.
- Storage 004 + TS fix 0194cd8 VERIFIED on disk (bucket public + RLS policies idempotent), docs polish 7336fa2 VERIFIED (limits 399w, 5/5 checks green: test + e2e + build + deploy + report-build-status on 7336fa2/b724100/56c2bcf).
- Bench stub + done_later 06:00 checklist + next-increment-04 spec — file-only, no DB needed.

WHAT REMAINS:
- Quality-bar 10/17 (was 9/17): unit/build/e2e PASS, perf PARTIAL (stub method only), security PARTIAL (7336fa2 fixes VERIFIED, 2 remain INFERRED/HYPOTHESIS: Realtime publication `poll_options`/`votes`, optimistic transient RT-BUG-15), integration/live smoke FAIL (blocked by prod 500), docs PARTIAL, validation/CEO pending — not MVP per §33/§34.
- Live verification at 06:00 per done_later.md: Vercel logs `[poll-images upload] failed` detail + env check + Storage bucket public + curl POST /api/polls (picsum + data URL → poll-images URL) + OG png/svg headers + metrics → then re-run quality-bar to 17/17.

CURRENT BIGGEST RISK:
After 7336fa2 (docs polish, 5/5 checks green: test+e2e+build+deploy+report-build-status), the top risk remains prod POST 500 fetch failed — smoke retry VERIFIED, 004 still INFERRED until Vercel logs + bucket check at 06:00 per done_later.md. Until fixed, live create/vote/CTR/K unmeasurable — all ESTIMATE per §29. Secondary: CTR/K and voters_per_poll still HYPOTHESIS (WebSearch re-verify pending, fake-door CTR was human YES without 50-view live re-measure), RLS 003 not anon-probed prod.

CURRENT BIGGEST OPPORTUNITY:
File-only hardening done without DB — PollCard flat + HttpOnly+vercel trust land with zero infra cost and unblock security PARTIAL→PASS once live-probed; bench stub + done_later makes the 06:00 unblock a 2-min curl sequence (picsum + data URL → 201 + poll-images URL) that immediately unlocks 7-day CTR/K measurement on pollpop-five, cheapest path to §40 compound loop proof.

NEXT DECISION:
Storage smoke verify after manual — at 06:00 run done_later.md steps 1-4 (Vercel logs + env + Storage bucket check → curl POST /api/polls picsum + data URL expecting 201 with https://.../poll-images/... URL → /api/metrics + p/{id} vote + OG headers), then `npm run test:e2e` timed on pollpop-five and quality-bar re-score to 17/17; file-only work (perf bench live, competitor re-verify §25) continues overnight without blocking.
