# Approved decisions

> Every approved major decision, including the product selection once Phase 1 completes
> (master protocol §11). This is what `.claude/settings.json` requires explicit human
> confirmation to edit — treat it as the company's committed record, not a draft.

## PollPop selected for Validation (NOT Build) — 2026-08-14

Decision: Approve Candidate 003 — PollPop (15s visual polls with participation-required viral loop) — for VALIDATION only, under binding kill criteria. This does NOT authorize building, spending, deploying, or external comms. Validation must pass before any build commitment.

Context: Phase 1 generated 10 candidates (scores 52–79/120), contrarian-attacked top 3: 001 ClipForge KILL (unit economics ~$0.64/gen ESTIMATE + CapCut 200M MAU moat), 005 StudyStreak KILL (Quizlet 60M moat + $0 WTP + seasonal), 003 PollPop WEAKEN→VALIDATE — only KILL-survivor with a $0 / 3–5 day falsification path. CEO report 2026-08-14 recommended PollPop conditional on fake-door test. Human approved via YES at gate-check 2026-08-14.

Options considered: (a) approve PollPop unconditionally for build — rejected, core assumption (voter→creator ≥0.08) unvalidated and fights lurker math; (b) reject all and return to research — rejected, PollPop has cheapest falsification path worth testing first; (c) approve PollPop for validation with binding kill criteria — chosen.

Evidence: opportunity_map.md (10 candidates, scored + contrarian verdicts) — PollPop 76/120, Viral 7, highest surviving score. competitors/instagram_polls.md — gap: neither IG (2B reach but 24h/binary/locked) nor Strawpoll (ugly, no visuals/CTA) converts voters→creators. technologies/poll_infra.md — $0 inference, 1–2w MVP estimate. rejected_ideas.md — 9 rejections with reconsideration thresholds. research_log.md — WebSearch/WebFetch were down; all pricing INFERRED.

Chosen option: (c) — PollPop for validation.

Why: Only candidate that survived contrarian KILL with a falsifiable mechanism (voter→creator CTR) and a near-zero-cost test. Highest surviving score with honest error bars. Cheapest to be wrong.

Risks: Voter→creator assumption may not exist (lurker baseline 95–99% HYPOTHESIS vs required 0.08–0.15); platform link unfurl suppression; zero IP (Defensibility 3/10); WTP UNKNOWN; moderation/COPPA UNKNOWN.

Reversal conditions: Kill PollPop if fake-door CTR <0.03 in 7d (or <0.08 after one retry if initially 0.03–0.08), or voters_per_poll <3, or platform unfurl suppression >50%. On KILL, archive to rejected_ideas.md and return to Phase 1 discovery with a genuinely different angle per §28.

Owner: Human owner (YES at gate-check 2026-08-14) + CEO agent recommendation

---

## Validation plan binding criteria — 2026-08-14

Plan: 8 hand-made polls → 12–15 real group chats → 7-day voter→creator CTR measurement.

Kill criteria:
- CTR <0.03 in 7d → KILL PollPop, return to research
- 0.03 ≤ CTR <0.08 → INCONCLUSIVE, one iteration allowed (tweak CTA/copy/placement), then re-measure; if still <0.08 → KILL
- CTR ≥0.08 → PASS → proceed to 1–2w Supabase MVP scaffolding

Also KILL if voters_per_poll <3 across >10 polls, or external-link unfurl suppressed >50% vs direct.

Next phase on PASS: Supabase MVP (create-vote-share-results-CTA + OG + soft dedup + NSFW + K-factor + referred-retention instrumentation). Quality-bar + red-team-review before "MVP complete." Level 3 actions still require explicit confirmation per CLAUDE.md.

Owner: CEO / Research
