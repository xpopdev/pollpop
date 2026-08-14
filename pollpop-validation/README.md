# PollPop — Fake-Door Validation MVP

> **Mission:** measure the single number that decides if PollPop gets built: **voter → creator CTR** = `cta_clicks / unique_voters` after a voter sees live results and the primary CTA “Create your own poll — 15s →”.

- **≥ 0.08 → PASS** → build the 1–2 week Supabase MVP
- **0.03–0.08 → RETRY** → one iteration (tweak CTA copy/placement/images), re-measure; if still < 0.08 → KILL
- **< 0.03 → KILL** → archive to `rejected_ideas.md`, return to discovery

Source of truth: `company/decisions/approved.md` (“PollPop selected for Validation (NOT Build)”).

---

## What this is

A **static, zero-backend validation site** that simulates the core PollPop loop:

1. **Poll view** — beautiful 2–4 image options, tap to vote
2. **Vote → Results** — live tally bars/percentages + **primary CTA** (the metric)
3. **CTA click → Fake-door form** — “Pick a template / Add your options” → “You’re #N in line — we’ll DM your poll link in 2hrs” (concierge intent)
4. **Shareable link with OG preview** — per-poll `og:image` + `og:title` + `og:description`

No npm, no build step, no server. `python -m http.server` is enough. All counting is `localStorage` per-browser (sufficient for a $0 validation — we’re measuring CTA intent, not vote integrity).

---

## Run locally

```bash
cd pollpop-validation
python -m http.server 8000
# open http://localhost:8000
```

Any static host works too (GitHub Pages, Netlify, Cloudflare Pages, Vercel): drag the `pollpop-validation/` folder.

> **Important:** open via `http://` (not `file://`). `fetch('data/polls.json')` is blocked on `file://`.

---

## Pages

| Path | What it is |
|---|---|
| `index.html` | Discovery — 8 premium poll cards, category filter, live vote totals |
| `poll.html?id=fit-check` | **Individual poll view** — select → vote → results + primary CTA (query-param routing). Also accepts `?poll=X`. No `id` → defaults to first poll. |
| `p/{id}.html` | **Static OG pages** for crawlers (WhatsApp / iMessage / Discord). Each has baked `og:image` + `og:title` + `og:description` + canonical to `poll.html?id=X` + meta-refresh/JS redirect. Share `p/fit-check.html` when you want the unfurl to work without JS. |
| `create.html` | **Fake-door form** — template picker, 2–4 options, handle input. Submit shows “You’re #N in line — we’ll DM your poll link in 2hrs”. `?from={poll_id}` pre-fills context when you arrived via the CTA. |
| `metrics.html` | **Hidden dashboard** — KPIs, per-poll breakdown, kill-criteria verdict, event log, export. |
| `data/polls.json` | 8 poll definitions (title, question, 2–4 image options via `picsum.photos`, seed-stable) |

### 8 polls (picsum placeholders, swap anytime)

- `fit-check` — Which fit for date night? (2 options)
- `brunch-crew` — Where are we eating Saturday? (4 options)
- `logo-battle` — Which logo for my coffee shop? (2)
- `thumbnail-wars` — Which YouTube thumbnail pops? (3)
- `sneaker-drop` — Which sneakers should I cop? (2)
- `living-room` — Which living room vibe? (3)
- `album-cover` — Which album cover goes harder? (2)
- `airbnb-pick` — Which Airbnb for the group trip? (3)

---

## Analytics — how tracking works

All events are `console.log`’d and appended to `localStorage.pollpop_events` (offline, no network).

| Event | When | Payload |
|---|---|---|
| `poll_view` | poll page loads | `poll_id, timestamp, voter_id` |
| `vote` | vote button clicked | `poll_id, option, timestamp, voter_id` |
| `cta_view` | results + CTA became visible | `poll_id, timestamp` |
| `cta_click` | user clicked **“Create your own poll — 15s →”** | `poll_id, timestamp` — **PRIMARY METRIC** |
| `fake_door_submit` | fake-door form submitted | `poll_id, template_choice, question, timestamp` |
| `create_view` | create page loaded via CTA | `poll_id` |
| `index_view` | index loaded | — |

**Metrics surfaced:**

- `metrics.html` — KPI tiles (total views, votes, cta_views, cta_clicks, **CTR**), per-poll table, verdict banner, event log, export JSON / copy summary.
- **Console:** `PollPopAnalytics.computeMetrics()` → `{ poll_views, votes, cta_views, cta_clicks, fake_submits, unique_voters, ctr, per_poll, events }`
- **Console:** `PollPopAnalytics.getEvents()` → raw event array
- **Console:** `PollPopAnalytics.verdictForCtr(ctr)` → PASS/RETRY/KILL label
- **localStorage keys:** `pollpop_events`, `pollpop_tallies` (per-poll vote counts), `pollpop_voted` (voted map), `pollpop_voter_id` (stable per browser = unique voter)

