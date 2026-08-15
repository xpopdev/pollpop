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

## Known limitations (quality-bar 2026-08-15 — honest §29, 12/17 docs pass after lean 07)

Per §29/§33, ESTIMATE/HYPOTHESIS until 7-day CTR/K at scale. Unchecked → Phase B not stop per CLAUDE.md. Audit vs code `347f22c`/`8d0d793` prod 5/5; `architecture.md` + `app/README.md` matching code per next-increment-07.

- **Perf ESTIMATE — vote 3.6-4.6s >500ms FAIL (cold infra, not code — see architecture Dedup/Storage):** `POST /:id/vote` 3638–4687ms (347f22c re-bench) + `GET /:id` 2275ms vs <500ms FAIL per `company_state.md`/`pollpop-check/live-bench-2026-08-15.md`. Cold Vercel+Supabase infra, not code — burst FIXED 002 (`increment_vote` RPC atomic) now 10/10 PASS isolated with distinct `x-vercel-forwarded-for`; same-IP 1,0 is 10/poll/24h cap by design. Create 2.7–5.3s PASS, OG png 68kB `max-age=3600` `x-pollpop-og: png-sharp` `nodejs` PASS.
- **Realtime UNKNOWN (no 2-tab live):** `PollClient.tsx` `poll:{id}` on `poll_options` + 5s `GET /:id` fallback file-verified (`architecture.md` VERIFIED code), `supabase_realtime` publication INFERRED until `pg_publication_tables` check; propagation ESTIMATE <2s/5s until live 2-tab probe in rebench — remains UNKNOWN per §29 until measured.
- **competitive INFERRED:** WebFetch still 400/451 — `competitor_watch.md` all INFERRED last checked 2026-08-15 per §25, re-verify when fetch recovers (out of scope per next-increment-07). Threat Low.
- **CTR/K ESTIMATE until 50 views:** Viral CTR/K/referred retention ESTIMATE until 7-day seed (8 polls → 12–15 chats, need **≥50 poll_view**) per `seeding-plan-2026-08-15.md`; labels stay ESTIMATE until counted, `k_per_click`/`referred_retention` likewise.
- **Recent fixes VERIFIED (code, not yet live-probed):** PollCard flat (3e4df9f `rgba(18,18,20,.42)` oat stone) · HttpOnly Secure `SameSite=Lax` + `x-vercel-forwarded-for` (53283de RT-SEC-05/04 VERIFIED `app/app/api/polls/*`) · 004 `poll-images` public true `anon SELECT` / `service_role ALL` (file VERIFIED `004_storage.sql`, live INFERRED) · 005 `color` · 002 `increment_vote`/`decrement_vote`/`change_vote` RPC atomic burst 10/10 distinct IP · OG `nodejs` `sharp` png-sharp 68kB `x-pollpop-og: png-sharp` VERIFIED live 200.

Next: seed → CTR ≥0.08 → CEO gate → milestone §40.

## Sources

`opportunity_map.md` (003 76/120 Viral 7 WEAKEN→VALIDATE), `decisions/approved.md` (CTR kill <0.03), `technologies/poll_infra.md`, `research/competitors/instagram_polls.md`.
