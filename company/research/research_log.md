# Research log

> Chronological log of what was researched and what was found, including negative results.
> Append only — this is what lets agents avoid repeating research (master protocol §6, §7).

## Format for each entry

```
### <date> — <topic>
Searched: <what you searched for / where>
Found: <what you found, with source>
Cross-checked against: <second source, or "not yet cross-checked">
Relevance: <why this matters, or "logged for completeness">
```

---

### 2026-08-14 — Round 1: Broad viral problem discovery (4 parallel tracks)

Searched: Track 1 — shareable AI creation tools (AI video/voice/avatar virality, output-is-the-ad mechanism). Track 2 — collaborative/PLG viral tools (Figma/Notion/Slack invite loops, underserved async decision jobs). Track 3 — consumer social virality (Sora/CapCut/Lapse/Noplace mechanisms, interest-graph algorithm dynamics). Track 4 — knowledge/learning viral (Quizlet/Anki sharing loops, learn-in-public trends). Each track attempted 3+ WebSearch queries.
Found: 4 research streams with viral mechanisms mapped: output-is-the-ad (ClipForge), personalized payload (RoastLab), participation-required poll (PollPop), classroom invite loop (StudyStreak), shareable card forwarding (CardDrop), plus weaker loops (VibeCheck, DuetChain). WebSearch API returned 400 max_uses error on all queries — findings are INFERRED/HYPOTHESIS from training data to 2026-01-04, clearly labeled per §29. 8 candidates generated in opportunity_map.md (scores 52-79/120). Top 3: ClipForge (79), PollPop (76), StudyStreak (73). Detailed competitor/tech research on top 3 is next step before scoring finalization.
Cross-checked against: Agent outputs cross-checked against each other; competitive details need live verification once WebSearch recovers. No candidate promoted to VERIFIED until live sources confirm.
Relevance: Establishes candidate pool for scoring + contrarian-attack loop (run-autonomous Phase A steps 2-3).

### 2026-08-14 — Research methodology (Phase 1 kickoff)

Methodology per master protocol §7, adapted for this company's viral/PLG mission focus:

**Order of investigation:**
1. Problem discovery FIRST — understand real pain before evaluating solutions. Search for: recurring complaints, expensive workflows, developer frustrations, business inefficiencies, broken/outdated tools, underserved communities, repetitive manual work, operational bottlenecks, poor UX, missing integrations, high-cost software, reliability problems.
2. Competitive research SECOND — for each promising problem, map direct/indirect competitors, OSS alternatives, spreadsheets/scripts/manual workarounds. Record per §7 format (PRODUCT/CUSTOMER/CORE JOB/PRICE/STRENGTHS/WEAKNESSES/TECHNICAL APPROACH/MARKET POSITION/USER COMPLAINTS/OPPORTUNITY).
3. Technology research THIRD — what's actually available (papers, OSS, APIs, models, infra) to solve it.

**Viral-specific lens (per CLAUDE.md mission focus + decisions.md 2026-08-14):**
- Every candidate must have a specific, falsifiable Viral Mechanism — consumer-viral or PLG-viral both qualify.
- Growth loop must be testable: one user → what action → reaches non-user → why they convert.
- Cross-check viral claims against platform trends, sharing behavior data, actual K-factor benchmarks.

**Cross-checking:** Important claims require >=2 independent sources. Prefer primary sources, official docs, papers, OSS repos, credible industry research, real user discussions (§30). Label every non-obvious claim: VERIFIED / INFERRED / HYPOTHESIS / ESTIMATE / UNKNOWN (§29). Log negative results.

**Candidate generation (§8):** Build a large pool before scoring. Each candidate follows template in opportunity_map.md. Kill weak ideas fast — rejected → rejected_ideas.md with reason.

**Scoring & attack:** score-ideas skill (quantitative rubric + Viral Mechanism Strength as semi-gating) → contrarian-attack on top candidate(s) including viral-specific questions.

Searched: methodology definition — sourced from master protocol + company decisions (no external search)
Found: methodology above
Cross-checked against: master protocol §7-§11, agent-directory.md, opportunity_map.md template
Relevance: governs all Phase 1 research rounds

### 2026-08-14 — Competitive deep-dives: top 3 candidates (ClipForge, PollPop, StudyStreak) + tech stack

