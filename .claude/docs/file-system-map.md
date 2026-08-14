# Company file-system map

Everything under `company/` is the company's persistent memory (master protocol §5). If it
isn't written down here, it didn't happen — conversations end and compact, files don't.

```text
company/
├── README.md              Orientation for anyone (human or agent) opening this folder cold
├── mission.md              The company's mission once Phase 1 selects a direction (not before)
├── company_state.md         Single source of truth for "what phase are we in right now"
├── decisions.md              Running index of every major decision (§26) — append, don't rewrite
├── assumptions.md            Assumptions currently in play, and their status
├── daily_report.md          Most recent daily cycle summary (§31) — overwritten each cycle
├── weekly_ceo_report.md      Most recent weekly CEO report (§32) — overwritten each week
│
├── research/                Everything from before a product is chosen (§7)
│   ├── market/                Market-level findings, sized opportunities
│   ├── problems/               One file per problem investigated
│   ├── competitors/            One file per competitor, using the §7 competitor record format
│   ├── technologies/           Technical approaches, papers, OSS projects considered
│   ├── trends/                 Broader trend research that informs timing
│   ├── customer_pain/          Raw evidence of pain: complaints, forum threads, interviews
│   ├── architecture_hypotheses/ AI/ML architecture hypotheses (§23), one file each
│   ├── opportunity_map.md      Synthesized candidate list with scores (§8, §9)
│   ├── research_log.md         Chronological log of what was researched and found
│   ├── rejected_ideas.md       Every rejected idea and why (§11) — never delete an entry
│   └── competitor_watch.md     Ongoing competitor monitoring (§25)
│
├── strategy/                 Once a direction is chosen
│   ├── vision.md
│   ├── strategy.md
│   ├── product_strategy.md
│   ├── business_model.md
│   └── roadmap.md
│
├── product/                  Product Agent output (§15)
│   ├── problem.md
│   ├── users.md
│   ├── requirements.md
│   ├── architecture.md
│   ├── ux.md
│   └── product_spec.md
│
├── engineering/               Engineering Agent output (§17) — the actual product code lives
│   ├── architecture/            outside `company/`, at the project root, once building starts;
│   ├── implementation/          these subfolders hold planning docs, decisions, and notes,
│   ├── tests/                   not the code itself
│   ├── benchmarks/
│   ├── security/
│   └── performance/
│
├── agents/                   Per-department memory (§6): ROLE / MISSION / CURRENT OBJECTIVE /
│   ├── ceo/state.md            KNOWN FACTS / ASSUMPTIONS / OPEN QUESTIONS / EVIDENCE /
│   ├── research/state.md       DECISIONS / FAILED ATTEMPTS / NEXT ACTIONS. Distinct from
│   ├── product/state.md        `.claude/agents/*.md`, which define *how* each subagent
│   ├── engineering/state.md    behaves — these files record *what a department currently
│   ├── qa/state.md             knows*, and are updated by whichever subagent is acting in
│   ├── security/state.md       that department this session.
│   ├── growth/state.md
│   └── operations/state.md
│
├── experiments/               General experiment log (§21)
│   ├── hypotheses.md
│   ├── experiment_log.md
│   └── results/
│
├── validation/                Specifically "does anyone want this" validation (§20) —
│   ├── hypotheses.md            distinct from `experiments/`, which covers technical
│   ├── experiments.md           feasibility experiments ("can the algorithm work")
│   └── results.md
│
├── metrics/                  Metrics engine (§22). Anything without real data is labeled
│   ├── product_metrics.md      ESTIMATE — never fabricated.
│   ├── engineering_metrics.md
│   └── business_metrics.md
│
├── decisions/                 Structured decision buckets, referenced by §11 and §26
│   ├── pending.md
│   ├── approved.md              product_selection.md-style entries land here once decided
│   └── rejected.md
│
└── history/                  Audit trail
    ├── sessions/                Optional per-session notes
    ├── agent_handoffs/          One file per handoff (§13): YYYY-MM-DD_<from>_to_<to>.md
    ├── milestones/              Notable completed milestones
    └── audit_log.md             Chronological log of what happened, including failures (§28)
```

## Where does the actual product code go?

Not under `company/`. Once Phase 1's gate is cleared and engineering begins, create the
product's own source tree at the project root (e.g. `src/`, or a properly named app directory)
alongside `company/` and `.claude/`. `company/engineering/` holds planning, architecture notes,
and decisions *about* that code — not the code itself.
