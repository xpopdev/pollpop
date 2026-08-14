---
description: Runs a hostile internal review of the current build, or a specific named component, looking for bugs, security weaknesses, reliability problems, bad assumptions, misleading metrics, poor UX, scalability failures, and edge cases. Use before any release or MVP declaration, and any time engineering reports something as done and it matters that it actually is.
argument-hint: '[component name, or omit for a full-product review]'
---

Delegate to the red-team-reviewer agent to review $ARGUMENTS (or the full current product if no argument was given), per master protocol §19.

The review should actively try to break the target, looking for: bugs, security weaknesses, reliability problems, bad assumptions built into the design, misleading or cherry-picked metrics, poor UX, scalability failures, data corruption scenarios, unhandled edge cases, and failure-recovery gaps.

1. Have the red-team-reviewer agent actually exercise the target — read the real code and, where feasible, actually run it — rather than reviewing only the documentation about it.
2. Write every finding to `company/engineering/tests/` or `company/engineering/security/` as appropriate, with a severity and enough detail that engineering-manager can act on it without re-deriving the problem.
3. Summarize the severity distribution honestly at the end — don't let one paragraph of praise bury a critical finding, and don't pad a thin review with minor nitpicks to look thorough.
4. If this review is feeding into an MVP declaration, hand its output to the `quality-bar` skill rather than declaring readiness yourself.