**Vote counts:** `pollpop_tallies` is seeded from `polls.json` `votes` and incremented in `localStorage` on each vote. Survives refresh. Clear via metrics “Reset data” or index “Reset my demo data”.

---

## How to run the 7-day experiment

1. **Host it** — one of:
   - `python -m http.server 8000` on a laptop + [ngrok](https://ngrok.com/) or Tailscale for a public URL, or
   - push `pollpop-validation/` to GitHub Pages / Netlify (drag-and-drop, no build).
2. **Seed 12–15 real group chats** — DM the **OG link** (`p/fit-check.html` etc.) to group chats where “which one?” is natural. Vary polls per chat so it doesn’t feel like spam. The `og:image` makes WhatsApp/Discord/iMessage unfurl — without it CTR collapses ~50–70%.
3. **Don’t explain the CTA** — let voters discover results + CTA naturally. Results page is where the measurement happens.
4. **After 7 days** (or ~30+ unique voters), open `metrics.html` or run `PollPopAnalytics.computeMetrics()` in the console. **CTR = cta_clicks / unique_voters.**
5. **Decide:**
   - `CTR ≥ 0.08` → **PASS** → scaffold the real Supabase MVP (create-vote-share-results-CTA + OG render + soft dedup + NSFW + K-factor instrumentation).
   - `0.03 ≤ CTR < 0.08` → **RETRY** once: tweak CTA copy, placement (sticky bottom vs inline), image-vs-text framing, then re-measure. If still < 0.08 → KILL.
   - `CTR < 0.03` → **KILL** → archive PollPop to `company/research/rejected_ideas.md`, return to Phase 1 discovery.

**Also KILL if:** `voters_per_poll < 3` across >10 polls (no pull), or link unfurl suppressed >50% vs direct (platform risk confirmed).

To keep data clean per re-test, use “Reset data” on `metrics.html` between cohorts, or open the site in a new browser/profile (fresh `voter_id`).

---

## Shareable links (OG preview)

Two forms resolve to the same poll:

- **Dynamic:** `poll.html?id=fit-check` — pretty for humans, OG set via JS (fine for in-app browsers, but some link crawlers don’t run JS).
- **Static crawler-safe:** `p/fit-check.html` — baked OG tags, canonical to `poll.html?id=fit-check`, instant redirect for humans. **Use this form when you seed WhatsApp / iMessage / Discord** so the image preview always works.

Test unfurl: paste the link into a WhatsApp message to yourself before seeding.

---

## Deploy

Because it’s vanilla HTML/CSS/JS + JSON:

- **GitHub Pages:** repo Settings → Pages → Serve from `/pollpop-validation` (or copy its contents to `docs/` / `gh-pages` branch).
- **Netlify:** drag `pollpop-validation/` onto <https://app.netlify.com/drop>
- **Cloudflare Pages / Vercel:** “Upload folder” → select `pollpop-validation/`.
- Any static file server: `npx serve pollpop-validation`, `python -m http.server`, `caddy file-server`, etc.

No env vars, no build, no API keys. Images are `picsum.photos` — replace with Unsplash/Cloudinary URLs in `data/polls.json` whenever you want.

---

## Kill criteria (binding)

Repeated here verbatim so the validator doesn’t have to chase files:

> **CTR = cta_clicks / unique_voters (7 days, fake-door)**
> - `< 0.03` → KILL
> - `0.03–0.08` → one retry → if still `< 0.08` → KILL
> - `≥ 0.08` → PASS → build real MVP

Plus: also KILL if `voters_per_poll < 3` across >10 polls, or external-link unfurl suppressed >50% vs direct.

---

## Tech notes

- **No dependencies.** No npm, no bundler, no framework. Works offline after first load (except images).
- **localStorage-only** tallies + analytics — vote integrity is not the point; CTA intent is.
- **Dedup:** revote is blocked per-browser (`pollpop_voted`); change option isn’t allowed in validation (keeps data simple). Real MVP would add cookie + soft IP fingerprint.
- **OG:** per-poll `og:image/title/description` (static in `p/*.html`, dynamic in `poll.html`). Real MVP would render a dynamic OG collage server-side.
- **Design:** mobile-first, premium cards, gradient CTA (the CTA *is* the product surface — it has to feel worth tapping). System fonts only.
- **Extending:** to add a real backend later, keep the event names — they become the K-factor instrumentation (`creator_conversion_rate`, `referred_retention`, etc. per `company/decisions.md` viral amendment).

---

## Files

```
pollpop-validation/
├── index.html          # discovery
├── poll.html           # poll view + vote → results + CTA  (?id=X)
├── create.html         # fake-door form (?from=X)
├── metrics.html        # dashboard + verdict + export
├── css/style.css       # all styles (no framework)
├── js/analytics.js     # track(), computeMetrics(), verdictForCtr()
├── js/app.js           # fetchPolls(), shareUrlFor(), helpers
├── data/polls.json     # 8 polls
└── p/{id}.html         # 8 static OG pages (crawler-safe shares)
```
