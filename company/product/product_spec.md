# PollPop — PRD (lean)

> PASS 2026-08-14 H-001 CTR≥0.08 human PASS. Build per `decisions/approved.md` PHASE 3. Labels §29 remain ESTIMATE until live CTR/K.

**One-liner:** 15s visual polls (2–4 images + title) → share link unfurls 1200×630 → voters see sticky "Create your own — 15s" CTA viral loop.

## Problem & gap

IG Stories ephemeral/binary/locked; Strawpoll ugly/text-only, no acquisition. Neither converts voters→creators. Frequency 9/10 "which one?" daily has no cross-platform visual home. Gap = voter→creator CTA.

## Viral mechanism (falsifiable)

Creator shares `p/{id}` → voters tap to vote → live results → CTA `?ref=poll_{id}` → voters become creators. **CTR = cta_click / poll_view ≥0.08 in 7 days** (8 polls → 12–15 chats). Kill if `voters_per_poll <3` or unfurl suppression >50%. HYPOTHESIS until live.

## MVP scope (P0)

Create 2–4 images + title · Vote tap soft dedup (cookie+LS+ip_hash) · Realtime bars (ESTIMATE <2s) · Share `p/{id}` + 1200×630 OG png-sharp nodejs · CTA sticky `cta_view`/`cta_click` · Metrics CTR/K/voters_per_poll · Guardrails 5/hr + 10/poll/24h + NSFW flag.

## Architecture

Supabase (Postgres+Realtime+Storage 004 + sharp nodejs) + Vercel. Tables `polls`, `poll_options` (005 `color`), `votes`, `events`. API `POST /polls`, `GET /:id`, `POST /:id/vote` RPC, `GET /:id/og`. See `architecture.md`.

## Known limitations (quality-bar 2026-08-15 — honest §29, 12/17 docs pass)

Per §33, ESTIMATE/HYPOTHESIS until 7-day CTR/K at scale. Unchecked → Phase B not stop per CLAUDE.md.

- **Perf ESTIMATE — vote 3.6-4.6s >500ms FAIL (cold infra, not code):** `POST /:id/vote` 3638–4687ms (347f22c) + GET 2275ms vs <500ms FAIL. Cold Vercel+Supabase, not code — burst FIXED 002. Create 2.7–5.3s PASS, OG png 68kB `max-age=3600` `x-pollpop-og: png-sharp` PASS, burst 10/10 PASS isolated with distinct `x-vercel-forwarded-for`.
- **Realtime UNKNOWN (no 2-tab live):** No 2-tab probe; `poll:{id}` + 5s fallback file-verified, propagation remains ESTIMATE until live tabs in rebench.
- **competitive INFERRED:** WebFetch still 400/451 — `competitor_watch.md` INFERRED last checked 2026-08-15 per §25, re-verify when fetch recovers. Threat Low.
- **CTR/K ESTIMATE until 50 views:** Viral CTR/K/referred retention ESTIMATE until 7-day seed (8 polls → 12–15 chats, need ≥50 poll_view) per seeding-plan; labels stay ESTIMATE.
- **Recent fixes VERIFIED:** PollCard flat (3e4df9f flat `rgba(18,18,20,.42)` oat stone) · HttpOnly Secure `SameSite=Lax` + x-vercel-forwarded-for (53283de RT-SEC-05/04) · 004 poll-images public · 005 color · 002 increment_vote RPC atomic burst 10/10.

Next: seed → CTR ≥0.08 → CEO gate → milestone §40.

## Sources

`opportunity_map.md` (003 76/120 Viral 7 WEAKEN→VALIDATE), `decisions/approved.md` (CTR kill <0.03), `technologies/poll_infra.md`, `research/competitors/instagram_polls.md`.
