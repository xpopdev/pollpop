# Experiment hypotheses

> Technical-feasibility hypotheses (master protocol §21) — "can the algorithm work," "can
> latency meet the target," "can the system scale." For "does anyone want this"-style
> hypotheses, use `validation/` instead.

---

## T-001: PollPop Static OG Unfurl Works Across Platforms — 2026-08-14

Hypothesis: Per-poll static pages (pollpop-validation/p/{id}.html) with baked og:image + og:title + og:description will unfurl correctly in WhatsApp, Discord, iMessage, and Slack when that URL is seeded, driving click-through to poll.

Mathematical Motivation: Link CTR in messaging apps is dominated by unfurl rendering — links without OG are ~50-70% lower CTR (HYPOTHESIS ESTIMATE). Validating static pages is necessary because the dynamic poll.html updates OG via JS (not visible to crawlers).

Architecture: 8 static HTML files per poll, each with <meta property="og:*"> + <meta name="twitter:card"> + canonical link to poll.html?id=X + meta-refresh + JS redirect. Shared URL = p/{id}.html; human lands on poll.html.

Expected Advantage: WhatsApp/Discord/iMessage show beautiful poll preview → higher voter yield.

Expected Failure Mode: Crawler fetches redirect target not preview; OG image URL blocked by CSP; WhatsApp caches stale preview.

Baseline: Dynamic poll.html alone (JS-updated OG) — expected to fail crawler unfurl.

Ablation Plan: Share both p/fit-check.html (static) and poll.html?id=fit-check (dynamic) to test chats; compare voter yield.

Benchmark Plan: Measure voters_per_poll per link variant; expect static ≥ dynamic.

Results: (pending)

Conclusion: (pending)

---

## T-002: Soft Vote Dedup Without Auth — 2026-08-14

Hypothesis: Cookie + localStorage + IP fingerprint soft dedup can prevent double-vote without requiring login, without killing viral participation rate.

Mathematical Motivation: Forcing auth before voting reduces participation by an estimated 30-50% (HYPOTHESIS) — fatal for a viral loop that needs friction-free voting.

Architecture: vote blocked per-browser via localStorage.pollpop_voted map; analytics.js tracks voter_id; server-side enforcement deferred to Supabase MVP (Postgres unique constraint on (poll_id, voter_fingerprint) later).

Expected Advantage: Zero-friction voting → higher voters_per_poll during validation.

Expected Failure Mode: Users clear storage or use multiple browsers and double-vote; brigading possible.

Baseline: Auth-required voting (email/OTP) — higher integrity, lower yield.

Ablation Plan: Compare participation in auth-required vs soft-dedup variants.

Benchmark Plan: Measure vote completion rate and double-vote rate.

Results: deferred to MVP scaffolding if H-001 passes (validation phase uses soft dedup as specified).

Conclusion: (pending)
