# Problem — PollPop

> DRAFT — contingent on H-001 PASS (CTR ≥0.08). Do not build until validation passes per `company/decisions/approved.md`.

## Problem statement (one sentence)

People who need a fast group decision ("which one?") have no tool that is simultaneously (a) visual, (b) link-shareable anywhere, (c) persistent, and (d) converts voters into new poll creators — so the daily "which one?" job stays fragmented across ephemeral/binary or ugly/text-only tools.

## The gap — evidence per §29

| Current solution | What it does well | Why it fails PollPop's job | Evidence label |
|---|---|---|---|
| Instagram Stories Poll | 2-tap, 2B reach, zero friction | 24h ephemeral, binary only, locked to IG, no link, voters never become creators — no acquisition loop | VERIFIED (IG mechanics) |
| Strawpoll / Poll-Maker | Instant link, no signup, multi-option | Ugly OG unfurl, no image options, no CTA, no discovery, feels spammy | VERIFIED category; details INFERRED (fetch failed 2026-08-14) |
| WhatsApp / group chat | Everyone already there | No tally, chaos, no persistence, no shareable artifact | VERIFIED |
| Google Forms | Flexible, trusted | 2-min setup, feels formal/work, not visual, wrong tone for "which fit?" | VERIFIED |

**Unbuilt loop (PollPop's wedge):** None of the above converts a voter into a creator via a results-page CTA. That is the gap documented in `company/research/competitors/instagram_polls.md` — "Neither converts voters → creators" — and the explicit focus of validation hypothesis H-001.

## Job severity & frequency

- **Job:** "Help me decide which one — outfit, food, logo, thumbnail, sneaker, room, cover, Airbnb — with a beautiful poll I can drop in any chat and get a real tally." (See 8 validation shapes in `pollpop-validation/data/polls.json`: fit-check, brunch-crew, logo-battle, thumbnail-wars, sneaker-drop, living-room, album-cover, airbnb-pick.)
- **Frequency:** 9/10 — this job recurs daily across social, group, and small-team contexts. Scored 9/10 in `opportunity_map.md` Candidate 003.
- **Pain severity:** 5/10 — not acute pain but chronic friction. Low pain is offset by extreme frequency × universal scope (everyone asks "which one?"). Contrarian correctly flagged: willingness to pay is low (3/10). PollPop monetizes later via brand/creator polls, not consumer paywall (HYPOTHESIS).

## Why software solves it (and why now)

- No AI/inference needed for MVP — CRUD + Realtime + Storage + OG rendering. $0 inference cost, infra pennies. See `company/research/technologies/poll_infra.md`.
- Real-time tallies via Supabase Realtime / websockets are a solved pattern (VERIFIED).
- Dynamic OG image per poll (collage + tally) is table-stakes for WhatsApp/Discord/iMessage unfurl CTR (VERIFIED technique) — missing in incumbents, required for share viability.
- Soft dedup (cookie + localStorage + IP fingerprint, fuzzy not strict) preserves virality that strict auth would kill (INFERRED tradeoff — validated by every viral poll product).

## Falsifiable claim (§29 discipline)

> PollPop's voter → creator CTA converts at CTR ≥0.08 within 7 days when 8 hand-made polls are seeded to 12–15 real group chats.

- **H-001 binding:** CTR = `cta_click / poll_view` (voter clicks "Create your own →" on results). Measured at `/metrics.html`. Kill/retry/pass thresholds in `company/decisions/approved.md`.
- **Secondary falsifiers:** `voters_per_poll` (need ≥3, kill if <3 across >10 polls), unfurl suppression (>50% suppressed → kill), and downstream K-factor (HYPOTHESIS until measured).
- Status labels in this doc: claims about CTR/K-factor are HYPOTHESIS/ESTIMATE until H-001 resolves. Do not cite them as VERIFIED.

## Out of scope for this problem definition

- Deep discovery feeds, ranking algorithms, native apps, monetization, auth-required voting — all deferred. The problem is narrowly the daily visual "which one?" + the missing voter→creator loop. Everything else is a non-goal until P0 loop is proven.
