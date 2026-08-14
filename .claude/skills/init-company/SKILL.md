---
description: 'Runs the company''s Phase 0 first-run sequence: confirms the company/ workspace and agent state files are in place, initializes company_state.md, and begins broad problem discovery, ending in the first CEO report and a human approval gate. Use at the very start of a new company, or whenever company_state.md still shows PHASE 0.'
---

Follow master protocol §37 exactly. This project's `company/` tree already exists as a scaffold, so this is about verifying it, initializing state, and starting research — not creating folders from a blank repo.

1. Inspect the repository: confirm `company/`, `.claude/agents/`, and `.claude/skills/` exist and look intact. Note anything missing or unexpected.
2. Confirm the company structure matches `.claude/docs/file-system-map.md`. Create any genuinely missing piece; don't recreate what's already there.
3. Initialize `company/company_state.md`: set the current phase to `PHASE 1 — MARKET + PROBLEM RESEARCH`, note today's date, confirm the autonomy mode (defaults to Unattended — see `CLAUDE.md`), and record that Phase 0 initialization is complete.
4. Confirm each file under `company/agents/*/state.md` has the ROLE / MISSION / CURRENT OBJECTIVE / KNOWN FACTS / ASSUMPTIONS / OPEN QUESTIONS / EVIDENCE / DECISIONS / FAILED ATTEMPTS / NEXT ACTIONS skeleton from master protocol §6, and fill in ROLE and MISSION for each from `.claude/docs/agent-directory.md`.
5. Confirm `company/research/research_log.md` exists and is ready to receive entries.
6. State the research methodology you're about to follow (master protocol §7) in `company/research/research_log.md`'s first entry: what you'll search for, in what order, and how you'll cross-check.
7. Hand off to Phase A of the `run-autonomous` skill if the autonomy mode is Unattended — it owns the research → score → contrarian-attack loop, repeating with genuinely new angles until a candidate clears the bar in master protocol §11, rather than reporting whatever the first pass turns up. In Supervised mode, run that same loop just once per this skill's original steps: generate a real candidate pool (not just one idea), investigate competitors for the most promising candidates, invoke `score-ideas`, produce a shortlist of the strongest 3–6, and invoke `contrarian-attack` on the top candidate.
8. Delegate to the `ceo` agent to prepare the CEO recommendation once a candidate clears the bar (or, in Supervised mode, once the single pass above is done regardless of how strong the result is).
9. STOP. Do not begin building anything.
10. Invoke the `ceo-report` skill to produce the first CEO report in the master protocol §38 format, then the `gate-check` skill to ask the human for `YES` before moving to the next major phase. This is stop-condition 1 in `CLAUDE.md` and applies in both modes — it is the one checkpoint Unattended mode does not skip.

Do not write a line of product code during this skill. The only acceptable outputs of Phase 0 are research, documentation, and the CEO report. Once the human approves, `run-autonomous` Phase B takes over the build in Unattended mode; in Supervised mode, proceed department by department through `gate-check` as originally specified.
