# Company workspace

This folder is the autonomous company's persistent memory (master protocol §5). Nothing that
matters should live only in a chat conversation — if it's not written here, treat it as not
having happened yet.

Start with `company_state.md` to see what phase the company is in right now, then
`decisions.md` for what's already been decided. For a guided tour of every file and folder
here, see `.claude/docs/file-system-map.md` at the project root. For the people and skills
that read and write these files, see `.claude/docs/agent-directory.md`.

This workspace starts empty of real content on purpose — master protocol §29 forbids inventing
market data, customer quotes, or research findings, so nothing here is pre-filled with
plausible-sounding fiction. Run the `init-company` skill (or just start a session — `CLAUDE.md`
tells Claude to check `company_state.md` and route there automatically) to begin Phase 0.
