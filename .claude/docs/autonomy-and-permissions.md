# Autonomy levels and permissions

This project has **two independent layers of control**, and the biggest source of confusion
in setups like this one is treating them as one thing:

1. **Tool permissions** — whether Claude Code pauses to ask before a specific tool call runs.
   Controlled entirely by how the session was started (a CLI flag or Shift+Tab) and by
   `.claude/settings.json`'s `allow` / `ask` / `deny` rules. Nothing in `CLAUDE.md` or any
   skill can change this — it's enforced by Claude Code itself, outside the conversation.
2. **Workflow gates** — whether Claude stops mid-task to ask "should I keep going?" This is
   pure behavior, defined by `CLAUDE.md` and the skills, and it's the layer the human owner
   amended when they asked for 24/7 unattended operation. See `company/decisions.md` for the
   dated record.

Unattended mode only makes sense as a combination of both: tool permissions bypassed (so there's
no one to answer a prompt at 3am) *and* workflow gates relaxed (so the company doesn't stop
itself every few minutes waiting for a human who isn't there). Getting only one half doesn't
work — either Claude Code stalls on a permission prompt anyway, or workflow gates are relaxed
but every risky command is still bypassed for a human who's actually watching and would have
preferred to be asked.

## Layer 1: which flag actually does what

| Flag | What it does | Good for |
| --- | --- | --- |
| `claude --dangerously-skip-permissions` | Starts the session with **every** tool call pre-approved from the first prompt. Equivalent to `--permission-mode bypassPermissions`. | Genuine unattended operation — this is the one this project's Unattended mode is built for. |
| `claude --allow-dangerously-skip-permissions` | Does **not** start in bypass mode. It adds `bypassPermissions` to the Shift+Tab mode cycle so a human sitting at the terminal can switch into it mid-session. | Working interactively and wanting the option to drop permission prompts for a stretch, without committing to it at launch. Does **not**, by itself, enable unattended operation — a human still has to press Shift+Tab. |

If the goal is "leave it running and check back later," use `--dangerously-skip-permissions`
(or the equivalent `--permission-mode bypassPermissions`, or `defaultMode: "bypassPermissions"`
in settings). If what's actually needed is `--allow-dangerously-skip-permissions`, this project
will still work, but expect it to behave like Supervised mode until someone manually switches
into bypass — see the cross-check hook below for how this project tries to catch that
mismatch.

The first time a session actually enters bypass mode, Claude Code shows a one-time warning that
has to be accepted. That warning exists on purpose; reading it is worth the ten seconds.

## Layer 2: workflow gates (`CLAUDE.md`'s stop-conditions)

The master protocol's original design (§12, §35) stops at every phase and department
transition. That's still exactly what happens in **Supervised** mode. **Unattended** mode
(the default — see `company/company_state.md`) replaces that with six specific
stop-conditions, spelled out in `CLAUDE.md`, and otherwise keeps the company moving through
research, scoring, building, testing, and improving on its own. The six conditions, briefly:
the one mandatory idea-review checkpoint, any Level 3 action, genuine strategic ambiguity, a
missing resource/credential, real deadlock after repeated failed attempts, and anything legal,
safety, or ethical that's outside the agent's call to make alone. `CLAUDE.md` is the source of
truth for the exact wording — this file explains the reasoning, not a second copy of the list.

Two things this amendment deliberately does **not** relax, in either mode:

- The idea-review checkpoint. Committing the company to a direction is exactly the kind of
  decision this whole project exists to keep a human in the loop on, so it stays a hard stop
  even in Unattended mode.
- Level 3 actions (§35): spending money, publishing or deploying externally, sending
  communications on the human's behalf, irreversible actions outside the repo. No autonomy
  mode, and no prior approval, waives these — they're asked about every time, in the moment.

## Layer 1, in detail: `.claude/settings.json`

Regardless of autonomy mode, `permissions.allow` covers day-to-day research, writing, and
engineering: full `Read`/`Edit`/`Grep`/`Glob`, `WebSearch`/`WebFetch`, `Agent`/`Skill`
delegation, low-risk `git` (status/diff/log/commit/branch/checkout/stash — committing locally,
not publishing), and common build/test/lint tooling. `permissions.ask` forces a prompt on
`git push`, `rm`, publish/deploy commands, and edits to the settings files themselves, even if
an agent tries them without thinking. `permissions.deny` hard-blocks `rm -rf`, `sudo`/`su`,
force-pushing, raw `curl`/`wget`, and reading `.env`/secrets/credential paths.

**Under `--dangerously-skip-permissions`, most of this stops mattering.** Bypass mode skips
essentially every permission check Claude Code has, which is the entire point of the flag —
that's what makes unattended operation possible in the first place. Treat the `deny` rules as
a second layer that helps when bypass *isn't* active (a Supervised session, or a stray
sub-session run without the flag), not as something to lean on once it is. The actual safety
boundary under bypass mode is whatever isolates the machine Claude Code is running on —
see the sandboxing note below — not this file.

