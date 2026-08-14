# PollPop — One-Page PRD Summary

> PASS 2026-08-14 — H-001 CTR≥0.08 validated via human PASS. Supersedes DRAFT. Build underway per `company/decisions/approved.md` + `company_state.md` PHASE 3. All §29 ESTIMATE/HYPOTHESIS labels remain until live CTR/K re-measured at scale.

**One-liner:** 15-second visual polls (2–4 images + title) with a share link that unfurls beautifully — every voter sees a sticky "Create your own — 15s" CTA that is the product's viral loop.

## Problem & gap

Instagram Stories polls are ephemeral/binary/locked; Strawpoll is ugly/text-only with no acquisition. Neither converts voters → creators. Frequency 9/10 job ("which one?" daily) has no cross-platform visual home. Gap = voter→creator CTA per `company/research/competitors/instagram_polls.md`; CTR HYPOTHESIS until H-001 resolves.

## User

Primary 16–35 social/group decision-maker (outfit, food, thumbnail, sneaker, room, travel) who needs a tally in 15s via a link dropped in any chat. Secondary: small teams/classrooms 3–15 picking visual options async. Anti-targets: enterprise boards, video challenge chains, authenticated elections.

## Viral mechanism (falsifiable)

Participation-required sharing + curiosity: creator shares link → voters must open + tap to vote → live results pull returns → CTA "Create your own →" sends voters back as creators with `?ref=poll_{id}` attribution. Binding metric **CTR = cta_click / poll_view ≥0.08 in 7 days** (8 polls → 12–15 group chats). Secondary kill: `voters_per_poll <3` or unfurl suppression >50%. Labels §29: HYPOTHESIS until fake-door data.

## MVP scope (P0 only)

