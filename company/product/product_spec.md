# PollPop — One-Page PRD Summary

> DRAFT — contingent on H-001 PASS (CTR ≥0.08). Do not build until validation passes per `company/decisions/approved.md`.

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
