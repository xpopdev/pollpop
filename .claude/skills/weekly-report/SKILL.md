---
description: Generates the weekly CEO report to company/weekly_ceo_report.md covering company, product, research, engineering, QA, security, and market status, biggest wins, failures, risks, and opportunities, current metrics, and strategic recommendations. Use roughly weekly, or whenever asked for a broader status review than the daily report.
---

Write master protocol §32's weekly CEO report, overwriting `company/weekly_ceo_report.md`:

```
WEEK OF:

COMPANY STATUS:
PRODUCT STATUS:
RESEARCH STATUS:
ENGINEERING STATUS:
QA STATUS:
SECURITY STATUS:
MARKET STATUS:

BIGGEST WINS:
BIGGEST FAILURES:
BIGGEST RISKS:
BIGGEST OPPORTUNITIES:

METRICS:

STRATEGIC RECOMMENDATIONS:
```

Pull department status from each relevant `company/agents/<dept>/state.md` file rather than guessing, and pull METRICS from `company/metrics/` verbatim — label anything that's an ESTIMATE as such, don't quietly present it as measured. This report is meant for the human owner to read without opening any other file, so write it at that level of completeness, but don't pad it — a short, accurate section beats a long, vague one.
