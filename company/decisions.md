# Decisions log

> Running index of every major decision (master protocol §26). Append new entries at the top;
> never delete or silently rewrite a past entry — if a decision changes, add a new entry that
> supersedes it and say so explicitly (see the OLD DECISION / NEW DECISION format in master
> protocol §6). This file prevents agents from endlessly re-litigating settled questions.

Use this format for every entry:

```
## <short decision title> — <date>

Decision:
Context:
Options considered:
Evidence:
Chosen option:
Why:
Risks:
Reversal conditions:
Owner:
```

---

## Default to Unattended autonomy mode, replacing per-phase approval gates — 2026-08-14

Decision: Run this company in Unattended mode by default — most workflow gates from master
protocol §12/§35 are replaced with six specific stop-conditions (see `CLAUDE.md`), and the
company otherwise runs continuously through research, scoring, building, testing, and
improving via the `/run-autonomous` skill.

Context: The master protocol as originally written stops at every major phase and department
transition to ask the human owner for an explicit `YES`. The human owner requested a version
that runs autonomously and continuously — intended to be used only with a Claude Code session
started under `--dangerously-skip-permissions` — stopping only when genuinely unsure how to
proceed, presenting a validated product idea for one review before building starts, and then
continuing to build without further phase-by-phase approval.

Options considered: (a) keep every gate from §12/§35 as originally specified — rejected, directly
contradicts the request; (b) remove all gates entirely — rejected, removes the one checkpoint
(product selection) and the Level 3 protections (§35) that matter regardless of autonomy
preference; (c) replace frequent phase gates with a small, explicit set of stop-conditions plus
one mandatory checkpoint — chosen.

Evidence: Direct instruction from the human owner. Anthropic's own guidance on
`--dangerously-skip-permissions` (see `.claude/docs/autonomy-and-permissions.md`) informed the
sandboxing note and the decision to keep Level 3 protections absolute regardless of mode.

Chosen option: (c). Implemented as a new `company_state.md` field (`Autonomy mode`), a new
"Stop and ask the human" section in `CLAUDE.md`, a new `/run-autonomous` skill, and light edits
to `gate-check`, `init-company`, `quality-bar`, `ceo`, and `coo` to reflect the new default.
Supervised mode (the original cadence) remains fully available by changing one line.

Why: Honors the request while keeping the two protections that don't make sense to remove
regardless of autonomy preference — a human still decides what the company builds, and Level 3
actions still get asked about in the moment, every time.

Risks: Unattended mode only works correctly if the session was actually started with the bypass
flag; if it wasn't, tool calls will pause on permission prompts nobody's there to answer,
independent of anything in this file. A best-effort hook
(`.claude/hooks/check_bypass_mode.py`) tries to catch that mismatch but isn't guaranteed to.
Running with all permission checks off also removes Claude Code's own safety prompts entirely,
which is why the sandboxing note in `.claude/docs/autonomy-and-permissions.md` exists.

Reversal conditions: Switch `company/company_state.md`'s Autonomy mode field to `SUPERVISED` at
any time to fully restore the original per-phase gate cadence — no other file needs to change.

Owner: Set by the human owner; implemented by Claude per that instruction.

## Retarget mission focus to viral / product-led-growth products — 2026-08-14

Decision: Point the company's idea-discovery and scoring toward products with a real,
evidence-backed viral or product-led-growth mechanism, rather than master protocol §3's
original preference for unglamorous enterprise/developer pain points. Both consumer virality
and product-led-growth virality qualify; research is not pre-narrowed to one.

Context: The human owner asked directly for the company to come back with a viral product. §3
as originally written explicitly steers away from "another social network," "another AI
wrapper," and consumer-facing products generally, in favor of painful workflows and enterprise
software — a direct conflict with the request that needed an explicit amendment rather than a
silent reinterpretation.

Options considered: (a) leave §3's preferences as originally written and treat "viral" as just
one more scoring factor among eleven equally-weighted ones — rejected, doesn't actually reflect
that the human owner named this as the goal, not a preference; (b) replace problem-validation
rigor with a pure popularity/growth-hacking bar — rejected, contradicts master protocol §29's
no-hallucination rule and this company's whole evidence-driven design, and vanity-metric growth
without retention isn't a business; (c) keep full evidence-driven validation, but add a
specific, falsifiable Viral Mechanism as a required field on every candidate, a semi-gating
score dimension, and a dedicated attack angle for the contrarian agent — chosen.

Evidence: Direct instruction from the human owner ("what i want is to the come to mee with an
viral product"). No market data was fabricated to justify this — it's a stated goal, not a
research finding, and is recorded as such.

Chosen option: (c). Implemented via a new "Mission focus" section in `CLAUDE.md`; an added
Viral Mechanism field and Viral Mechanism Strength scoring dimension in `score-ideas` and
`opportunity_map.md`; viral-specific attack questions added to the `contrarian` agent; expanded
research directives in `market-researcher` and `head-of-research` covering platform/consumer
trends alongside the original B2B pain-point focus; viral metrics (K-factor, share rate, paired
with referred-user retention) added to `growth-analytics-manager`; and light updates to `cpo`
and `ux-designer` to treat the growth mechanism as a core design constraint, not a bolt-on.

Why: This satisfies the actual request while preserving the parts of the original design that
don't make sense to drop regardless of product category — nothing here is allowed to be
asserted as validated or profitable without evidence, and virality claims specifically get
extra scrutiny given how prone they are to survivorship bias and vanity metrics.

Risks: "Viral" is a genuinely harder bar than "solves a real problem for a paying niche" —
fewer ideas will clear it, and the research→score→contrarian-attack loop in `run-autonomous`
may need more rounds before something passes. A candidate could also look viral in early,
small-sample data and not hold up — `growth-analytics-manager`'s pairing of K-factor with
referred-user retention exists specifically to catch that.

Reversal conditions: To fully revert to the original §3 preferences, remove the "Mission focus"
section from `CLAUDE.md` and the Viral Mechanism Strength gate from `score-ideas`; to keep
virality as one factor among many rather than a semi-gating one, change its treatment in
`score-ideas` without removing it entirely.

Owner: Set by the human owner; implemented by Claude per that instruction.