| Feature | Contract |
|---|---|
| **Create** | 2–4 images + title (+ optional context), 15s, no auth, real flow (fake-door removed) |
| **Vote** | Tap image, no auth, soft dedup (cookie+localStorage+IP hash, last vote wins) |
| **Live results** | Animated bars + counts, realtime via Supabase Realtime (2s target, ESTIMATE) |
| **Share** | `p/{id}` + static `p/{id}.html` for crawlers; dynamic 1200×630 OG collage; Copy + Web Share API |
| **CTA** | Sticky bottom on mobile, `cta_view`/`cta_click` instrumented — THE metric |
| **Metrics** | `poll_view, vote, cta_view, cta_click, poll_create, share_*` → CTR, voters_per_poll, K-factor, referred retention (hidden `/metrics.html`) |
| **Guardrails** | Per-IP/per-poll caps, create caps, async NSFW check (flag don't block) |

**P1 (only after P0 passes):** listing/discovery, templates/remix, NSFW tuning, expiry. **Non-goals:** auth-required voting, discovery algo, monetization, native app, team workspaces, AI suggestions.

## Architecture

Supabase (Postgres + Realtime + Auth optional + Storage + `sharp`/`vercel/og` for 1200×630 OG), edge deploy on Vercel/Cloudflare. Tables: `polls`, `poll_options` (2–4, denormalized `votes`), `votes` (soft dedup key), `events`. API: `POST /api/polls`, `GET /api/polls/:id`, `POST /api/polls/:id/vote` (upsert, last wins), `GET /api/polls/:id/og`, `POST /api/events`, `GET /api/metrics`. Cost $0 inference, infra pennies; Free tier → ~$50–$115/mo at 100k polls / 1M votes (all ESTIMATE). See `company/product/architecture.md`.

## UX

Mobile-first, single-page create (title+2–4 cards → sticky "Create & get link"), tap-to-vote grid, animated results bars, share row (Copy + native sheet), sticky CTA card (`Create your own — 15s →` with `?ref=` attribution). Hidden `/metrics.html`. Tokens: system fonts, per-option color palette from validation seeds, 12px cards, 200/400ms motion. All flows validated at 375px. See `company/product/ux.md`.

## Acceptance on PASS

Build-ready means: P0 E2E on mobile 4G ≤15s create, <500ms optimistic vote, <2s realtime propagation, `curl -A WhatsApp p/{id}` returns correct OG, CTA viewport-tracked, burst 50 votes counts 50, rate/NSFW guards in place, metrics page live with CTR/K/referred retention. Quality-bar + red-team-review before "MVP complete." Level 3 deploys still need explicit YES per `CLAUDE.md`.

## Sources

`company/research/opportunity_map.md` (Candidate 003, 76/120, Viral 7, WEAKEN→VALIDATE), `company/decisions/approved.md` (binding CTR/KILL thresholds), `company/research/technologies/poll_infra.md` (Supabase/Realtime/OG/soft dedup), `company/research/competitors/instagram_polls.md` (voter→creator gap), `pollpop-validation/data/polls.json` (8 poll shapes).

## Known limitations (quality-bar 2026-08-14, Unattended — gaps back into Phase B, not a stop)

Per §33 honest check, all builds on ESTIMATE/HYPOTHESIS until live CTR/K re-measured at scale. Unchecked items from this cycle's quality-bar (not stop-conditions per CLAUDE.md):

- **Top risk — prod smoke 1ee6279 BLOCKED:** `POST /api/polls` → 500 `{"error":"TypeError: fetch failed"}` (picsum) and `{"error":"Image upload failed"}` (data: branch) VERIFIED via node fetch; Supabase DB write + `poll-images` upload both fail live. 004 SQL VERIFIED on disk, bucket INFERRED. Needs `vercel logs` (`[poll-images upload] failed` detail) + Supabase Dashboard Storage check + env `SUPABASE_SERVICE_ROLE_KEY`. Until fixed, live create/vote/CTR/K unmeasurable — ESTIMATE per §29.
- **Tests not run this session:** 11 vitest + 2 playwright e2e committed (store 4, dedup 3, analytics 2, route 2; e2e create-vote-CTA 2; vitest jsdom, playwright prod baseURL) — `npm install` EACCES symlink on Termux shared storage (`vitest: not found`); Vercel prod built green (Node 20 internal fs) but local `vitest run`/`playwright test` still needed outside shared storage.
- **Integration/e2e not live-probed:** vote soft-dedup vs live Supabase `dgurslguhkatnshlzvfcy`, `curl .../og` PNG check, Realtime <2s / 5s fallback, 50-concurrent burst via `002_vote_rpc.sql` — file-reviewed PASS but no live probe (sandbox curl denied, smoke blocked by DB).
- **Security — Critical/High mitigated, Medium/Low remain:** red-team 2026-08-14 (16 SEC + 24 BUG). FIXED: 003 RLS (anon SELECT only, service_role writes), 004 `poll-images` bucket public + policies (data URLs → Storage), 002 vote RPC atomic `increment_vote`/`decrement_vote` + orphan cleanup, rate limits 5/hr create + 10/poll/24h, meta 2KB `capMeta`, tmp→rename atomic persist. Remaining → Phase B: gradient contrast P1 (overlay functional), Realtime publication verify (`alter publication supabase_realtime add table poll_options`), optimistic reconcile transient stale (RT-BUG-15), cookie trust `SameSite=Lax` JS-readable → HttpOnly `Set-Cookie` + `x-vercel-forwarded-for` next (RT-SEC-05).
- **Performance not measured:** Realtime <2s / 5s fallback, 15s create, OG cache 3600 — all ESTIMATE. Bench stub `company/engineering/performance/bench-2026-08-14.md` method-only, blocked by prod DB (top risk).
- **Failure modes / docs:** Realtime down, image upload fail, NSFW down, 429 — file-reviewed not chaos-tested live. `technical-writer` not consulted.
- **Next:** Fix prod DB via `vercel logs` → verify 004 live → `npm run test:e2e` timed on pollpop-five → re-run `quality-bar`; when 17/17 checked, milestone in `history/milestones/` → §40.
