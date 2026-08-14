# Daily report

> Overwritten each work cycle by the `daily-report` skill (master protocol §31).

DATE: 2026-08-14

WHAT HAPPENED:
Validated PollPop (H-001 CTR≥0.08 PASS per human YES) → approved.md moves to PHASE 3 BUILD. Scaffolded Supabase MVP app/ (Next.js 14 App Router + Supabase mock fallback, project dgurslguhkatnshlzvfcy) + fake-door pollpop-validation/ (8 polls, p/{id}.html OG, metrics.html). Provisioned GitHub xpopdev/pollpop + Vercel pollpop-five.vercel.app prod + Supabase 001_init + 002 vote RPC + 003 RLS tightening (anon read, service_role writes). Wrote harness: 11 vitest (store/dedup/analytics/route) + 2 playwright e2e (create→vote→CTA + OG meta, mock webServer). Applied exact Anthropic design per user spec (4927449+56c2bcf: canvas #f0eee6 parchment, card #faf9f5 24px, manilla #f5e3c7, stone #cccbc8 hairlines, single clay #d97757→#c6613f CTA, body serif 20px). Fixed red-team 6 Critical/13 High in batches (atomic persist tmp+rename, orphan delete, 5/hr create + 10/poll IP caps, 500→generic, label slice, sharp edge→nodejs SVG, word-boundary profanity, rate code RATE_LIMITED, cache must-revalidate, CSP, meta 2KB cap, Realtime removeChannel, CTA dismiss, grid 2×2, XSS ' escape).

WHAT WAS LEARNED:
- WebSearch/WebFetch systematically down (400 max_uses / 451 / haiku) → all competitive pricing INFERRED per §29, footers added, must re-verify live before cost model.
- Shared storage /storage/emulated/0 cannot symlink .bin/* → vitest: not found, playwright EACCES; internal /data/... works but CI Node 24 ubuntu is the reliable runner.
- `X.repeat(80)` contains `xxx` substring → tripped profanity `includes('xxx')` → fixed to `\bxxx\b` word-boundary.
- `sharp` dynamic import in `runtime="edge"` bundles `node:crypto` → webpack UnhandledSchemeError → fixed to nodejs runtime or SVG-only edge fallback.
- `npm ci` fails when lockfile generated with --no-bin-links (missing which/rimraf) → switched to `npm install` + committed app/package-lock.json → then `code: string` TS error on 400 returns → fixed to `code?: string`.
- E2E was `if: false` skipped → enabled 53ad2e8 with PLAYWRIGHT_BASE_URL localhost, now 2/2 green on 56c2bcf via webServer mock.

WHAT CHANGED:
- Design system rewritten from INFERRED warm cream (#FFFEFB/#DA7756 pill) to EXACT Anthropic parchment+clay (11 tokens, 24px cards, bottom-8px ivory buttons, serif body, no shadows/gradients) — app/app/globals.css + tailwind.config.js + 6 components + page hero + PollClient surfaces.
- CI workflow test.yml: Node 20→24, defaults:working-directory app, e2e enabled, npm install + vitest + build + playwright install.
- .gitignore: .env/.env.local + app/.pollpop-mock.json + tsbuildinfo; .claude/settings.json attribution disabled (only xpopdev contributor).
- .env keys stored gitignored (anon/service_role/publishable/secret + IP_HASH_SALT) for dgurslguhkatnshlzvfcy.

WHAT FAILED:
- Initial unit test 1/11 failed (profane xxx), initial builds 3× failed (sharp edge, lockfile sync, TS code optional), CI 99e879a/1294b3a prior successes then 7d21afd/e15a09e build fails — all fixed and now CI 56c2bcf test success + e2e success + build success + pages success + check-runs e2e success (5/5 green).
- Termux `npm install` on shared storage repeatedly EACCES symlink + `su` loses npm PATH — not a code bug, env limitation; solved by CI.

WHAT WAS BUILT:
- pollpop-validation/ + docs/ static fake-door (no backend, localStorage analytics, 8 poll shapes) — xpopdev.github.io/pollpop
- app/ MVP: create (15s, 2-4 images), vote soft dedup (cookie+IP, last-wins), live bars + 5s poll fallback + Realtime, share p/{id} with OG SVG edge (PNG P1), sticky CTA ?ref=poll_ with cta_view/click, metrics /metrics (CTR/K/referred), supabase/migrations 001-003, OG nodejs route, components.
- Test harness committed: vitest 11 + playwright 2 + 003 RLS + hardening fixes through 7d21afd.

WHAT REMAINS:
- Quality-bar 9/17 PASS (was 8/17): unit/build/e2e now PASS (56c2bcf 4/4 test files + 2 e2e), but integration (live Supabase burst 50 + Realtime <2s), security formal sign-off (2 Critical still open per red-team), performance (15s/500ms/2s not benched), failure modes chaos, docs (technical-writer), validation results pending (fake-door 7d CTR not seeded), CEO re-review pending — not MVP per §33/§34. Next increments: Storage poll-images bucket upload (fix data URL 26MB guard), perf bench, remaining Low polish → re-score → §40 continuous improvement when all 17 genuinely checked, milestone in history/milestones/.

CURRENT BIGGEST RISK:
Competitive pricing and viral CTR remain INFERRED/HYPOTHESIS (no live re-verify, WebSearch down, fake-door CTR PASS was human YES without 50-view live CTR re-measure). Voters_per_poll and unfurl suppression still HYPOTHESIS. RLS 003 tightened but not prod-verified via anon PostgREST probe.

CURRENT BIGGEST OPPORTUNITY:
E2E now green (was skipped→2 passed 14.5s) and design exact makes prod pitchable; mock fallback means zero-config local dev while Supabase prod is ready — next 7-day live CTR/K can be measured on pollpop-five once seeded, cheapest path to compound loop proof before Storage/perf.

NEXT DECISION:
Next Phase B slice: Storage upload path (fix 26MB data URL → bucket presign, enforce 2048 cap) vs perf bench (15s create, 500ms vote, Realtime <2s) — engineering-manager already planned e2e enable (now done), next pick is Storage (unbounded image_url text is the prod data-risk). No Level 3 spend beyond Vercel/Supabase free tier; no human blocking credential needed.

