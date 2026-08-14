# Requirements — PollPop MVP

> DRAFT — contingent on H-001 PASS (CTR ≥0.08). Do not build until validation passes per `company/decisions/approved.md`.

## Scope principle

MVP proves the viral loop compounds: **create (15s) → vote (no auth) → live results → share link with OG unfurl → CTA "Create your own →" → new poll**. Everything not directly serving that loop is P1 or non-goal. Contrarian's fatal question — does voter→creator convert ≥0.08? — is the only reason this exists.

---

## P0 — Must ship to prove the loop (no P0 = no signal)

### P0-1 Create poll (15s, no auth required)
- User can create a poll with: title (≤80 chars), optional context line, 2–4 image options each with a short label (≤24 chars). Images: upload (jpeg/png/webp, ≤5 MB each) or paste image URL.
- Image processing: server-side resize/compress (cover 600×600 or 600×750; OG 1200×630) — ESTIMATE sizing, adapt to actual assets.
- Validation: enforce 2–4 options, title required, at least one image required (INFERRED minimum viable visual bar).
- On success: poll gets persistent public URL `p/{id}` (short, copyable), DB row created, OG image rendered. No account required to create (optional anon cookie binding).
- Fake-door removed — this is the real creation flow, not a Typeform placeholder.

**Acceptance:**
- [ ] End-to-end create completes in ≤15s on 4G mobile (INFERRED target) — measured from landing to share-link shown.
- [ ] 2-, 3-, and 4-option polls all render correctly.
- [ ] Upload and URL-pasted images both work.
- [ ] Invalid states (0/1/5 images, empty title) show inline error, no silent fail.

### P0-2 Vote (no auth, soft dedup)
- Voter opens `p/{id}` → taps an image/option to vote. No login, no email.
- Soft dedup: `cookie + localStorage + IP fingerprint` (fuzzy, not strict). One vote counted per browser+IP window (ESTIMATE: 24h cookie + IP sliding window). Re-tapping changes vote (last vote wins) rather than blocking — preserves engagement (INFERRED tradeoff).
- Vote increments transactionally; concurrent burst (group-chat spike) handled without double-count (row-level increment).

**Acceptance:**
- [ ] First tap registers in <500 ms optimistic update, confirmed <1.5s (ESTIMATE).
- [ ] Changing vote updates tally correctly (one counted vote per voter).
- [ ] Cookie cleared + same IP still soft-blocked within window (fuzzy).
- [ ] Burst test: 50 concurrent votes tallies exactly 50 (INFERRED test harness).

### P0-3 Live results (realtime)
- After voting (or via "See results" without voting — HYPOTHESIS, test both), viewer sees animated bars: per-option count + percentage, total votes. Updates broadcast via Supabase Realtime / websocket / SSE (VERIFIED pattern per `technologies/poll_infra.md`).
- Curiosity loop: results update live while the page is open; returning voters see updated tally without refresh.

**Acceptance:**
- [ ] Vote from device A appears on device B's open results within 2s (ESTIMATE).
- [ ] Bars animate from previous state, not jarring reset.
- [ ] Page handles 0 votes (empty state copy, not 0/0 NaN).

### P0-4 Share link with OG preview
- Each poll has a stable share URL `p/{id}` (and `p/{id}.html` static fallback for crawlers — see Architecture).
- Dynamic OG: `og:title` = poll title, `og:description` = context/category, `og:image` = 1200×630 collage generated at create time (re-generated if edited). Verified technique per `technologies/poll_infra.md`.
- Share affordances: Copy link button (clipboard + toast), Web Share API sheet on mobile, native share fallback. Link unfurls in WhatsApp, iMessage, Discord previews.

**Acceptance:**
- [ ] `curl -A WhatsApp` (or equivalent UA) on `p/{id}` returns correct OG tags + 1200×630 image URL.
- [ ] Copy link works on iOS Safari + Android Chrome (VERIFIED APIs).
- [ ] Web Share API triggers native sheet where supported, degrades gracefully elsewhere.
- [ ] OG image regenerates if poll edited within 5 min window.

### P0-5 Results CTA — "Create your own →" (THE metric)
- Prominent CTA card on results: headline + subhead + button. Mobile: sticky bottom card always visible without scrolling past results. Desktop: inline below results + sticky header variant.
- CTA copy default: "Create your own — 15s" (HYPOTHESIS — A/B two variants if retry needed). Button links to `/?ref=poll_{id}` (attributed).
- CTA is the sole binding metric surface: instrumented as `cta_view` (card entered viewport) and `cta_click`.

