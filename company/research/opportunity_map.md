# Opportunity map

> Candidate product ideas (master protocol §8), scored (master protocol §9), and attacked by
> the contrarian agent (master protocol §10) before any one of them is selected. Do not stop at
> the first reasonable idea — this file should hold a real pool of candidates before scoring.
> Per this company's mission focus (`CLAUDE.md`), every candidate needs a specific Viral
> Mechanism, not just a good problem fit — see the template below.

## Candidate template

```
### Candidate <NNN>: <name>

Problem:
Target user:
Current solution:
Why current solution fails:
Proposed solution:
Why software can solve it:
Viral mechanism: (the specific, falsifiable loop by which one user brings the next one —
  consumer-viral or product-led-growth-viral. Not "people will probably share this.")
Technical difficulty:
Market opportunity:
Competitive advantage:
Potential moat:
Estimated build complexity:
Risks:
Unknowns:
Validation plan:

Score (0-10 each): Pain Severity / Frequency / Market Size / Willingness to Pay /
Competition Gap / Technical Feasibility / Differentiation / Defensibility /
Growth Potential / AI Leverage / Distribution Potential / Viral Mechanism Strength
Overall score:
Why this score may be wrong:

Contrarian attack: (filled in by the contrarian agent / contrarian-attack skill — for this
  company, always including the viral-specific attack questions in .claude/agents/contrarian.md)
```

---

### Candidate 001: ClipForge — One-Tap Viral Video Remixer

Problem: Creating short-form video that actually gets shared is hard — AI video tools (Sora, Runway, Luma) generate impressive clips but outputs are generic, watermarked, slow, and not natively shareable. Users want to turn a selfie/idea into a 9:16, captioned, trend-ready clip in seconds, not minutes.
Target user: Gen Z / young creators (16-28) who post daily to TikTok/Reels/Shorts and want standout content without editing skills.
Current solution: Sora, Runway, CapCut templates, Higgsfield, HeyGen avatar videos.
Why current solution fails: Outputs are generic (not personal), watermarked on free tier, 30-60s generation breaks TikTok-speed workflow, no native export with remix/duet, no before/after reveal format that drives saves. Credit systems unpredictable.
Proposed solution: Mobile-first app — upload selfie or prompt → generates a 6-10s vertical video with before/after reveal, auto-captions, trending audio sync, watermark-free free tier (attribution is a clickable link, not a stamp). One-tap export to TikTok/Reels. Weekly "challenge templates" to remix.
Why software can solve it: Composable AI video APIs (Sora, Luma, Higgsfield) + client-side composition for captions/audio + social SDK sharing.
Viral mechanism: **Output-is-the-ad + template remix.** Every clip posted IS the ad — viewers see transformation, ask "how did you make this?" Comment → link → new user creates. Weekly challenge templates create duet/remix cascades (viewer taps "use this template" → creates own version → posts → reaches their followers). Falsifiable: measure share_rate (posts per generation) and template_remix_rate (remixes per template post). If share_rate < 0.15, mechanism fails.
Technical difficulty: Medium — orchestrate video generation APIs, handle queue/latency UX, client-side video composition.
Market opportunity: Short-form video creation — billions of daily posts; AI video generation market growing fast (Sora, Runway traction VERIFIED). Monetize via credits/premium templates (INFERRED willingness to pay from CapCut/Sora pricing).
Competitive advantage: Speed + shareability-first, not quality-first — personality over photorealism. Challenge template flywheel none of the tool vendors own.
Potential moat: Template library + creator network effects (more users → more templates → more reasons to stay). Not deep tech moat.
Estimated build complexity: Medium — 4-6 weeks for MVP (API orchestration + mobile web + template system).
Risks: API costs (video generation expensive), platform dependency (TikTok algorithm changes), easily copied template mechanic, quality inconsistency.
Unknowns: Actual cost per generation at scale; will users pay for credits vs churning after free tier; moderation burden for generated content.
Validation plan: Ship 5 challenge templates, measure share_rate and cost-per-viral-clip over 2 weeks. Kill if share_rate < 0.10 or gross margin negative on free tier.

Score (0-10 each): Pain 6 / Frequency 8 / Market Size 8 / Willingness to Pay 5 / Competition Gap 5 / Technical Feasibility 7 / Differentiation 5 / Defensibility 4 / Growth Potential 8 / AI Leverage 8 / Distribution Potential 8 / Viral Mechanism Strength 7
Overall score: 79/120 (6.6 avg)
Why this score may be wrong: Overestimates willingness to pay — most users expect free; underestimates competition gap closure if Runway/CapCut add same templates in weeks; viral mechanism strength assumes interest-graph algorithm stays favorable.

---

### Candidate 002: RoastLab — Shareable AI Roast & Song Cards