## The cross-check hook

`.claude/hooks/check_bypass_mode.py`, wired into `PreToolUse` in `settings.json`, is a
best-effort attempt to catch the most common way this setup goes wrong: `company_state.md` says
Unattended, but the session wasn't actually started with the bypass flag, so it's quietly
stalling on permission prompts nobody's there to answer. It reads the session's real
`permission_mode` (a field Claude Code hands to hooks — not something this project can query
any other way) and, if it detects a genuine mismatch, adds a short warning to Claude's context
so it can flag the problem to you directly.

This is a cross-check, not a control: it never blocks a tool call and never flips
`company_state.md` on its own. Treat a warning from it as reliable when it fires — but treat
its *silence* as inconclusive, not as confirmation everything is fine, for a few honest
reasons: some Claude Code versions/events don't expose `permission_mode` to hooks at all, the
check is debounced to roughly every 15 minutes so it won't catch a mismatch instantly, and hook
mechanics are one of the faster-moving parts of Claude Code, so treat the exact field names and
behavior here as best-effort rather than guaranteed. If something about tool-call behavior
doesn't match what `company_state.md` claims, believe your own observation over this hook.

## Running this unattended for real

Neither `CLAUDE.md` nor this file can keep a session *alive* — that's a Claude Code feature,
not a project-config one. For an actual long-running, check-back-later loop, use Claude Code's
own mechanisms for it: `/background` (or `claude --bg`) to detach a session that keeps running
on its own, or headless `claude --dangerously-skip-permissions -p "..." --continue` invoked on
a schedule (cron, a wrapper loop, or a cloud Routine) so each invocation picks the company back
up from `company/` where the last one left off — this is exactly why the master protocol's
filesystem-as-memory design (§5, §6) matters as much as it does here. Check Claude Code's own
docs or `/help` for the current exact flags; this is an area of the product that moves quickly.

## Sandboxing — read this before actually using the flag

Anthropic's own guidance, and the strong consensus of everyone who writes about this flag, is
the same: run `--dangerously-skip-permissions` only inside an isolated environment — a
container or VM with no credentials it doesn't need and nothing on it you'd mind losing. The
containment is what's actually doing the safety work once permission prompts are gone; nothing
in this repository's config can substitute for it. If this company's autonomous loop is going
to run for hours or days unattended, that's more reason to sandbox it, not less — a mistake
compounds every cycle it isn't caught.

## Adjusting any of this

- Personal, machine-specific changes belong in `.claude/settings.local.json` (gitignored).
- Switching autonomy mode is a one-line edit to `company/company_state.md`, or just tell
  Claude directly which mode to use.
- If you add a new Level 3-style capability (a payments MCP server, an email-sending tool),
  add matching `ask`/`deny` rules here in the same change — don't rely on remembering to ask a
  subagent nicely.