**Acceptance:**
- [ ] CTA visible without scroll on 375px viewport after vote (sticky bottom).
- [ ] `cta_view` fires once per poll_view when card enters viewport (IntersectionObserver).
- [ ] `cta_click` carries `ref=poll_{id}` attribution.

### P0-6 Metrics instrumentation (kill-aware)
Events (all anonymous, cookie-keyed):
`poll_view`, `vote`, `cta_view`, `cta_click`, `poll_create`, `poll_create_start`, `poll_create_complete`, `share_copy`, `share_native`

Derived metrics the dashboard must compute (see Architecture):
- Binding: **CTR = `cta_click / poll_view`** (primary), also `cta_click / cta_view`, `cta_click / vote` for diagnosis.
- Health: `voters_per_poll`, `votes_per_poll`, `polls_created`.
- Viral depth: **K-factor** = `polls_created_via_cta / poll_view` (ESTIMATE label) and `polls_created_via_cta / cta_click`.
- Quality: `referred_retention` = referred creators who create a 2nd poll within 7 days (HYPOTHESIS).
- Channel health: unfurl suppression rate (direct views vs crawler hits).

**Acceptance:**
- [ ] All events fire exactly once per action (no double-fire on re-render).
- [ ] Hidden metrics page (`/metrics.html` during MVP) shows live counts + derived CTR/K/referred retention with evidence labels.
- [ ] No PII stored; IP used only for soft dedup + rate limiting, not persisted raw beyond window (see Architecture).

### P0-7 Abuse, rate limiting, NSFW (minimal viable guardrails)
- Per-IP and per-poll vote caps (e.g., 10 votes / IP / poll / 24h ESTIMATE — tune live).
- Create rate limit: 5 polls / IP / hour (ESTIMATE).
- Image NSFW check: lightweight provider (Cloudflare Images / AWS Rekognition / vision filter — VERIFIED services exist per `poll_infra.md`) — async flag, manual review queue. Block obvious explicit; don't over-block (INFERRED tolerance).
- Basic profanity/title filter.

**Acceptance:**
- [ ] 11th vote from same IP/poll within window is soft-rejected (count unchanged, UX toast).
- [ ] NSFW-flagged image is blurred/held, not auto-published, with appeal path (HYPOTHESIS UX — finalize with founder).

---

## P1 — Only if P0 passes validation

- Poll listing / discovery (my polls, recent public polls) — NOT needed to prove the loop; skip until K-factor holds.
- Templates / remix ("use this poll as template") — high value but post-CTR.
- NSFW filter tuning, word lists, moderation queue polish.
- Poll expiry / edit window.

P1 ships only after P0 metrics clear the quality bar. No P1 work competes with P0 instrumentation.

---

## Non-goals (explicitly NOT building for MVP)

- Auth-required voting (kills virality — INFERRED).
- Discovery algorithm / feed / leaderboard / "poll of the day" ranking.
- Monetization, ads, premium themes, brand polls.
- Native app (mobile web only).
- Team workspaces / SSO / decision-board features.
- AI poll suggestions (deferred — $0 inference stays $0 per `poll_infra.md`).

---

## Acceptance & kill-aware instrumentation summary

| Signal | Formula | Threshold | Verdict |
|---|---|---|---|
| Binding CTR | `cta_click / poll_view` | ≥0.08 PASS; 0.03–0.08 RETRY once; <0.03 KILL | Per `company/decisions/approved.md` |
| Voters per poll | `unique_voters / poll_count` (polls with >10 views) | <3 across >10 polls → KILL (secondary) | Per approved.md |
| Unfurl suppression | `crawler_hits / poll_view` gap | >50% suppressed vs direct → KILL | Per approved.md |
| K-factor | `polls_created_via_cta / poll_view` | Track as ESTIMATE; no kill yet, inform P1 | Diagnosis |
| Referred retention | `referred_creators_with_2nd_poll_in_7d / referred_creators` | Track as ESTIMATE; flags loop quality | Diagnosis |

All thresholds are HYPOTHESIS until H-001 resolves. Instrumentation must be in place before any growth claim is made (§29).
