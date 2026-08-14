# CEO — State

> Maintained by whichever subagent is acting in this department. Update this file, don't just talk about updating it. See master protocol §6 for the format this file follows.

## ROLE
Owns the company's mission and final strategic call.

## MISSION
Owns the company's mission and final strategic call. See `.claude/docs/agent-directory.md` for which subagent(s) act in this department. Viral/PLG mission focus per `company/decisions.md` 2026-08-14 — every candidate requires falsifiable Viral Mechanism.

## CURRENT OBJECTIVE
Phase 1 research complete; first CEO gate report delivered 2026-08-14. Awaiting human YES to approve PollPop (Candidate 003) **for validation** (not build) under explicit kill criteria. Do NOT proceed to engineering until gate passes. Next work is 3–5 day $0 fake-door test (8 polls → 12–15 group chats → voter→creator CTR), not MVP build.

## KNOWN FACTS
- 10 candidates in `company/research/opportunity_map.md` (8 Round 1 + 2 Round 2), scored 52–79/120 via 12-dim rubric with Viral Strength semi-gating.
- Contrarian verdicts 2026-08-14: 001 ClipForge KILL (unit economics ~$0.64/8s ESTIMATE + CapCut 200M MAU moat), 003 PollPop WEAKEN→VALIDATE (single existential assumption testable $0), 005 StudyStreak KILL (Quizlet 60M moat + $0 WTP + seasonality).
- 9 ideas in `company/research/rejected_ideas.md` with reasons + reconsideration thresholds.
- 5 competitor files in `competitors/` (capcut, runway, sora, quizlet, instagram_polls) + 3 tech notes in `technologies/` (video_generation_apis, srs_and_deck_generation, poll_infra) — all INFERRED due to WebSearch 400 + WebFetch 403/451 failures (VERIFIED outage in `research_log.md`).
- PollPop scored 76/120 (highest surviving), Viral 7/10, but "why score may be wrong" flags overestimated viral strength.
- CEO report written to `company/ceo_report_2026-08-14.md` (1993 words, also duplicated to `company/research/ceo_report.md`), covers all §38 sections with §29 labels and explicit kill criteria.
- Autonomy mode UNATTENDED; this is the one mandatory gate per `CLAUDE.md` stop-condition #1; `company/company_state.md` still shows PHASE 1.

## ASSUMPTIONS
- PollPop's voter→creator CTR ≥0.08 is HYPOTHESIS (95–99% lurker baseline suggests 0.02–0.03) — must be falsified via fake-door, not assumed.
- Competitive pricing/capabilities (CapCut/Runway/Sora/Quizlet) are INFERRED — may shift on live verification.
- Platform external-link throttling (IG/X/WhatsApp) is HYPOTHESIS; if unfurl suppressed >50%, PollPop distribution collapses.
- PollPop monetization (ads/themes/brands) is UNKNOWN; moderation/COPPA at scale is HYPOTHESIS risk containable at hand-made scale only.

## OPEN QUESTIONS
- Will voter→creator CTR hit ≥0.08 (PASS) or <0.03 (KILL) within 7 days in 12–15 real group chats?
- Is voters_per_poll ≥5 achievable, or <3 (no distribution)?
- Does OG-image link preview drive required CTR (HYPOTHESIS: 50–70% drop without it)?
- Can any rejected candidate clear its reconsideration threshold if PollPop fails (e.g., RoastLab D7 >10%, CardDrop creation ≥0.08)?

## EVIDENCE
- `company/research/opportunity_map.md` — 10 candidates, scores, contrarian verdicts
- `company/research/rejected_ideas.md` — 9 rejections with reconsideration conditions
- `company/research/competitors/` — capcut.md, runway.md, sora.md, quizlet.md, instagram_polls.md (all INFERRED, fetch blocked)
- `company/research/technologies/` — video_generation_apis.md, srs_and_deck_generation.md, poll_infra.md
- `company/research/research_log.md` — 2 rounds + methodology + WebSearch/WebFetch failure log
- `company/decisions.md` — viral retarget + Unattended mode (both 2026-08-14)
- `company/ceo_report_2026-08-14.md` + `company/research/ceo_report.md` — first CEO gate report (§38)

## DECISIONS
- 2026-08-14: Recommended PollPop (003) CONDITIONAL on fake-door validation (CTR ≥0.08 PASS, <0.03 KILL, 0.03–0.08 inconclusive with one retry). NOT approved to build. Awaiting human YES for validation phase only. Recorded in ceo_report_2026-08-14.md §RECOMMENDED PRODUCT / §VALIDATION PLAN.

## FAILED ATTEMPTS
- WebSearch 400 max_uses on all Round 1 queries; 8 WebFetch 403/451/model errors on competitor sites — forced fallback to INFERRED training-data findings per §29. Logged in `research_log.md`; not a product failure but evidence-quality limitation requiring live re-verification before build cost model.

## NEXT ACTIONS
- Await human YES on gate. Do NOT invoke gate-check (owner will do separately).
- If YES → enter Phase 2 Validation: Days 1–5 fake-door test per `ceo_report` VALIDATION PLAN; log hypothesis per §20 format in `company/experiments/`; Day 5–7 verdict to `experiments/results/` + `research_log.md`; if KILL → PollPop to `rejected_ideas.md` and return to research (§28 loop); if PASS → scaffold 1–2w Supabase MVP (create-vote-share-results-CTA + OG + soft dedup + NSFW + instrumentation).
- If NO or no response → hold; do not proceed to engineering.
