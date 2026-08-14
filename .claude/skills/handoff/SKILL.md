---
description: Writes a structured agent-handoff file recording what one department knew, decided, and left unresolved for the next, in the master protocol's exact format, at company/history/agent_handoffs/. Use at the end of a work session, or whenever work is about to move from one department or subagent to another.
argument-hint: '[from-agent] [to-agent]'
---

Write a handoff from $ARGUMENTS (or, if not given, infer the source and target agents from the current conversation) following master protocol §13 exactly.

Create `company/history/agent_handoffs/YYYY-MM-DD_<from>_to_<to>.md` (use today's date, and the agent names from `.claude/docs/agent-directory.md`) with these exact fields, each filled in honestly — an empty or "N/A" field is fine if genuinely true, but don't skip a field because it's inconvenient:

```
SOURCE AGENT:
TARGET AGENT:

OBJECTIVE:

WHAT WE KNOW:

EVIDENCE:

ASSUMPTIONS:

DECISIONS:

OPEN QUESTIONS:

FAILED APPROACHES:

FILES TO READ:

EXPECTED OUTPUT:

SUCCESS CRITERIA:
```

Be specific in FILES TO READ — exact paths, not "check the research folder." The next agent (or the next session of the same agent) should be able to start productive work having read only this file and the paths it names, without re-deriving context from the chat history. After writing it, note in `company/company_state.md` that a handoff is waiting.
