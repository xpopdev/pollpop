# Handoff — Phase 2 Validation (PollPop fake-door) — 2026-08-14

SOURCE AGENT: CEO + engineering + research (Phase 1 + validation build)
TARGET AGENT: COO / growth-analytics-manager / whoever runs the 7-day measurement

OBJECTIVE: Complete PollPop fake-door validation: seed 8 polls to 12–15 group chats, measure 7 days, decide PASS/KILL per binding criteria in decisions/approved.md.

WHAT WE KNOW:
- PollPop (Candidate 003, 76/120, Viral 7) is the only KILL-survivor from Phase 1 (10 candidates, 2 contrarian KILLs, 8 rejections archived). It survived as WEAKEN→VALIDATE because the existential assumption (voter→creator ≥0.08) is testable at $0 in 3–5 days.
- All competitive pricing is INFERRED (WebSearch/WebFetch were down — verified in research_log.md). PollPop's wedge: neither IG (2B, but 24h/binary/locked) nor Strawpoll (ugly, no visuals/CTA) converts voters→creators.
- Company is in PHASE 2 — VALIDATION. State: company/company_state.md. Approval + kill criteria: company/decisions/approved.md. CEO report: company/ceo_report_2026-08-14.md. Hypotheses: company/validation/hypotheses.md (H-001 existential), company/experiments/hypotheses.md (T-001 OG unfurl, T-002 soft dedup).

EVIDENCE:
- PollPop validation site: pollpop-validation/ — static, zero backend, localStorage analytics. 8 polls, p/{id}.html static OG pages, poll.html vote→results→CTA flow, metrics.html dashboard. See pollpop-validation/README.md for run/deploy.
- Metrics: poll_view → vote → cta_view → cta_click (PRIMARY: CTR = cta_clicks/unique_voters) → fake_door_submit. View via metrics.html or PollPopAnalytics.computeMetrics() in console.

ASSUMPTIONS:
- CTR ≥0.08 is achievable despite lurker baseline 0.01–0.05 (HYPOTHESIS under test).
- Voters_per_poll ≥5 (H-002) and OG unfurl works outside IG suppression (H-003) — both falsifiable in same test.
- LocalStorage per-browser counting suffices for validation (not vote integrity at scale).

DECISIONS:
- 2026-08-14 viral retarget (decisions.md) + Unattended single-gate.
- 2026-08-14 PollPop for validation (decisions/approved.md) — human YES at gate 1, binding kill criteria above.
- 9 rejections in research/rejected_ideas.md with explicit reconsideration thresholds.

OPEN QUESTIONS:
- What is actual voter→creator CTR? (H-001 — the gate)
- Voters_per_poll? Platform unfurl suppression? (H-002/H-003)
- WTP, defensibility, moderation at scale — explicitly NOT tested in this experiment (see hypotheses.md).

FAILED APPROACHES:
- WebSearch (400 max_uses) and WebFetch (403/451/model) failed all of Phase 1 — fallback to training data to 2026-01-04, all labeled INFERRED per §29. Must re-verify pricing live before any MVP cost model.
- ClipForge (001, 79/120) killed on unit economics (~$0.64/gen ESTIMATE, virality accelerates burn) + CapCut 200M MAU moat — even highest score wasn't enough.
- StudyStreak (005, 73/120) killed on Quizlet moat + $0 WTP + seasonality triple kill.

FILES TO READ:
- company/company_state.md
- company/decisions/approved.md
- company/ceo_report_2026-08-14.md
- company/research/opportunity_map.md (final ranked list + contrarian results)
- company/validation/hypotheses.md (H-001/H-002/H-003 + NOT-validated section)
- company/experiments/hypotheses.md (T-001/T-002)
- pollpop-validation/README.md
- pollpop-validation/metrics.html
- company/history/audit_log.md

EXPECTED OUTPUT:
- 7-day measurement logged to company/validation/results.md + company/experiments/results/ + research_log.md
- PASS (CTR ≥0.08) → scaffold Supabase MVP (create-vote-share-results-CTA + OG + soft dedup + NSFW + K-factor instrumentation); specs to company/product/; quality-bar + red-team-review before MVP complete
- KILL (CTR <0.03 or voters_per_poll <3 or unfurl >50% suppressed) → archive to rejected_ideas.md, return to Phase 1 discovery with genuinely different angle (§28 self-correction)
- INCONCLUSIVE (0.03–0.08) → one retry with tweaked CTA/copy/placement, then re-measure; if still <0.08 → KILL

SUCCESS CRITERIA:
- Validation site seeded to ≥12 group chats, ≥10 polls live, ≥150 unique voters within 7 days (per validation plan power target)
- Verdict rendered honestly and logged — a KILL is a good outcome, not a failure

