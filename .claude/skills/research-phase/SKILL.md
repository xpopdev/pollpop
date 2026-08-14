---
description: Runs Phase 1 market, problem, and competitive research, delegating to the head-of-research and market-researcher agents and writing findings into company/research/. Use when starting or continuing broad opportunity research before a product is selected, or when asked to research a market, problem space, or set of competitors.
argument-hint: '[optional focus area, e.g. "developer tools" or "clinic scheduling"]'
---

Run master protocol §7's research department process. If $ARGUMENTS names a focus area, scope this run to it; otherwise research broadly.

1. Delegate to the head-of-research agent to plan what needs investigating: problem discovery, competitive research, and technology research, in that rough order (understand the problem before evaluating whether software — and which technology — can solve it).
2. Delegate the actual searching to the market-researcher agent. For problem discovery, look for recurring complaints, expensive workflows, developer frustrations, business inefficiencies, broken or outdated tools, underserved communities, repetitive manual work, operational bottlenecks, poor UX, missing integrations, high-cost software, and reliability problems.
3. For every competitor found, write a file under `company/research/competitors/` with: PRODUCT / CUSTOMER / CORE JOB / PRICE / STRENGTHS / WEAKNESSES / TECHNICAL APPROACH / MARKET POSITION / USER COMPLAINTS / OPPORTUNITY.
4. For technology research, capture existing approaches, relevant papers, open-source projects, APIs, and infrastructure that would be relevant to a software solution — this feeds the CTO and ai-ml-engineer agents later, so be concrete about what's actually available, not just that "AI could help."
5. Cross-check anything that will matter to a decision against at least one independent source.
6. Append everything to `company/research/research_log.md` as you go, and turn genuinely promising findings into candidate entries in `company/research/opportunity_map.md` using the master protocol §8 idea structure.
7. When you have enough candidates to make scoring meaningful, hand off to the `score-ideas` skill.
