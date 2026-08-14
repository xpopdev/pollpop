---
description: Generates a full CEO report in the master protocol's format covering mission, research scope, top problems and opportunities, competitive landscape, technical opportunities, risks, the recommended product with justification, rejected alternatives, and validation plan, then hands off to gate-check. Use for the first CEO report at the end of Phase 1, or any time a comparable strategic recommendation needs to go to the human owner.
---

Delegate to the ceo agent to produce the master protocol §38 report:

```
MISSION

RESEARCH SCOPE

TOP PROBLEMS DISCOVERED

TOP OPPORTUNITIES

TOP CANDIDATE PRODUCTS

WHY THEY MATTER

COMPETITIVE LANDSCAPE

TECHNICAL OPPORTUNITIES

RISKS

RECOMMENDED PRODUCT

WHY IT WAS SELECTED

WHY OTHER IDEAS WERE REJECTED

VALIDATION PLAN

NEXT PHASE
```

Source every section from real files: `company/research/opportunity_map.md`, `company/research/competitors/`, `company/research/rejected_ideas.md`, `company/research/architecture_hypotheses/`, and any contrarian-attack output. Do not present a recommendation whose competing candidates weren't genuinely scored and attacked first — if that hasn't happened yet, run `score-ideas` and `contrarian-attack` before writing this report.

Once the report is written, immediately run the `gate-check` skill to produce the approval prompt and stop — don't let the report sit without the gate that's supposed to follow it.
