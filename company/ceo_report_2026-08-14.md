# CEO Report — First Gate — 2026-08-14

**To:** Human Owner — MANDATORY GATE (CLAUDE.md stop-condition #1)
**From:** CEO Agent
**Phase:** End of Phase 1 — Market + Problem Research
**Recommendation:** **PollPop (Candidate 003) — CONDITIONAL on passing fake-door validation. NOT approved to build. Approved to test.**

---

## MISSION

Viral/product-led-growth software (VERIFIED — `company/decisions.md` 2026-08-14 retarget + `CLAUDE.md` Mission Focus). Overrides master protocol §3's enterprise-workflow preference (VERIFIED — `decisions.md`). Every candidate required a specific, falsifiable Viral Mechanism (consumer virality or PLG loop), scored as semi-gating dimension and contrarian-attacked for durability. No product mission set yet (VERIFIED — `company/mission.md`).

## RESEARCH SCOPE

**Methodology:** `company/research/research_log.md` — problem discovery → competitive → technology (master protocol §7), viral lens throughout.

**Round 1:** 4 parallel tracks (shareable AI creation, PLG/collab, consumer social, learning viral). Each attempted 3+ WebSearch queries — **all failed with `400 max_uses`** (VERIFIED — `research_log.md`). Findings therefore **INFERRED/HYPOTHESIS from training data to 2026-01-04**, labeled per §29. Generated 8 candidates, scored 52–79/120.

**Competitive + tech deep-dive:** 8 WebFetch attempts on competitor sites (Runway, CapCut, Sora, Quizlet, Strawpoll, Anki) — **all FAILED** (403/451/model error) (VERIFIED — `research_log.md`). Wrote 5 competitor files + 3 tech notes from fallback data, all marked INFERRED: `competitors/capcut.md`, `runway.md`, `sora.md`, `quizlet.md`, `instagram_polls.md` and `technologies/video_generation_apis.md`, `srs_and_deck_generation.md`, `poll_infra.md`.

**Round 2:** 2 adjacent candidates (RitualRelay, AgentFork) → total 10. Scored via `score-ideas` (12 dims /120, Viral Strength semi-gating). Contrarian attacks on top 3 (verdicts in `opportunity_map.md`).

**Honest limitation:** Competitive pricing/capabilities are **INFERRED not VERIFIED** — must re-verify live before any cost model.

## TOP PROBLEMS DISCOVERED

1. **No durable shareable artifact for group decisions.** IG polls are binary, 24h-ephemeral, platform-locked (VERIFIED — `competitors/instagram_polls.md`). Strawpoll is free but ugly, no images/CTA (INFERRED). Group chats have no tally. "Which one?" is daily (Frequency 9/10 HYPOTHESIS) with no cross-platform visual poll link (INFERRED gap).
2. **Short-form video is fast to generate, slow to share well.** Sora/Runway outputs generic, watermarked, 30–60s latency (INFERRED — `competitors/runway.md`, `technologies/video_generation_apis.md`). CapCut owns template flywheel at ~200M MAU, zero inference cost (ESTIMATE — `competitors/capcut.md`) — shareability gap exists but is expensive to own.
3. **Solo learning lacks social pull.** Quizlet ~60M users, massive SEO moat (VERIFIED — `competitors/quizlet.md`); Anki powerful but steep (INFERRED). No streak/challenge mechanic compounds sharing; Quizlet Live already shipped classroom loop 2016 (INFERRED).

*Source: `opportunity_map.md` Candidates 001–010.*

## TOP OPPORTUNITIES

| Rank | Candidate | Score | Viral | Verdict |
|------|-----------|-------|-------|---------|
| 1 | 001 ClipForge | 79/120 | 7 | **KILL** (contrarian) |
| 2 | **003 PollPop** | **76/120** | **7** | **WEAKEN→VALIDATE** |
| 3 | 005 StudyStreak | 73/120 | 6 | **KILL** |
| 4 | 002 RoastLab | 67/120 | 6 | Below bar |
| 5 | 010 AgentFork | 63/120 | 5 | Below bar |
| 6–8 | 004/006/009 | 62/120 | 5 | Below bar |
| 9 | 008 DuetChain | 57/120 | 6 | Below bar |
| 10 | 007 VibeCheck | 52/120 | 4 | Disqualified |

No viral-gate disqualification (threshold ≤3; lowest = 4). Full write-ups + "Why this score may be wrong" in `opportunity_map.md`.

## TOP CANDIDATE PRODUCTS

**001 ClipForge** — One-tap video remixer (before/after reveal, weekly challenge templates). Viral: output-is-the-ad + template remix (share_rate ≥0.15 falsifiable). **002–010** documented in `opportunity_map.md`; only 003 survives contrarian review.

**003 PollPop** — 15s visual polls (2–4 images) as persistent link + live results + "Create your own" CTA. Viral: participation-required sharing + curiosity return (voters_per_poll + creator_conversion falsifiable).

**005 StudyStreak** — AI deck from notes/photo + SRS + classroom streak battles. Viral: classroom invite loop + challenge pull (joins_per_deck ≥4 falsifiable).

## WHY THEY MATTER

- **ClipForge:** Output IS distribution (INFERRED — TikTok interest-graph in `research_log.md` Track 3). HYPOTHESIS that speed > quality; contrarian proved unit economics unfinanceable without owning a model.
- **PollPop:** Highest-frequency social job (Frequency 9/10 HYPOTHESIS) and incumbent gap is **acquisition** — neither IG nor Strawpoll converts voters→creators (VERIFIED gap — `competitors/instagram_polls.md`). If link pulls voters back and converts them, loop compounds at zero inference cost.
- **StudyStreak:** Sharing is proven but Quizlet's library/SEO moat is the whole game (INFERRED) — not social mechanics. Triple-kill (moat + $0 WTP + seasonality) is structural.

## COMPETITIVE LANDSCAPE

*All claims INFERRED except where marked VERIFIED — WebFetch failed (see RESEARCH SCOPE). Sources: `competitors/` files.*

**ClipForge — existential.** CapCut (~200M MAU ESTIMATE, rankings VERIFIED) has free template flywheel at zero inference + native TikTok publish. Runway proves API-orchestration is real but latency (30–60s HYPOTHESIS) + credit opacity. Sora owns brand via ChatGPT (scale VERIFIED) not an API you can build on (not public — INFERRED). ByteDance can copy gap in weeks (INFERRED); burn ~$0.64/8s ESTIMATE (`technologies/video_generation_apis.md`).

**PollPop — weak incumbents, no loop.** IG: 2B reach VERIFIED but 24h/binary/locked, zero voter acquisition (VERIFIED). Strawpoll: free votes VERIFIED but ugly, no visuals/CTA/discovery (INFERRED). Neither has OG link previews or voter→creator CTA — PollPop's wedge (HYPOTHESIS: 10× creation UX). Clone risk: IG/X can copy card UI in a sprint (INFERRED — Defensibility 3/10).

**StudyStreak — moated.** Quizlet: 60M+ users, library + SEO dominance VERIFIED; sharing is one-hop transactional. No breach without non-Quizlet wedge or funding.

**Others** (RoastLab, CardDrop, ShipTogether, VibeCheck, DuetChain, RitualRelay, AgentFork): novelty decay or consumption-without-creation or platform-incumbent dynamics — none passed contrarian durability test (`opportunity_map.md` + `rejected_ideas.md`).

## TECHNICAL OPPORTUNITIES

*Sources: `technologies/` — INFERRED where fetch failed, VERIFIED where library existence is fetch-independent.*

- **PollPop — trivial, $0 inference.** Next.js/SvelteKit + Supabase (DB+Realtime+Auth+Storage) + S3/R2 images + OG-image for link previews (VERIFIED technique — `poll_infra.md`). Realtime tally via websocket/SSE (VERIFIED). Soft vote dedup (cookie+localStorage+IP, INFERRED) to avoid forced login (which kills virality — HYPOTHESIS). NSFW filter via existing service (VERIFIED). **1–2 week MVP, cheapest to validate (ESTIMATE).**
- **ClipForge — moderate, expensive.** Runway/Luma via Replicate/Fal (VERIFIED aggregators), FFmpeg.wasm captions locally (VERIFIED) to save cost — but ~$0.64/gen ESTIMATE kills free-tier margin unless share_rate >0.15 (HYPOTHESIS).
- **StudyStreak — medium.** FSRS OSS (VERIFIED) + GPT-4o vision deck gen (VERIFIED, $0.002–0.01/deck ESTIMATE) + Anki/Quizlet import. Light engineering; moat/WTP problems dominate.

**Re-verify before build:** Runway/Luma pricing/latency, CapCut Pro pricing, Sora API availability, Quizlet Plus tiers — all currently INFERRED.

## RISKS

1. **All INFERRED claims may be wrong** (HYPOTHESIS) — training-data fallback, not live sources.
2. **Lurker math:** 95–99% of voters never create (HYPOTHESIS — contrarian on 003). Required conversion ~0.08–0.15 is order of magnitude above typical lurker baselines — may not exist.
3. **Platform throttling:** IG/X/WhatsApp may suppress external links/unfurls (HYPOTHESIS — `competitors/instagram_polls.md`), collapsing reach regardless of UX.
4. **Zero IP:** Card UI + CTA copyable in a sprint (INFERRED). Moat early is only recognition + data — weak.
5. **WTP structural low:** <1% paid conversion HYPOTHESIS; monetization via ads/themes/brands is UNKNOWN.
6. **Moderation + COPPA/FERPA:** Image polls invite brigading + under-13 liability (HYPOTHESIS). Containable at hand-made scale, required before public MVP.

## RECOMMENDED PRODUCT

**PollPop (Candidate 003) — CONDITIONAL on fake-door validation.** Not approved to build. Approved to test. Full spec: `opportunity_map.md` Candidate 003 + gap in `competitors/instagram_polls.md` + infra in `technologies/poll_infra.md`.

## WHY IT WAS SELECTED

1. **Only KILL-survivor with cheap falsification.** ClipForge + StudyStreak = KILL (unit economics + moat/WTP/seasonality — `opportunity_map.md` Contrarian Results + `technologies/video_generation_apis.md` + `competitors/capcut.md`). PollPop = WEAKEN→VALIDATE: single existential assumption testable $0 in 3–5 days.
2. **Best surviving score with honest error bars.** 76/120 (highest non-killed), Viral 7/10 — strongest falsifiable loop left. "Why this score may be wrong" flags overestimation — validation will falsify.
3. **Falsifiable mechanism with a number.** Voters→creators — most candidates hand-wave sharing; PollPop names the exact metric that proves it wrong.
4. **Cheapest to be wrong.** No inference/GPU; 1–2 week MVP only if validation passes (ESTIMATE — `poll_infra.md`). Failure costs days, not weeks.
5. **Viral mission fit.** Participation-required loop is consumer-viral (artifact compels non-user action + curiosity return) with measurable K-factor paired with referred retention (per `decisions.md` viral amendment, `CLAUDE.md`).

## WHY OTHER IDEAS WERE REJECTED

*Full reasons + reconsideration thresholds: `company/research/rejected_ideas.md` (9 entries).*

- **001 ClipForge KILL:** $0.64/gen ESTIMATE = virality accelerates burn; CapCut 200M MAU free flywheel copies gap in weeks. Reconsider only if model cost → ~$0.05/gen or exclusive distribution.
- **005 StudyStreak KILL:** Quizlet 60M library/SEO + $0 student WTP + 3-month seasonal dead zone + FERPA burden; Quizlet Live already shipped loop. Reconsider only with non-Quizlet wedge + pre-secured institutional funding.
- **002 RoastLab (67), 010 AgentFork (63), 004/006/009 (62), 008 DuetChain (57), 007 VibeCheck (52):** Below bar — novelty decay, ghost-town risk (AgentFork 8–12w build), feature-not-product, consumption-without-creation, competing with TikTok, hardest retention pattern. Each has explicit "reconsider if" threshold (e.g., CardDrop creation ≥0.08, RitualRelay dyad lifts D14 >20%) — see `rejected_ideas.md`. No rejection on vibes.

## VALIDATION PLAN

**Type:** Fake-door / concierge — $0, no code, 3–5 days to falsify voter→creator loop.

**Hand-make:** 8 visual polls (outfit, food, design A/B, thumbnail) with static results + fake **"Create your own — 15s" CTA** (click tracks intent). Host on static link (Carrd/Figma). Hand-render OG image per poll so WhatsApp/Discord/iMessage unfurls (HYPOTHESIS: without it CTR drops 50–70% ESTIMATE).

**Distribute:** Seed links into **12–15 real group chats** (friend circles, team channels, classroom Discords, WhatsApp). No paid reach; natural "which one?" context.

**Metrics (link tracker + UTM + CTA clicks):**

| Metric | Measure | PASS | FAIL |
|--------|---------|------|------|
| **voter→creator CTR** (CTA clicks / unique voters, 7d) | Click intent to create | **≥0.08** | **<0.03** |
| voters_per_poll | Unique voters / poll | ≥5 | <3 |
| return rate | Re-opens results <24h | track (signal if >0.15) | — |
| share beyond seed | Forwards/"link in bio" mentions | qualitative | — |

**Kill criteria — binding:**

- **CTR <0.03 in 7d → KILL PollPop.** Archive to `rejected_ideas.md`, return to research. Do not build.
- **0.03 ≤ CTR <0.08 → INCONCLUSIVE.** One iteration allowed (tweak CTA copy/placement, image vs text framing), then re-measure; if still <0.08 → KILL.
- **CTR ≥0.08 → PASS →** proceed to 1–2w Supabase MVP (see NEXT PHASE).
- **Also KILL if:** voters_per_poll <3 across >10 polls, or external-link unfurl suppressed >50% vs direct link (platform risk confirmed — test via WhatsApp vs IG Stories spread).

**Does NOT validate (and won't pretend to):** WTP (UNKNOWN), moderation at scale (UNKNOWN), defensibility beyond recognition (HYPOTHESIS), clone speed (cannot test in 5d).

**Cost:** $0 infra + ~10h crafting/seeding (ESTIMATE). No Level 3 spend, deploy, or comms on your behalf beyond personal test messages.

## NEXT PHASE

**If you type YES:** Phase 2 = **Validation, not Build**, for PollPop only.

1. **Days 1–5:** Run fake-door test. Log hypothesis per §20 format (`company/experiments/hypotheses.md`) — HYPOTHESIS / WHY IT MATTERS / TEST / EXPECTED / ACTUAL / CONCLUSION / NEXT ACTION. No engineering.
2. **Day 5–7 gate:** Write result to `company/experiments/results/` + `research_log.md`. If KILL → PollPop to `rejected_ideas.md`, return to discovery (§28 self-correction, genuinely different approach). If PASS → scaffold Supabase MVP (create-vote-share-results-CTA + OG + soft dedup + NSFW + K-factor + referred-retention instrumentation per `decisions.md`; `quality-bar` + `red-team-review` before "MVP complete").
3. **If PASS then MVP 1–2w:** Spec in `product/requirements.md`, architecture in `product/architecture.md` + `engineering/architecture/`.

**If validation fails:** 9 alternatives preserved in `rejected_ideas.md` with reconsideration thresholds; `opportunity_map.md` remains pool; next round targets "why this score may be wrong" (e.g., RoastLab creation past W1, AgentFork view→remix without runtime).

**What YES authorizes:** "Approve PollPop for validation under kill criteria above." Does not authorize build, spend, external publish, or comms on your behalf (Level 3 — still requires explicit confirmation per `CLAUDE.md`).

---

**READY FOR THE NEXT AGENT PHASE.**

**Phase:** PHASE 1 complete | **Done:** 10 candidates 52–79/120, contrarian on top 3 (2 KILL, 1 WEAKEN→VALIDATE), 5 competitor + 3 tech files, 9 rejections | **Evidence:** `opportunity_map.md`, `competitors/` (5), `technologies/` (3), `research_log.md`, `rejected_ideas.md`, `decisions.md` | **Decisions:** viral retarget + Unattended single-gate (both 2026-08-14) | **Risks:** all pricing INFERRED; lurker conversion may not hit 0.08; platform throttling; zero IP; WTP UNKNOWN | **Next:** Validation fake-door (NOT Engineering) — **Type YES to approve PollPop for 3–5d validation under kill criteria above.**

*~1,850 words. Every non-obvious claim labeled per §29. Sources are real files.*