Problem: People want a fun, personalized thing to send a friend that feels crafted for them — but AI voice/song tools (Suno, ElevenLabs) are built for creators, not for casual gifting. Too many steps, audio-only outputs lack visual punch, no "send to friend" flow.
Target user: 16-30 social sharers who send memes/voice notes to friends daily; also gift-givers for birthdays/roasts.
Current solution: Suno (AI songs), ElevenLabs voice clone, meme generators, Cameo.
Why current solution fails: Suno/Udio require prompt engineering; outputs are audio-only with no visual card; no 1-tap "send this to a friend" with attribution that pulls recipient in. Sharing is manual file-forward, not a loop.
Proposed solution: Web/mobile app — pick a friend (upload photo or tag), choose vibe (roast, hype, birthday song), generate a shareable card: visual + personalized audio/lyrics + one-tap share link. Recipient gets a branded player ("made on RoastLab — make one for your friend") with CTA to create their own.
Why software can solve it: TTS/voice (ElevenLabs API) + lyric generation (LLM) + image composition + shareable link player.
Viral mechanism: **Personalized payload + curiosity gap.** Sender creates roast/song ABOUT recipient → sends link → recipient MUST open to see/hear it → delight/surprise → recipient creates one for another friend to return the favor. Each share is personal, not generic, so open rate is high. Recipient player page is the acquisition channel. Falsifiable: measure open_rate (recipients who view) and creation_rate (recipients who then create). If creation_rate < 0.08, loop collapses.
Technical difficulty: Low-medium — LLM + TTS orchestration, no video generation needed initially. Link player is straightforward.
Market opportunity: Meme/gifting — huge but hit-driven. Comparable: Lensa (avatar) peaked then decayed; Suno has traction (TikTok sounds charted, INFERRED). Retention is the hard part.
Competitive advantage: Recipient-first share flow (not creator-first) — the sharing IS the product, not an afterthought.
Potential moat: Weak — easily copied. Possible moat via voice/persona library quality and sender graph.
Estimated build complexity: Low — 2-3 weeks for MVP (LLM+TTS+card+share link).
Risks: One-time novelty spike then churn (roast is fun once); moderation risk (roasts can be harassment); audio quality must be good enough to delight.
Unknowns: Will creation_rate sustain past first week? Can moderation be automated? Do people pay or only use free?
Validation plan: Launch with 3 card types, seed to 50 users, measure open_rate and creation_rate + 7-day retention. Kill if creation_rate < 0.08 or D7 retention < 10%.

Score (0-10 each): Pain 4 / Frequency 6 / Market Size 7 / Willingness to Pay 3 / Competition Gap 5 / Technical Feasibility 9 / Differentiation 5 / Defensibility 2 / Growth Potential 7 / AI Leverage 6 / Distribution Potential 7 / Viral Mechanism Strength 6
Overall score: 67/120 (5.6 avg)
Why this score may be wrong: Overestimates viral durability — novelty apps crater after week 1; underestimates Pain (people do spend heavily on gifting/Cameo); defensibility score may be too low if voice quality creates lock-in.

---

### Candidate 003: PollPop — Visual Polls That Beg for a Vote

Problem: Getting opinions from friends/groups is friction: Instagram Stories polls are ephemeral and platform-locked, group chats devolve into chaos, no tool makes a beautiful, shareable poll that lives as a link and pulls voters into participation. Decisions (where to eat, which outfit, which design) happen daily with no good async tool.
Target user: 16-35 social users + small groups (friend circles, teams, classrooms) who constantly ask "which one?" — outfit checks, food picks, A/B choices.
Current solution: Instagram Stories polls, Twitter polls, WhatsApp group chats, Google Forms (overkill), Strawpoll.
Why current solution fails: IG polls are locked to IG, disappear in 24h, only binary choice, no link-sharing, voters don't need to do anything beyond tap — no acquisition of voters. Group chats are messy, no tally. Forms feel formal/work.
Proposed solution: Create a visual poll in 15 seconds — add 2-4 images/options, add context, get a beautiful link. Share anywhere (DM, story, bio). Voters tap to vote — see live results — then get a CTA: "Create your own poll" (with one-tap). Leaderboard and "poll of the day" discovery.
Why software can solve it: Simple web app, image upload, real-time tally, link sharing, no AI needed for MVP (AI can suggest poll options/images later).
Viral mechanism: **Participation-required sharing + curiosity.** Poll creator shares link → voters MUST open link to see/vote → live results create curiosity loop (come back to check results) → voters see CTA to create own poll for their own question. Poll links also shared as screenshots/stories with "vote link in bio" → reaches non-voters. Falsifiable: measure voters_per_poll and creator_conversion_rate (voters who create next poll). If creators_per_poll < 0.12, loop fails. Also measure return rate (voters checking results).
Technical difficulty: Low — CRUD + real-time tally + image handling. No AI dependency.
Market opportunity: Universal use case — "which one?" is daily. Low willingness to pay directly, but monetizable via ads, premium themes, or brand polls. Comparable: Strawpoll, Poll-Maker have traffic but poor mobile UX and no viral loop designed in.
Competitive advantage: 10x better creation UX (15s vs 2 min) + voter acquisition loop none of the incumbents built; mobile-first, visual, not text forms.
Potential moat: Network effect if polls become a format people recognize ("oh, a PollPop"), plus data on preferences. Weak moat early.
Estimated build complexity: Low — 1-2 weeks for MVP (create, vote, share, results, CTA).
Risks: Low willingness to pay; easy to copy; voters may just vote and leave without converting to creators; IG/Twitter could add better native polls.
Unknowns: What is actual voters_per_poll? Will voters convert to creators or just consume? Is Poll of the Day discoverable enough to drive retention?
Validation plan: Ship MVP, seed 30 polls across group chats, measure voters_per_poll, creator_conversion_rate, D7 return rate. Kill if voters_per_poll < 5 or creator_conversion < 0.08.

