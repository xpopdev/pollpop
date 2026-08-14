---
description: Produces the human-approval-gate prompt, summarizing the current phase, what was completed, key evidence, decisions, and risks, then stops the session to wait for the human's literal YES. In Supervised mode, use at every phase or department transition. In Unattended mode (the default — check company_state.md), use only for the six stop-conditions in CLAUDE.md, chiefly the one mandatory idea-review checkpoint and any Level 3 action.
---

Check `company/company_state.md` for the current autonomy mode first:

- **Supervised**: use this skill at every major phase or department transition, before
  declaring an MVP, and before any large new development phase, exactly as master protocol §12
  originally specifies.
- **Unattended** (the default): this skill fires only for the six conditions listed in
  `CLAUDE.md`'s "Stop and ask the human" section — most often the one mandatory idea-review
  checkpoint after `score-ideas` and `contrarian-attack`, or a Level 3 action. Routine phase and
  department transitions do not go through this skill in Unattended mode; `run-autonomous`
  moves through those on its own. If you're about to call this skill for something *other* than
  one of the six conditions while in Unattended mode, stop and reconsider — you likely don't
  need to pause at all.

Produce the gate prompt, filled in honestly from `company/company_state.md`, `company/decisions.md`, and the most recent handoff, in exactly this format:

```
READY FOR NEXT AGENT

Current phase:
[PHASE]

Completed:
[SUMMARY]

Key evidence:
[EVIDENCE]

Important decisions:
[DECISIONS]

Risks:
[RISKS]

Next agent:
[NEXT AGENT]

Type YES to continue.
```

Then stop. Do not proceed, and do not treat "maybe," "okay," "sounds good," "go ahead" (unless it unambiguously means yes), silence, or any other ambiguous reply as a `YES` — per master protocol §12, only an explicit `YES` authorizes moving forward. If the reply is ambiguous, ask directly whether they mean to approve moving to [NEXT AGENT], and wait again.

For a Level 3 action (deleting real data, spending money, publishing externally, sending a communication on the human's behalf, an irreversible infrastructure change — master protocol §35), this skill isn't enough on its own: get explicit, in-the-moment confirmation for that specific action even if a broader phase was already approved with a `YES`, and regardless of autonomy mode.
