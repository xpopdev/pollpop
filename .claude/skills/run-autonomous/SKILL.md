---
description: "Runs the company's continuous Unattended-mode loop: cycles research, scoring, and contrarian-attack until a candidate idea clears the bar, presents it to the human with full research and stops for explicit approval, then continuously builds, tests, reviews, and improves the product through the full set of subagents and skills \u2014 only pausing for the six conditions in CLAUDE.md. Use this to enter or resume the main loop instead of working one ad hoc step at a time, whenever company_state.md shows Unattended mode."
---

This skill is the outer loop. It does not do research, scoring, or engineering itself — it
sequences the subagents in `.claude/agents/` and the other skills in `.claude/skills/`, the same
way a COO runs a company by directing departments rather than doing every job personally. Every
step below should show up in the transcript as a delegation (an Agent-tool call or another
skill invocation), not as this skill freehanding the work inline.

Before starting, read `company/company_state.md`. If autonomy mode is Supervised, stop — this
skill is for Unattended mode only; use the individual skills and `gate-check` directly instead.

## Phase A — find an idea worth building (skip if one is already approved)

Loop the following until a candidate clears the bar below, checking the stop-conditions in
CLAUDE.md after every round (a round that produces no new signal at all, repeated, is itself
grounds for stop-condition 5 — deadlock):

1. Delegate to `research-phase` (which itself delegates to head-of-research / market-researcher)
   for a genuinely new angle each round — don't repeat a search that's already logged in
   `company/research/research_log.md`.
2. Once there's a real candidate pool, run `score-ideas`.
3. Run `contrarian-attack` against the top-scoring candidate(s).
4. Check the bar: does the surviving top candidate meet every condition in master protocol
   §11 — problem evidence, credible user need, insufficient current solutions, plausible
   technical feasibility, real differentiation, and an actual validation plan — **and** does it
   have a Viral Mechanism Strength score above the disqualifying threshold from `score-ideas`
   (a specific, falsifiable growth loop, not just "people will probably share this") — and did
   it survive the contrarian attack, including the viral-specific attack questions, without an
   unaddressed fatal flaw?
   - **Bar cleared** → delegate to the `ceo` agent to write the selection rationale, then go to
     Phase A checkpoint below.
   - **Bar not cleared** → log why in `company/research/opportunity_map.md` (per-candidate, not
     just a vague "not good enough"), append the round to `company/research/research_log.md`,
     and loop back to step 1 with a genuinely different research angle — a different problem
     space, not the same one scored again.

### Phase A checkpoint — the one mandatory stop

Run `ceo-report` to produce the full master protocol §38 report, sourced from real files, not
summarized from memory. Immediately follow it with `gate-check` and then stop the turn — do not
continue into Phase B in the same turn, and do not treat anything short of a clear, explicit
approval as a green light. This is stop-condition 1 from CLAUDE.md; it is not optional and
Unattended mode does not skip it.

If the human's reply approves the recommendation, write the decision to
`company/decisions/approved.md`, update `company/company_state.md` to `PHASE 2 — BUILD`, and
continue into Phase B (in this turn or the next one). If the reply asks for changes or names a
different candidate, treat that as new direction and loop back into Phase A with it. If the
reply is ambiguous, that's stop-condition 3 — ask directly what they mean rather than guessing.

## Phase B — build, test, and improve continuously

Once a product is approved, loop the following without stopping between iterations, checking
the stop-conditions in CLAUDE.md after every one:

1. Delegate to `cpo` and `product-manager` (first pass only) to turn the approved idea into
   `company/product/problem.md`, `users.md`, `requirements.md`, and `product_spec.md`, and to
   `cto` for `company/product/architecture.md`.
2. Delegate to `engineering-manager`, who breaks the current increment down and delegates to
   `backend-developer`, `frontend-developer`, `ai-ml-engineer`, and `devops-engineer` as needed.
3. Delegate to `qa-lead` to actually run tests against what was just built, not just review it.
4. Periodically (at least before anything that could become a release, and whenever a
   meaningful increment lands) delegate to `security-engineer` and run `red-team-review`.
5. When a claim needs testing rather than assuming, run `validate-hypothesis` — don't spend a
   week building on an assumption nobody has checked in a day.
6. Run `handoff` at the end of each increment so the next iteration (possibly a fresh session,
   in a long unattended run) can pick up cleanly from `company/history/agent_handoffs/`.
7. Run `daily-report` at the end of each work cycle. Run `weekly-report` roughly every seven
   cycles, or when asked for a broader status check.
8. Once the increment looks plausibly complete, run `quality-bar`. Log the result honestly —
   a failing item is a to-do, not a stop condition — and either loop back to fix what's
   unchecked, or, once every item is genuinely checked, record the MVP milestone in
   `company/history/milestones/` and move into master protocol §40's continuous-improvement
   framing: keep researching better architecture, lower cost, better UX, and new opportunities,
   using the same subagents, indefinitely.
9. Delegate to `growth-analytics-manager` periodically to keep `company/metrics/` and
   `company/research/competitor_watch.md` current, since those inputs feed back into what
   "improve" means at step 8.

Loop steps 2–9 continuously. The only things that pause this loop are the six conditions in
CLAUDE.md — not a finished increment, not a passing or failing test run, not an MVP checklist
result, not a natural-feeling stopping point. If nothing is blocking, start the next increment.