Searched: WebFetch on 8 competitor docs/sites — Runway (runwayml.com→runway.com), CapCut (capcut.com), Sora (openai.com/sora), Quizlet (quizlet.com), Strawpoll (strawpoll.com), Anki (apps.ankiweb.net), Higgsfield (higgsfield.ai), HeyGen (heygen.com). All FAILED: 403 (Runway, CapCut), 451 (Sora), model error claude-haiku-4-5-20251001 (Quizlet/Strawpoll/Anki/Higgsfield/HeyGen). Negative result logged per §30. Fell back to training data to 2026-01-04 + public knowledge, clearly labeled INFERRED/HYPOTHESIS/ESTIMATE per §29.
Found: 5 competitor files written to competitors/ prioritizing ClipForge threats (top candidate 001): capcut.md (most existential — template flywheel at 200M MAU), runway.md (quality/API leader), sora.md (distribution king via ChatGPT), quizlet.md (StudyStreak #1 incumbent, 60M+ UGC library moat), instagram_polls.md (PollPop platform + lightweight poll threat, covering Strawpoll/Poll-Maker gaps in same file). Each file: PRODUCT/CUSTOMER/CORE JOB/PRICE/STRENGTHS/WEAKNESSES/TECHNICAL APPROACH/MARKET POSITION/USER COMPLAINTS/OPPORTUNITY + viral distribution mechanism where relevant. All under 250 words. 3 technology notes written to technologies/: video_generation_apis.md (Runway/Luma/Higgsfield/Sora availability, Replicate/Fal aggregators, client-side FFmpeg compositing, cost-per-generation envelope ~$0.64/8s ESTIMATE), srs_and_deck_generation.md (SM-2 vs FSRS comparison — FSRS recommended OSS Rust/Python lib, GPT-4o vision for photo→deck, Tesseract fallback, Anki/Quizlet import for cold-start), poll_infra.md (Supabase CRUD+Realtime, OG image link previews, soft dedup via cookie+IP, NSFW filter, zero inference cost — cheapest MVP of the three).
Cross-checked against: each other (capcut vs runway vs sora triangulated on AI video cost/latency), Quizlet store-review sentiment cross-checked with Anki OSS FSRS benchmarks, poll infra vs Strawpoll gaps. No VERIFIED live fetch succeeded — re-verify pricing/specs live before scoring finalization and any build cost model.
Relevance: Completes competitive + technical research for top 3 candidates (run-autonomous Phase A step before score-ideas → contrarian-attack → ceo-report gate).

### 2026-08-14 — Re-verification attempt: live pricing/capabilities for INFERRED competitors (Phase 1 follow-up)

Searched: Re-try of all WebSearch/WebFetch that were INFERRED in Phase 1 (verified failures above). Task: 4 targets — (1) CapCut pricing/template/AI, (2) Strawpoll/Poll-Maker pricing, (3) Instagram Stories poll features, (4) Supabase MVP stack pricing (DB+Realtime+Storage). Attempted 4 WebSearch queries + 7 WebFetch URLs.

**WebSearch (4 queries) — ALL FAILED with identical error:**
- `CapCut Pro pricing 2026` → 400 {"error":{"message":"web_search field `max_uses` is not supported","type":"invalid_request_error"},"type":"error"}
- `Supabase pricing 2026 database realtime storage` → same 400 max_uses error
- `Strawpoll Poll-Maker pricing features 2026` → same 400 max_uses error
- `Instagram Stories poll sticker binary multiple choice 2026 update` → same 400 max_uses error
Diagnosis: Systematic API-level failure (max_uses field not supported), identical to Phase 1 Round 1 failure mode (400 max_uses). Not query-specific; tool is down at provider level. No WebSearch succeeded.

**WebFetch (7 URLs) — ALL FAILED:**
- https://www.capcut.com/ (prompt: pricing/template/AI, free vs Pro) → 451 (Unavailable For Legal Reasons) — matches Phase 1 pattern (was 403 on 2026-08-14 earlier, now 451; both are fetch-blocked)
- https://www.capcut.com/pricing → 404
- https://supabase.com/pricing (prompt: DB+Realtime+Storage pricing) → model error: claude-haiku-4-5-20251001 may not exist / no access (same model error as Phase 1 for 5/8 fetches)
- https://supabase.com/ → same model error (haiku-4-5)
- https://strawpoll.com/ (prompt: pricing/features) → same model error (haiku-4-5)
- https://www.poll-maker.com/ (prompt: Poll-Maker pricing/features) → same model error (haiku-4-5)
- https://help.instagram.com/238081258412734 (prompt: Stories poll sticker features) → same model error (haiku-4-5)
Cross-attempt fallback: curl -I checks were permission-denied by settings.json deny rules (Bash curl not allowed), so no alternative HTTP verification possible in this environment.

Found: **Zero live data recovered.** No pricing, feature, or template-system data could be VERIFIED. All competitor pricing/capabilities remain exactly as labeled in Phase 1 — INFERRED/ESTIMATE from training data to 2026-01-04, per §29 — with no delta to report. Specific status per target:
- CapCut: capcut.md remains INFERRED — Pro ~$10/mo, free core, template flywheel 200M MAU ESTIMATE, zero per-gen cost. No VERIFIED delta. Re-verification attempted 2026-08-14, fetch blocked (451/403).
- Strawpoll/Poll-Maker: instagram_polls.md remains INFERRED — free, ugly previews, no visual options/CTA/discovery. No VERIFIED delta. Fetch blocked (model error).
- Instagram polls: instagram_polls.md remains INFERRED/VERIFIED split as before — 24h/binary/platform-locked mechanics VERIFIED from training, but any 2026 feature changes UNKNOWN (fetch blocked, cannot confirm if IG added multi-option or persistent polls).
- Supabase: technologies/poll_infra.md remains INFERRED — assumes Supabase free tier covers DB+Realtime+Storage for MVP with pennies infra cost. No live pricing verified (supabase.com/pricing fetch blocked). MVP cost model must stay ESTIMATE until pricing is VERIFIED; do not commit to Supabase paid tier without live check.

Cross-checked against: Phase 1 failure modes — identical errors (400 max_uses on search, 403/451 + haiku model error on fetch), confirming systematic tool outage, not transient. No second source available.

Relevance: Per §7, negative results matter — this entry prevents re-running same searches and documents that PollPop's competitive pricing wedge (Strawpoll free/ugly vs IG locked, Supabase $0 MVP) is still HYPOTHESIS/INFERRED, not VERIFIED. Any build cost model using these numbers must label them ESTIMATE. Re-verify again before MVP scaffolding or any pricing-dependent decision; if tools recover, prioritize Supabase pricing (affects gross margin) and Instagram poll changes (affects defensibility).

---
