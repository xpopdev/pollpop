#!/usr/bin/env python3
"""PreToolUse hook: cross-checks the session's real permission_mode against the autonomy
mode this project declares in company/company_state.md.

This is a cross-check, not a switch. It never blocks a tool call and never changes Claude's
behavior on its own -- it only ever adds a short note to context via additionalContext when it
finds a likely mismatch (company_state.md says Unattended, but the session doesn't actually
look like it was started with --dangerously-skip-permissions). Silence from this hook is not
proof of anything: it means no mismatch was detected on this check, not that one was ruled out.

Debounced to roughly once every 15 minutes so it doesn't spawn a process on every single tool
call during a long unattended run. Every failure mode below is designed to fail silent rather
than block or error loudly -- worst case, the warning just doesn't fire.
"""
import json
import os
import re
import sys
import time

DEBOUNCE_SECONDS = 900  # 15 minutes


def main():
    try:
        raw = sys.stdin.read()
        event = json.loads(raw) if raw else {}
    except Exception:
        sys.exit(0)  # can't parse input -- stay silent, never block

    permission_mode = event.get("permission_mode")  # may be absent on some events/versions

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    cache_path = os.path.join(project_dir, ".claude", ".autonomy-check-cache")

    try:
        if time.time() - os.path.getmtime(cache_path) < DEBOUNCE_SECONDS:
            sys.exit(0)  # checked recently enough, stay cheap
    except OSError:
        pass  # no cache yet -- fall through and check now

    try:
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        with open(cache_path, "w") as f:
            f.write(f"{permission_mode}\n")
    except OSError:
        pass  # non-fatal -- worst case we check again next call instead of in 15 minutes

    if permission_mode is None:
        sys.exit(0)  # inconclusive on this Claude Code version/event -- don't guess

    state_path = os.path.join(project_dir, "company", "company_state.md")
    try:
        state_text = open(state_path).read()
    except OSError:
        sys.exit(0)  # no state file to compare against yet (e.g. before init-company runs)

    m = re.search(r"Autonomy mode:\*\*\s*([A-Za-z]+)", state_text)
    configured_mode = m.group(1).strip().lower() if m else None

    if configured_mode != "unattended" or permission_mode == "bypassPermissions":
        sys.exit(0)  # Supervised mode, or Unattended and actually running in bypass -- fine

    warning = (
        "AUTONOMY MODE CROSS-CHECK: company/company_state.md is set to Unattended, but this "
        f"session's permission_mode is '{permission_mode}', not 'bypassPermissions'. Tool "
        "calls are likely pausing for approval, which defeats the point of Unattended mode. "
        "Tell the person directly, and suggest either restarting with "
        "'claude --dangerously-skip-permissions', or switching company_state.md to Supervised "
        "mode if that's actually what they want right now."
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "additionalContext": warning,
        }
    }))


if __name__ == "__main__":
    main()
