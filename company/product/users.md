# Users — PollPop

> DRAFT — contingent on H-001 PASS (CTR ≥0.08). Do not build until validation passes per `company/decisions/approved.md`.

## Primary user — Social & group decision-maker (16–35)

**Who:** Person who asks "which one?" daily — outfit checks, food picks, thumbnails, sneakers, room decor, travel listings — and drops the question into a group chat, Close Friends story, or Discord server. Lives on WhatsApp / iMessage / Instagram / Discord. Has low tolerance for multi-step setup (expects 15s).

**Context:** Decision is social — needs other people's votes, not just information. Speed matters more than precision. Aesthetic matters because the poll is a shareable artifact (screenshot/story). 8 canonical shapes in `pollpop-validation/data/polls.json` map directly to this user (fit-check, brunch-crew, logo-battle, thumbnail-wars, sneaker-drop, living-room, album-cover, airbnb-pick).

**JTBD:**
- *When* my group chat is chaos about "where to eat / which fit / which thumbnail,"
- *I want to* spin a beautiful 2–4 image poll in ~15 seconds and share a link that unfurls nicely,
- *So I can* get a clear tally, end debate, and look like the organized one.

**Success (user):** Poll created in ≤15s without signup; link unfurls with image collage in WhatsApp/iMessage; votes appear live; tally settles the debate.

**Success (PollPop):** `poll_create` → `poll_view` → `vote` → `cta_view` → `cta_click` chain observable; `voters_per_poll` ≥3 is first health signal, but binding metric is `cta_click / poll_view` ≥0.08 (H-001). (Thresholds HYPOTHESIS until validated.)

**Evidence:** Frequency 9/10 scored in opportunity_map; IG poll gap documented in `competitors/instagram_polls.md`; voter→creator CTR HYPOTHESIS until fake-door resolves.

---

## Secondary user — Small teams & classrooms (lightweight)

**Who:** Small groups of 3–15 (startup pods, agency teams, class cohorts, club organizers) who pick a logo, venue, date, or concept. Needs slightly more trust (who voted?) but still wants speed and sharing over formality.

**JTBD:**
- *When* my team needs to pick one of a few visual options without a meeting,
- *I want to* share a poll link that anyone can vote on without auth, then see live results we can act on,
- *So I can* close the decision async.

**Success:** Same P0 flow as primary; no team-workspace needed for MVP. Soft dedup is enough. Team features are P1 at most.

**Evidence:** Market Size 8/10 in opportunity_map (universal job). Willingness to pay 3/10 — expect $0 consumer payment; secondary may monetize later via brand/creator polls (UNKNOWN).

---

## Anti-persona (explicit non-targets for MVP)

- Enterprise decision-board buyers seeking audit trails, SSO, or Jira integration — ShipTogether-shaped, not PollPop.
- Pro creators needing video/UGC challenge chains (DuetChain-shaped).
- Anyone who needs authenticated, 1-person-1-vote elections — out of scope; strict identity kills the viral loop (deferred to post-PMF if ever).

## Behavioral assumptions → instrumentation

| Assumption | Label | How we falsify |
|---|---|---|
| 16–35 will create a 2–4 image poll in 15s if setup is short enough | HYPOTHESIS | Funnel drop at `poll_create` start → complete |
| Voters will tap an image to vote without auth | HYPOTHESIS | `vote / poll_view` |
| Voters who see results will consider creating their own poll | HYPOTHESIS (H-001) | `cta_click / poll_view` and `cta_click / cta_view` (binding) |
| Referred creators behave like seed creators (retention) | HYPOTHESIS | `referred_retention` (creator returns to create a 2nd poll) |
| Link unfurl drives traffic in WhatsApp/iMessage/Discord | INFERRED | Compare `poll_view` direct vs unfurl; kill if suppression >50% |

All non-obvious claims above are HYPOTHESIS/INFERRED/ESTIMATE per §29 until H-001 data arrives.
