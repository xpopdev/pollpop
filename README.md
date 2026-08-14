# Autonomous AI Company

A [Claude Code](https://claude.com/product/claude-code) project that turns the master
"Autonomous AI Company" prompt into an actual working setup: subagents for every department,
workflow skills for every recurring process, permissions that enforce the prompt's own
autonomy levels, and a pre-built persistent-memory workspace — instead of one giant prompt
pasted into a chat.

**This project defaults to Unattended mode**: minimal stopping, built to run continuously under
`claude --dangerously-skip-permissions` until it finds and validates a product idea, hands it
to you for one review, and then keeps building. Read this whole README, especially the
"Unattended mode" and "Before you use the flag" sections, before you run it that way.

## What's here

```
.
├── CLAUDE.md                 Always-loaded operating instructions: identity, autonomy mode,
│                              session-start checklist, stop-conditions, non-negotiable rules
├── .claude/
│   ├── settings.json          Permissions (allow/ask/deny) + the autonomy cross-check hook
│   ├── hooks/
│   │   └── check_bypass_mode.py   Warns if company_state.md says Unattended but the session
│   │                               doesn't actually look like it's running the bypass flag
│   ├── docs/                  Reference docs for humans and for Claude on demand
│   │   ├── master-protocol.md       The original spec, reproduced in full, unaltered
│   │   ├── autonomy-and-permissions.md   The two control layers, the flag, the hook, sandboxing
│   │   ├── agent-directory.md       Every subagent, what it owns, and the org hierarchy
│   │   └── file-system-map.md       Annotated tour of company/
│   ├── agents/                 19 subagents — one per department/role (see agent-directory.md)
│   └── skills/                 13 workflow skills, invocable as /run-autonomous, /init-company,
│                                /research-phase, /score-ideas, /contrarian-attack,
│                                /red-team-review, /validate-hypothesis, /quality-bar,
│                                /handoff, /gate-check, /daily-report, /weekly-report,
│                                /ceo-report
└── company/                   The company's persistent memory — empty scaffold, no invented
                                 content (see company/README.md and file-system-map.md)
```

## Unattended mode (the default)

`company/company_state.md` starts with **Autonomy mode: UNATTENDED**. In this mode, the company
doesn't stop at every phase or department transition the way the original master prompt
specifies — it keeps going through research, scoring, building, testing, and improving on its
own, driven by the `/run-autonomous` skill, and only pauses for six specific conditions defined
in `CLAUDE.md` (mainly: the one idea-review checkpoint before building starts, and anything
that spends money, publishes, deploys, or acts on your behalf externally). Switch to the
original phase-by-phase cadence any time by editing that one line in `company_state.md` to
`SUPERVISED`, or just telling Claude to switch modes.

## Before you use the flag

Unattended mode is built around `claude --dangerously-skip-permissions`, which removes **every**
permission prompt Claude Code has — not just the ones this project's `settings.json` would
otherwise ask about. Two things worth knowing before you run it:

1. **It's a different flag from `--allow-dangerously-skip-permissions`.** That similarly-named
   flag only makes bypass mode available to switch into later via Shift+Tab — it doesn't start
   the session unattended, and doesn't work for a "leave it running" use case on its own. If
   you want genuine 24/7 operation, you want `--dangerously-skip-permissions` (equivalently,
   `--permission-mode bypassPermissions`).
2. **Run it in a container or VM, not your main machine.** This is Anthropic's own guidance for
   this flag, not just this project's — with permission checks off, nothing stops a bad
   decision from actually executing. `.claude/settings.json`'s `deny` rules are a second layer,
   not a substitute for real isolation; a `.claude/hooks/check_bypass_mode.py` cross-check will
   warn Claude if it looks like `company_state.md` and the session's real permission mode don't
   match, but that's a safety net for a config mistake, not for the underlying risk of running
   unattended in the first place.

To actually keep it running for hours or days rather than one session, use Claude Code's own
mechanisms for that — `/background` (or `claude --bg`) to detach a persistent session, or
headless `claude --dangerously-skip-permissions -p "..." --continue` on a schedule. See
`.claude/docs/autonomy-and-permissions.md` for the full reasoning, and check Claude Code's own
docs for the current exact flags — this part of the product moves quickly.

## Running it

1. Install [Claude Code](https://claude.com/product/claude-code) if you haven't already.
2. Unzip this project and open a terminal in its root folder (the one with this README).
3. Decide Supervised or Unattended (default) — see above — then launch accordingly:
   `claude --dangerously-skip-permissions` for Unattended, or plain `claude` if you'd rather
   switch `company_state.md` to Supervised and approve each phase yourself.
4. Just start talking, or say something like "begin Phase 0." `CLAUDE.md` tells Claude to
   check `company/company_state.md` on its own and route into `/init-company` for a fresh
   company, then `/run-autonomous` once research is underway. Expect the first real stop to be
   the idea-review checkpoint — a full CEO report backed by real research, with an explicit
   ask for your `YES` — before any product code gets written.

## Adjusting permissions

`.claude/settings.json` is checked in and shared. For personal, machine-specific loosening,
create a `.claude/settings.local.json` (Claude Code gitignores it automatically) rather than
editing the shared file — and note that `.claude/settings.json` itself is in the `ask` list, so
an agent can't quietly widen its own permissions without you seeing a prompt for it (in
Supervised mode, or in any session not running under the bypass flag).

## Adding a role or workflow

The master protocol explicitly allows creating additional roles when required (§1). Copy the
closest file in `.claude/agents/` or `.claude/skills/`, adjust it, and add a row to
`.claude/docs/agent-directory.md` so it's discoverable. Everything here was generated from
`.claude/docs/master-protocol.md` — if something in this project ever seems to contradict that
file, check `company/decisions.md` first for a recorded, intentional amendment (like the
Unattended-mode default) before assuming it's a bug.
