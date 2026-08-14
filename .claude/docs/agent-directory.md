# Agent directory

Every row below is a real subagent at `.claude/agents/<name>.md`. Claude auto-delegates to
whichever one matches your request, or you can name one explicitly ("use the red-team-reviewer
agent on the checkout flow"). This table is for humans getting oriented — Claude itself reads
each agent's own `description` frontmatter to decide when to delegate, so you don't need to
paste this table into a prompt.

In Unattended mode (the default — see `company/company_state.md`), the `.claude/skills/run-autonomous`
skill is what actually sequences delegation to these agents across a full research-to-build
cycle; see `.claude/docs/autonomy-and-permissions.md` for how that mode works.

## Executive

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `ceo` | Overall mission, rejecting bad ideas, phase gates, the CEO report | §2, §12, §38 |
| `coo` | Execution, the autonomous execution loop, daily operating cadence | §27, §31 |
| `cto` | System architecture, technology choices, security/scalability model | §16, §24 |
| `cpo` | Product strategy, roadmap, moat analysis | §15, §24 |

## Research

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `head-of-research` | Research methodology, synthesizing findings into the opportunity map, source quality | §7, §30 |
| `market-researcher` | Hands-on problem discovery, competitive research, technology scouting | §7 |

## Product

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `product-manager` | Personas, JTBD, requirements, MVP definition, non-goals | §15 |
| `ux-designer` | UX flows, interaction design, usability | §15 |

## Engineering

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `engineering-manager` | Implementation planning, incremental delivery, coordinating engineers | §17 |
| `backend-developer` | Server-side code, APIs, data layer | §17 |
| `frontend-developer` | Client-side / UI code | §17 |
| `ai-ml-engineer` | Model/algorithm choices, architecture hypotheses, benchmarking | §23 |
| `devops-engineer` | Build, deploy, observability, infrastructure-as-code | §16 |

## Quality and security

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `qa-lead` | Test strategy across all layers, trying to break the product | §18 |
| `security-engineer` | Security review, threat modeling, secrets hygiene | §16, §18 |
| `red-team-reviewer` | Hostile, reward-for-finding-problems review before release | §19 |

## Validation and critique

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `contrarian` | Actively attacking the company's best ideas before they're funded | §10 |

## Growth and communication

| Agent | Owns | Protocol section |
| --- | --- | --- |
| `growth-analytics-manager` | Metrics engine, acquisition/retention thinking, competitor watch | §22, §25 |
| `technical-writer` | Documentation, handoff-file quality, report formatting | §13, §31, §32 |

## Hierarchy

```
                    CEO
          ┌──────────┼──────────┐
         COO         CTO        CPO
          │           │          │
      Operations  Engineering  Product
                      │
          ┌───────────┼───────────┐
        Backend     AI/ML      Frontend
          │           │          │
          └───────────┼──────────┘
                      QA → Security → Validation
```

The CEO decides company direction. The CTO controls technical architecture. The CPO controls
product requirements. The COO controls execution. QA and Security can block a release — that
authority is a process convention every agent should honor, not a filesystem permission, so
don't let an engineering agent talk itself out of a QA or security block.

## Adding a new role

The master protocol (§1) allows creating additional roles when required — a Data Engineer or
CMO subagent, for instance. Copy the closest existing file in `.claude/agents/`, adjust its
`description`, `tools`, and system prompt, and add a row here so humans can find it.
