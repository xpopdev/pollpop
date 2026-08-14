# validation/hypotheses.md

"Does anyone want this" hypotheses (master protocol §20) — distinct from technical feasibility, which lives in `experiments/`.

---

## H-001: Voter→Creator Conversion — The Existential Hypothesis — 2026-08-14

HYPOTHESIS: A person who votes on a PollPop poll and sees live results + the CTA "Create your own poll — 15s →" will click that CTA at a rate ≥0.08 within 7 days of voting.

WHY IT MATTERS: This single number determines whether PollPop's participation-required viral loop compounds or collapses. Every other dimension (Frequency 9/10, Market Size 8/10, $0 inference cost, defensibility) is moot if voters don't become creators. Contrarian attack says lurker baseline is 95-99% (0.01-0.05) and that 0.08 may not exist — this test falsifies that directly. Per decisions/approved.md, this is the binding gate to build.

TEST: Fake-door / concierge experiment — $0, no code beyond static site. 8 hand-made polls (fit-check, brunch-crew, logo-battle, thumbnail-wars, sneaker-drop, living-room, album-cover, airbnb-pick) hosted at pollpop-validation/poll.html + static OG pages at p/{id}.html for link unfurls. Seed links into 12–15 real group chats (friend circles, team channels, classroom Discords, WhatsApp) with natural "which one?" framing. No paid reach. Measure 7 days. Instrumentation: analytics.js tracks poll_view → vote → cta_view → cta_click (primary) → fake_door_submit; metrics.html computes CTR = cta_clicks / unique_voters and shows PASS/RETRY/KILL verdict.

EXPECTED RESULT: HYPOTHESIS predicts CTR ≥0.08. Based on prior lurker research (HYPOTHESIS: 1-5% typical UGC creation), this is an order of magnitude above baseline — ambitious.

ACTUAL RESULT: (pending — fills after 7-day measurement window)

CONCLUSION: (pending)

NEXT ACTION:
- If CTR ≥0.08 → PASS → scaffold Supabase MVP (create-vote-share-results-CTA + OG + soft dedup + NSFW + K-factor instrumentation)
- If 0.03 ≤ CTR <0.08 → INCONCLUSIVE → one retry with tweaked CTA copy/placement/image framing, then re-measure; if still <0.08 → KILL
- If CTR <0.03 → KILL → archive PollPop to rejected_ideas.md and return to Phase 1 discovery (§28 self-correction, genuinely different angle)

Source: ceo_report_2026-08-14.md §VALIDATION PLAN + company/decisions/approved.md kill criteria

---

## H-002: Voters Per Poll — Reach Hypothesis — 2026-08-14

HYPOTHESIS: Each seeded poll will draw ≥5 unique voters on average.

WHY IT MATTERS: Even if conversion is high, low voter yield means total funnel is too small. Tests platform link-reach (IG/X/WhatsApp external link handling) and organic shareability.

TEST: Same 8 polls, same seeding. Measure voters_per_poll = unique voters / poll count. Track unfurl success via direct link vs image+screenshot vs native.

EXPECTED RESULT: ≥5 voters per poll.

ACTUAL RESULT: (pending)

CONCLUSION: (pending)

NEXT ACTION: If <3 voters_per_poll across >10 polls → KILL per approved.md (platform throttling confirmed). If 3-5 → inconclusive, adjust seeding strategy.

---

## H-003: Platform Unfurl / Link Suppression Hypothesis — 2026-08-14

HYPOTHESIS: External poll links will unfurl correctly (OG image + title) in WhatsApp/Discord/iMessage; Instagram Stories link reach not suppressed >50% vs direct message.

WHY IT MATTERS: PollPop depends on link sharing. If platforms suppress external links or fail OG unfurls, the acquisition channel dies regardless of poll quality.

TEST: Seed same polls as links vs screenshots with "vote link in bio" variants. Compare voter yield per view: external link vs native image. Based on prom/polls.json OG setup (og:image + og:title + og:description per poll static page).

EXPECTED RESULT: Unfurl works in WhatsApp/Discord/iMessage; IG Stories link not suppressed >50%.

ACTUAL RESULT: (pending)

CONCLUSION: (pending)

NEXT ACTION: If unfurl suppressed >50% vs native → KILL per approved.md. Mitigation would be screenshot-first sharing, not feed-link-dependent.

---

## What this does NOT validate

- Willingness to Pay: UNKNOWN — no pricing signal in this test
- Defensibility beyond recognition: HYPOTHESIS — cannot test clone speed in 5 days
- Moderation at scale: UNKNOWN — hand-made polls avoid NSFW; required before public MVP
- Long-term retention (D7/D30): INFERRED — 7-day window measures intent, not durably retained creators
