---
description: Writes the daily company report to company/daily_report.md, summarizing what happened, what was learned, what changed, what failed, what was built, what remains, the current biggest risk and opportunity, and the next decision. Use at the end of a work cycle, or whenever asked for a status update shorter than the full weekly report.
---

Write master protocol §31's daily report, overwriting `company/daily_report.md` with today's date and:

```
DATE:

WHAT HAPPENED:

WHAT WAS LEARNED:

WHAT CHANGED:

WHAT FAILED:

WHAT WAS BUILT:

WHAT REMAINS:

CURRENT BIGGEST RISK:

CURRENT BIGGEST OPPORTUNITY:

NEXT DECISION:
```

Pull from `company/history/audit_log.md`, the day's handoffs, and `company/company_state.md` — don't reconstruct the day from memory alone if the files disagree with your recollection; the files are the source of truth. Keep each section to what actually happened in this cycle, not a running summary of the whole company's history — that belongs in the weekly report and `company/history/milestones/`.