Score (0-10 each): Pain 5 / Frequency 9 / Market Size 8 / Willingness to Pay 3 / Competition Gap 6 / Technical Feasibility 10 / Differentiation 6 / Defensibility 3 / Growth Potential 8 / AI Leverage 2 / Distribution Potential 9 / Viral Mechanism Strength 7
Overall score: 76/120 (6.3 avg)
Why this score may be wrong: Overestimates viral mechanism strength — voters may never convert to creators; underestimates willingness to pay if brand/creator polls monetize; AI leverage score penalizes simplicity but simplicity IS the advantage here.

---

### Candidate 004: ShipTogether — Async Decision Board for Small Teams

Problem: Small teams (startups, agencies, student groups) make decisions in scattered chats — no durable record, no accountability, context is lost. "We decided X in Slack 3 weeks ago, where?" Decision tools are either too heavy (Jira/Linear) or too loose (Slack/WhatsApp).
Target user: Small team leads and members (3-15 people) in startups, agencies, remote teams, student project groups.
Current solution: Slack threads, Notion pages, Linear issues, WhatsApp groups, email.
Why current solution fails: Slack is ephemeral and unsearchable for decisions; Notion is slow and permission-heavy for quick decisions; Linear is overkill for small teams; none have "decision" as a first-class object with proposal → discussion → vote → record.
Proposed solution: Decision board — create proposal, async discuss (thread), vote, lock decision with owner + due date + link to artifact. Share decision link externally. Integrates as "decision layer" over existing tools (Slack bot, link sharing).
Why software can solve it: Collaborative CRUD + real-time sync + integration webhooks + simple state machine.
Viral mechanism: **PLG invite loop — collaboration-conditional artifact.** Creator makes board/decision → invites 3-10 teammates by email/link → each must create account to participate in vote/discussion (can't vote without joining). Each teammate then creates their own board for their next decision. Falsifiable: measure invite_conversion_rate (invited → activated) and boards_per_team. If invite_conversion < 0.30, loop fails.
Technical difficulty: Medium — real-time sync, permissions, integrations (Slack bot adds complexity).
Market opportunity: Small-team collaboration — crowded space. Figma/Notion/Slack already own PLG loops for docs/chat/design. Decision-specific niche is unproven.
Competitive advantage: "Decision as object" is not first-class in any incumbent — but is that a feature or a standalone product? Unclear.
Potential moat: Workflow integration depth + decision history data. Modest.
Estimated build complexity: Medium-high — 5-8 weeks for MVP with integrations.
Risks: Crowded market; decision as standalone product may not pull users from existing habits; PLG loop weaker if teams already have Slack/Notion inertia; hard to price.
Unknowns: Will teams adopt a separate tool just for decisions vs adding a tab to existing tools? What is invite_conversion in practice?
Validation plan: Interview 20 small-team leads about decision pain; prototype decision board, measure invite_conversion and DAU over 3 weeks. Kill if invite_conversion < 0.25 or churn > 60% at week 2.

Score (0-10 each): Pain 6 / Frequency 7 / Market Size 6 / Willingness to Pay 5 / Competition Gap 4 / Technical Feasibility 7 / Differentiation 4 / Defensibility 5 / Growth Potential 5 / AI Leverage 3 / Distribution Potential 5 / Viral Mechanism Strength 5
Overall score: 62/120 (5.2 avg)
Why this score may be wrong: Could underestimate Pain if decision churn is worse than assumed; overestimates Competition Gap — Notion/Slack/Linear already cover this loosely but "loosely" may be good enough.

---

### Candidate 005: StudyStreak — Social Deck Challenges That Spread Through Classrooms

Problem: Solo flashcard drilling (Anki, Quizlet) is lonely and demotivating. Quizlet paywalled key features (Learn mode), Anki UX is steep and ugly, decks are scattered. Students want streak-driven, social studying where creating a deck for classmates is the study act itself.
Target user: High school + university students (15-24) who study with spaced repetition and share decks in group chats/classrooms.
Current solution: Anki (steep/ugly), Quizlet (paywalled), Knowt/Quizard, Google Docs for shared decks.
Why current solution fails: Solo drilling no accountability, Quizlet Plus paywall broke sharing loop, Anki no collaboration, no streak/challenge mechanic that pulls classmates in, scattered formats.
Proposed solution: Create a deck from notes/photo (AI generates cards) → share link to class group chat → classmates join to study + challenge each other (daily streak battles, 1v1 quizzes). Leaderboard + streaks + deck remixing. Free core, premium for AI generation limits.
Why software can solve it: LLM for deck generation from notes/image + spaced repetition engine + social mechanics (streaks, leaderboards, challenges).
Viral mechanism: **Classroom invite loop + challenge pull.** Creator makes deck → shares link to class WhatsApp/Discord (15-40 people) → recipients must join to study/play → daily streak notifications pull them back → they challenge friends → challengers must join. Semester-driven but high K-factor within cohorts. Falsifiable: measure joins_per_deck_shared and challenge_acceptance_rate. If joins_per_deck < 4, loop fails.
Technical difficulty: Medium — LLM deck gen + SRS engine + social layer.
Market opportunity: Education — massive but seasonal, low willingness to pay from students, monetizable via freemium + institutional licensing. Quizlet has proven scale (VERIFIED product); Anki is OSS (VERIFIED).
Competitive advantage: AI deck generation from photo/notes (faster than Quizlet creation) + streak/challenge social layer Quizlet/Anki lack.
Potential moat: Deck library + classroom network effects (class adopts → next semester's class inherits decks). Content moat over time.
Estimated build complexity: Medium — 4-6 weeks for MVP (AI deck gen + SRS + sharing + challenges).
Risks: Seasonal churn (semester-bound), low WTP, Quizlet incumbency, AI deck quality must be high, moderation for shared decks.
Unknowns: Actual joins_per_deck in real classrooms; will students pay or only use free; does streak mechanic retain past novelty.
Validation plan: Seed to 3 classrooms (30-40 students each), measure joins_per_deck, D7/D30 retention, challenge_acceptance_rate. Kill if joins_per_deck < 3 or D30 < 15%.

Score (0-10 each): Pain 7 / Frequency 8 / Market Size 7 / Willingness to Pay 4 / Competition Gap 5 / Technical Feasibility 7 / Differentiation 5 / Defensibility 5 / Growth Potential 7 / AI Leverage 6 / Distribution Potential 6 / Viral Mechanism Strength 6
Overall score: 73/120 (6.1 avg)
Why this score may be wrong: Overestimates Growth Potential — education apps are famously seasonal/hit-driven; underestimates Defensibility if deck library compounds; willingness to pay may be higher than scored if parents pay.

---

### Candidate 006: CardDrop — Shareable Knowledge Cards for Curious Minds

Problem: Interesting things people learn (a stat, a mental model, a breakdown) get lost in threads/tweets/docs — no tool makes them into a beautiful, self-contained shareable card that carries attribution and pulls readers back. The "learn → make → share" loop has no home.
Target user: Curious professionals, creators, and learners (20-40) who share insights on X/LinkedIn/WhatsApp and want their knowledge to look great.
Current solution: X/Twitter threads, LinkedIn posts, Canva for cards, Notion sharing, screenshots.
Why current solution fails: Threads are ephemeral and platform-locked; Canva requires design effort; Notion is not shareable as a social object; no attribution loop that pulls readers from card to creator profile to "make your own."
Proposed solution: Input any topic/insight → AI turns it into a beautiful, branded knowledge card (stat card, explainer, before/after, timeline). Card is a link + image; perfect for X/LinkedIn/WhatsApp forwarding. Every card carries "Made on CardDrop — make yours" CTA. Gallery/discovery of trending cards. Remix any card with your own take.
Why software can solve it: LLM for insight → card transformation + template rendering engine + shareable link + social preview optimization.
Viral mechanism: **Shareable output / forwardable artifact.** Creator makes card → posts to X/LinkedIn or forwards in WhatsApp → viewers see beautiful card → tap "make yours" to create their own version or remix this card. Card IS the ad (like Wordle's share grid). Forward chains via WhatsApp are organic and hard to track but real. Falsifiable: measure views_per_card and creation_rate (viewers → creators). If creation_rate < 0.05, mechanism is consumption-only, not viral.
Technical difficulty: Low-medium — LLM + templating + link sharing. No heavy media generation.
Market opportunity: Creator/knowledge economy — large but fragmented; competes with every social platform's native format. Hard to monetize directly; brand/creator subscriptions possible.
Competitive advantage: 10s creation vs Canva's minutes; forwardable card format that no incumbent owns.
Potential moat: Weak — template library + brand recognition. Easily copied.
Estimated build complexity: Low — 2-3 weeks for MVP (LLM→card→share+remix).
Risks: Consumption without creation (people view cards but don't make them); easily copied by Canva/Notion; low willingness to pay; discovery/recommendation may be needed for retention.
Unknowns: What is views_per_card and creation_rate for knowledge content vs memes? Will professionals pay for branded cards?
Validation plan: Ship 10 card templates, seed 50 cards to X/LinkedIn/WhatsApp, measure views_per_card, creation_rate, and 14-day retention. Kill if creation_rate < 0.05 or views_per_card < 20.

Score (0-10 each): Pain 4 / Frequency 6 / Market Size 6 / Willingness to Pay 3 / Competition Gap 5 / Technical Feasibility 9 / Differentiation 4 / Defensibility 2 / Growth Potential 6 / AI Leverage 5 / Distribution Potential 7 / Viral Mechanism Strength 5
Overall score: 62/120 (5.2 avg)
Why this score may be wrong: Could overestimate Pain — is "my insight doesn't look beautiful" really painful? Score assumes low defensibility but template compounding could surprise.

---

### Candidate 007: VibeCheck — Anonymous Group Pulse for Friend Circles & Teams

Problem: In any group (friend circle, team, classroom), people want honest anonymous signal — "are we actually good?", "is this plan dumb?" — but asking directly invites politeness bias. No lightweight, anonymous, recurring pulse tool that groups run weekly and compare over time.
Target user: Friend groups (4-12), small teams, classroom cohorts who meet repeatedly and want honest signal without friction.
Current solution: Strawpoll (one-off, not recurring), Officevibe/Culture Amp (enterprise, heavy), anonymous Google Forms (manual), WhatsApp polls (not anonymous).
Why current solution fails: Existing anonymous tools are enterprise-heavy or one-off; none are recurring pulse with trend lines; none are built for informal friend groups (positioned for HR).
Proposed solution: Create a group → invite friends (link) → weekly 3-question pulse (customizable: vibe, energy, hot take) → anonymous results → trend over weeks → "group streak" mechanic. Share results card to group chat.
Why software can solve it: Simple CRUD + anonymity + scheduling + charting. Light.
Viral mechanism: **Group creation invite + results-card sharing.** Creator invites 4-12 friends by link → each must join to vote anonymously (can't view results without participating) → results card is shareable/screenshot-able → group runs weekly pulses (habit) → members create own groups for other circles. Falsifiable: measure joins_per_group and weekly_retention (groups that run pulse W2+). If weekly_retention < 0.20, it's a one-time party trick.
Technical difficulty: Low — CRUD + anon voting + charts.
Market opportunity: Small-group rituals — niche, unproven monetization. More of a feature than a standalone in many eyes.
Competitive advantage: Recurring pulse + anonymity for casual groups — not enterprise HR, not one-off polls. Light and fun positioning.
Potential moat: Very weak — trivially copied.
Estimated build complexity: Low — 1-2 weeks.
Risks: Anonymous can breed toxicity; low willingness to pay; may be a feature not a product; weekly habit is hard to form.
Unknowns: Will groups sustain weekly rhythm or do one pulse then die? Is anonymous signal actually desired by friend groups?
Validation plan: Launch to 15 groups, measure weekly_retention and anonymous participation rate over 3 weeks. Kill if <20% of groups run a second pulse.

Score (0-10 each): Pain 3 / Frequency 5 / Market Size 4 / Willingness to Pay 2 / Competition Gap 6 / Technical Feasibility 10 / Differentiation 5 / Defensibility 1 / Growth Potential 5 / AI Leverage 1 / Distribution Potential 6 / Viral Mechanism Strength 4
Overall score: 52/120 (4.3 avg)
Why this score may be wrong: Pain score may be too low if teams genuinely crave this; but market size ceiling is likely real.

---

### Candidate 008: DuetChain — Challenge Remix Chains

Problem: Challenge culture (dance, outfit, glow-up, try-on) is massive on TikTok but orchestrated informally via hashtags — no app owns the chain: create challenge → invite friends to duet → chain of entries → vote winner. Discovery is algorithmic luck, not structured participation.
Target user: 14-26 challenge participants who join dance/outfit/creative challenges and want structured chains with friends.
Current solution: TikTok hashtags, Instagram challenges, informal group chat dares.
Why current solution fails: Hashtags are discoverable but not participatory — no invite, no chain, no winner, no notifications to participants. Friction to join is "know the hashtag and make a video," not "tap to join this chain your friend started."
Proposed solution: Create a challenge (prompt + example video/image + duration) → invite friends → they create entries (video/photo) → chain is visible as a feed → community votes → winner gets badge/points. Share chain link anywhere. Trending chains discoverable.
Why software can solve it: Video/photo upload + feed + voting + notifications. Moderate media handling.
Viral mechanism: **Invite-to-participate chain + voting pull.** Creator invites friends → they must join to add entry → their entries reach their followers → new people discover chain → join → cycle repeats. Voting phase pulls non-creators in as participants. Falsifiable: measure entries_per_challenge and invite_conversion_rate. If entries_per_challenge < 4, chain collapses.
Technical difficulty: Medium — media upload/processing + feeds + voting.
Market opportunity: Challenge/UGC — large but TikTok-native; competing with TikTok's own challenge discovery is bold.
Competitive advantage: Structured chain (not loose hashtag) with invite and voting mechanics.
Potential moat: Challenge library + community; but TikTok could add identical feature.
Estimated build complexity: Medium — 4-5 weeks for MVP.
Risks: Directly competing with TikTok's core mechanic; moderation heavy (video UGC); single-demographic risk; trend-dependent.
Unknowns: Will users leave TikTok's ecosystem to join a chain elsewhere? Entries per challenge in practice?
Validation plan: Seed 10 challenges, measure entries_per_challenge, voter participation, invite_conversion. Kill if entries_per_challenge < 3.

Score (0-10 each): Pain 4 / Frequency 7 / Market Size 6 / Willingness to Pay 2 / Competition Gap 4 / Technical Feasibility 6 / Differentiation 4 / Defensibility 2 / Growth Potential 7 / AI Leverage 2 / Distribution Potential 7 / Viral Mechanism Strength 6
Overall score: 57/120 (4.8 avg)
Why this score may be wrong: Could underestimate Pain if challenge structure is truly missing; but competing with TikTok head-on is likely scored correctly as weak defensibility.

---

### Candidate 009: RitualRelay — Shareable Daily Habit Cards with Accountability Dyads

Problem: Pure habit trackers (Habitica, Loop) lack shareable output — streak alone doesn't spread. Daily rituals outside fitness/learning (budget, tidying, reading, mindful minutes) have no artifact others can see and react to without also adopting the habit. Notification fatigue kills solo tracking.
Target user: 20-35 habit-curious users who journal/budget/meditate and want social accountability without guilt. Overlaps with Finch/Strava audience (est. 10-30M).
Current solution: Habitica, Loop, Streaks, Finch (self-care pet), generic habit trackers, Duolingo-style streak anxiety.
Why current solution fails: Generic trackers ask 10 habits on day 1 (bloat), streak breaks punish illness/travel (guilt churn), lonely checkboxes with no social cost for skipping, nagging notifications without social context, no shareable artifact.
Proposed solution: Single-ritual app — pick ONE daily ritual (e.g., "no-spend day", "10-min tidy", "one page read") → complete → auto-generates beautiful daily card (Strava-style) shareable to Stories/WhatsApp. Pair into accountability dyads — your grace-day unlocks only if partner verifies. Weekly 7-day cohort sprints with pooled progress. Social loss aversion via streak-at-risk nudges to partner.
Why software can solve it: Habit state machine + card templating + dyad matching + push notifications + group progress engine. No AI needed for MVP; AI suggests ritual based on goal (later).
Viral mechanism: **Passive broadcast + invite-locked safety net.** (A) Daily card is shareable artifact — post to IG Story → followers tap "do this ritual too" CTA. (B) Dyad grace requires you to recruit 1 partner to avoid losing streak — functional invite. Falsifiable: share_rate (cards shared per completion) and dyad_creation_rate. If dyad_creation < 0.15 or share_rate < 0.10, loop fails.
Technical difficulty: Low — CRUD + templating + push + dyad logic.
Market opportunity: Habit/self-care — large but crowded with financing via freemium. Monetize via premium rituals, dyad features, cohort hosting.
Competitive advantage: Single-ritual focus + shareable card + dyad accountability — no incumbent combines these; Finch is closest but proxy-based, not peer-based.
Potential moat: Habit data + ritual community. Weak early — easily copied dyad mechanic.
Estimated build complexity: Low-medium — 3-4 weeks (card engine + dyad + cohorts).
Risks: Habit apps are notoriously high churn after 14 days regardless of social; shareable card may feel cringe for mundane habits (vs Strava run pride); dyad mechanic can create guilt/shame.
Unknowns: Will mundane habit cards get shared vs hidden? Does dyad improve retention or increase shame-quit? Can cohort sprints sustain?
Validation plan: Ship 3 ritual types, measure share_rate, dyad_creation_rate, D14 retention vs solo tracker baseline. Kill if D14 < 15% even with dyads or share_rate < 0.05.

Score (0-10 each): Pain 5 / Frequency 8 / Market Size 6 / Willingness to Pay 3 / Competition Gap 5 / Technical Feasibility 9 / Differentiation 5 / Defensibility 2 / Growth Potential 6 / AI Leverage 2 / Distribution Potential 6 / Viral Mechanism Strength 5
Overall score: 62/120 (5.2 avg)
Why this score may be wrong: Overestimates Pain — habit tracking is often self-imposed not externally painful; viral mechanism conflates two weak loops (broadcast + dyad) neither proven at >0.10; may underestimate competition if Finch/Strava extend to other rituals.

---

### Candidate 010: AgentFork — Remixable AI Agent Workspaces

Problem: 3M GPTs in GPT Store became a ghost town (INFERRED) — discovery is SEO spam, sharing is a static link with no attribution loop, agents are solo (no multiplayer, no fork/remix). Every agent platform solved hosting not inviting — recipient consumes without becoming a creator. No tool makes the artifact the invite.
Target user: AI power users, creators, and small teams (22-40) who build custom GPTs/agents/workflows and want to share them in a way that spreads.
Current solution: GPT Store, Poe, Character.ai, Claude Projects/Artifacts, AgentGPT/SmythOS directories.
Why current solution fails: Directory not network — no K-factor tracking, no remix wall, no multiplayer cursors, updating shared agent breaks links, no incentive for recipient to become creator. View is free but useless; fork requires manual reconstruction.
Proposed solution: Agent workspace where you build an agent/workflow (prompt+tools+memory) → share creates a locked interactive artifact (dashboard, app, research report) — view free, but "Remix / Run with your data / Fork" requires sign-up and creates attributed copy with lineage. Add @-mention co-pilot invites — teammate must join to accept subtask delegation. Fork chain leaderboard.
Why software can solve it: Agent runtime + forking/versioning + multiplayer workspace + attribution/lineage tracking + hosted execution.
Viral mechanism: **Remix Wall + Co-pilot Invite (PLG).** (A) Artifact view → intent to interact (remix/run/fork) hits wall → must sign up → creates attributed copy → their artifact now spreads. (B) Owner @-mentions teammate to delegate subtask → teammate must join to accept. Falsifiable: remix_rate (viewers who fork) and invite_accept_rate. If remix_rate < 0.05, it's a portfolio site not a network.
Technical difficulty: High — agent runtime, sandboxing, forking, multiplayer sync, execution infrastructure. Most complex candidate.
Market opportunity: Agent economy — nascent, hype-cycle dependent, fragmented; monetize via execution credits, pro agent features, team plans.
Competitive advantage: First to make artifact the invite (Figma/Canva analogy) — but must prove the pattern transfers to agents.
Potential moat: Agent library + fork network effects + execution data. Stronger IF it compounds.
Estimated build complexity: High — 8-12 weeks for credible MVP (runtime + forking alone are hard).
Risks: GPT Store ghost town pattern may be fundamental — people don't want to fork agents, they want to use them. High build cost to test a hypothesis that may not generalize; agent runtime security/sandboxing is hard; hype-cycle vulnerable.
Unknowns: Will anyone actually fork vs just use? Is agent sharing inherently niche (10k power users) not consumer viral? Does Figma's template pattern transfer to agents?
Validation plan: Build concierge test — 20 hand-built agent artifacts shared as links, measure view→remix intent vs actual fork willingness. Kill if remix_rate < 0.05 or qualitative feedback is "I'd just copy the prompt."

Score (0-10 each): Pain 4 / Frequency 5 / Market Size 4 / Willingness to Pay 5 / Competition Gap 6 / Technical Feasibility 4 / Differentiation 6 / Defensibility 6 / Growth Potential 6 / AI Leverage 7 / Distribution Potential 5 / Viral Mechanism Strength 5
Overall score: 63/120 (5.3 avg)
Why this score may be wrong: Could overestimate Pain — is agent discovery truly painful or just not interesting to most? Technical feasibility 4 may be too low if LLM APIs commoditize runtime; but forking/versioning complexity is real and dominates score.

---

## Round 1 Summary (pre-contrarian)

| Candidate | Name | Overall | Viral Strength | Top Risk |
|-----------|------|---------|----------------|----------|
| 001 | ClipForge | 79 | 7 | API costs, easily copied templates |
| 003 | PollPop | 76 | 7 | Voter→creator conversion unproven |
| 005 | StudyStreak | 73 | 6 | Seasonal, low WTP |
| 002 | RoastLab | 67 | 6 | Novelty decay |
| 004 | ShipTogether | 62 | 5 | Crowded collab market |
| 006 | CardDrop | 62 | 5 | Consumption without creation |
| 007 | VibeCheck | 52 | 4 | Not a product, weak loop |
| 008 | DuetChain | 57 | 6 | Competing with TikTok |

Top candidates for deeper competitive + technical research: 001, 003, 005 (highest scoring + strongest viral mechanisms).
Lowest: 007 (VibeCheck) — weak on almost every dimension. 004/006/008 below bar.

---

## Contrarian Attack Results (2026-08-14) — Top 3 candidates

### Candidate 001 ClipForge — VERDICT: KILL

Attack: Unit economics are fatal — at ~$0.64/8s ESTIMATE, viral success = burn acceleration. CapCut owns 200M MAU template flywheel at zero inference cost; viewer→template conversion <3% (INFERRED) proves output-is-the-ad doesn't convert at claimed rate. Sora via ChatGPT distribution makes standalone detour. Copyright/DMCA on remixed clips unaddressed. API latency collapses under viral load. Novelty spike with K-factor decay 0.4→<0.08 by week 2. Easily copied by ByteDance in weeks.

Near-miss: If company owned a model (no per-gen API cost), economics flip. Without that, cannot survive.
Action: Move to rejected_ideas.md. Do not build.

### Candidate 003 PollPop — VERDICT: WEAKEN (proceed only with validation)

Attack: Voter→creator conversion is 95-99% lurker assumption vs 15-20% loop requirement. IG/X external link throttling kills reach. Low WTP is structural (teens, <1% paid conversion). IG/X can clone card UI in a sprint — zero IP. Poll brigading/moderation + COPPA liability. Network effect decays after vote.

Why not KILL: Zero build cost (Supabase CRUD, no inference). Thesis is falsifiable in 3-5 days with a $0 concierge fake-door test (8 hand-made polls → 12-15 group chats → measure voter→creator CTR). If conversion ≥0.08, loop viable. If <0.03, KILL. Cheap enough to test before building.

Near-miss: Voter→creator conversion is the single existential assumption. Everything else is addressable if this holds.
Action: Design and require fake-door validation BEFORE any build commitment. See validation plan in Candidate 003 + detailed plan in agent output 2026-08-14.

### Candidate 005 StudyStreak — VERDICT: KILL

Attack: Quizlet's 60M library moat + SEO dominance means switching cost > novelty. Students $0 WTP, 9-month school procurement, seasonal dead zone (3 months summer), FERPA/COPPA burden. Quizlet Live already shipped classroom viral mechanic (2016). Streaks may increase shame-quit, not invite. K-factor 0.5→0.05→0 seasonally. Capped at class size 30, doesn't compound across schools.

Near-miss: Nothing — triple kill (seasonal + WTP + moat) requires no single fix.
Action: Move to rejected_ideas.md. Do not build.

### Candidates 009-010 — not contrarian-attacked directly; scored below bar

- 009 RitualRelay (62/120, Viral 5): Two weak loops (broadcast + dyad) neither proven >0.10; mundane habits share as cringe; high D14 churn regardless of social; Finch/Strava adjacency risk.
- 010 AgentFork (63/120, Viral 5): GPT Store ghost-town pattern may be fundamental; highest build complexity (8-12 weeks) to test unproven remix desire; niche power-user market.

---

## Final Ranked List (all 10 candidates, post-contrarian)

Scoring method: simple sum of 12 dimensions (0-10 each) = /120. Viral Mechanism Strength shown separately as semi-gating dimension — candidates scoring ≤3 here would be disqualified regardless of total. No candidate disqualified on viral gate alone (lowest = 4).

| Rank | Candidate | Total | Avg | Viral | Verdict | Why this ranking may be wrong |
|------|-----------|-------|-----|-------|---------|-------------------------------|
| 1 | 001 ClipForge | 79 | 6.6 | 7 | KILL (contrarian) | Killed despite highest score — unit economics + CapCut moat are score-external fatal flaws the rubric underweighted. Score overweighted Growth/AI and underweighted Defensibility/Cost. |
| 2 | 003 PollPop | 76 | 6.3 | 7 | WEAKEN→VALIDATE | Highest *surviving* score. But score may overestimate viral strength — voter→creator at 0.08 is HYPOTHESIS; real rate may be 0.02. Validation will falsify. |
| 3 | 005 StudyStreak | 73 | 6.1 | 6 | KILL (contrarian) | Seasonal/moat/WTP triple kill not captured in single-dimension scores. |
| 4 | 002 RoastLab | 67 | 5.6 | 6 | Below bar | Novelty decay not fully scored; defensibility 2 is likely accurate. |
| 5 | 010 AgentFork | 63 | 5.3 | 5 | Below bar | Technical feasibility 4 may be too harsh if runtime commoditizes; but ghost-town risk is real. |
| 6 | 004 ShipTogether | 62 | 5.2 | 5 | Below bar | Decision-as-object may be feature not product — market size 6 likely inflated. |
| 7 | 006 CardDrop | 62 | 5.2 | 5 | Below bar | Pain 4 may be too high — beautified insight may not be painful at all. |
| 8 | 009 RitualRelay | 62 | 5.2 | 5 | Below bar | Two weak loops ≠ one strong loop; Habit churn base rate dominates. |
| 9 | 008 DuetChain | 57 | 4.8 | 6 | Below bar | Competing with TikTok core mechanic — defensibility 2 likely still too high. |
| 10 | 007 VibeCheck | 52 | 4.3 | 4 | Disqualified | Weekly habit formation is hardest retention pattern; score correctly lowest. |

**Top surviving candidate: 003 PollPop — conditional on passing fake-door validation (voter→creator ≥0.08 within 7 days).** No candidate clears the §11 bar unconditionally today. PollPop is the only one where the contrarian's fatal assumption is testable at near-zero cost in under a week.

Next step: CEO report + gate-check. Recommendation will be: approve PollPop *for validation* (not for full build), with explicit kill criteria. If human approves, Phase 2 begins with the 3-5 day validation experiment, not with engineering.
