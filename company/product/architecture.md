# Architecture — PollPop MVP

> DRAFT — contingent on H-001 PASS (CTR ≥0.08). Do not build until validation passes per `company/decisions/approved.md`.

## Stack choice (justified, per `company/research/technologies/poll_infra.md`)

| Layer | Choice | Why | Evidence |
|---|---|---|---|
| App framework | Next.js (App Router) or SvelteKit — either is fine; default Next.js for OG + SSR + API routes co-location | SSR for OG tags + static fallback, API routes for vote/create, widest Vercel/Supabase examples | VERIFIED |
| DB + Realtime + Auth (optional) + Storage | **Supabase** (Postgres + Realtime + Auth + Storage/R2) | One vendor for DB, realtime broadcast, anon auth, image storage. Realtime is a solved pattern for burst tally. Cheapest path to 1–2w MVP. | VERIFIED per `poll_infra.md` — §29 VERIFIED |
| Image CDN / processing | Supabase Storage + `sharp` (Node) or Cloudflare Images | Resize to 600×600/600×750 + generate 1200×630 OG collage. Sharp is standard; Cloudflare Images offloads if traffic spikes. | VERIFIED |
| OG rendering | `vercel/og` (Satori) or `sharp` collage | Dynamic per-poll 1200×630 image. Satori for text overlays, sharp for photo collage. Either satisfies WhatsApp/Discord unfurl. | VERIFIED technique |
| Hosting | Vercel (frontend + API routes) or Cloudflare Pages | OG edge rendering, SPA fallback. Pair with Supabase. | VERIFIED |
| Analytics | Supabase table (events) + hidden `/metrics.html` page | No external analytics needed for MVP; keeps attribution chain simple. | INFERRED minimal |
| Moderation | Cloudflare Images moderation or AWS Rekognition NSFW (async) | Low UGC risk vs video, but image polls need a gate. Provider is pluggable. | VERIFIED services exist; choice INFERRED |

**Non-choice:** No inference/GPU cost. Cost model is infra pennies (see below). This is why contrarian WEAKEN'd rather than KILL'd PollPop — $0 inference makes a cheap falsification viable.

---

## Data model (Postgres / Supabase)

```sql
-- polls
polls (
  id            text pk,          -- short nanoid 8-10 chars, url-safe
  title         text not null,    -- ≤80 chars
  context       text,             -- optional line
  category      text,             -- Style/Food/Design/Creator/Travel etc (from validation seeds)
  creator_cookie text,            -- anon cookie at creation (no FK yet)
  creator_id    uuid nullable,    -- FK to auth.users when optional auth exists
  created_at    timestamptz default now(),
  og_image_url  text,             -- 1200x630 collage in Storage
  status        text default 'active' -- active | flagged | removed
)

-- poll_options: 2-4 per poll
poll_options (
  id            text pk,
  poll_id       text fk -> polls.id,
  label         text not null,    -- ≤24 chars
  image_url     text not poll,
  thumb_url     text,             -- 600x600/750 compressed
  position      smallint,         -- 0..3
  votes         int default 0      -- denormalized counter, updated transactionally
)

-- votes: one row per counted vote (soft dedup key enforces uniqueness)
votes (
  id            uuid pk default gen_random_uuid(),
  poll_id       text fk -> polls.id,
  option_id     text fk -> poll_options.id,
  voter_cookie  text not null,
  ip_hash       text not null,    -- sha256(ip + salt), not raw IP
  created_at    timestamptz default now(),
  unique (poll_id, voter_cookie, ip_hash) -- fuzzy dedup window enforced via app + partial index
)

-- events: lightweight analytics (see Instrumentation)
events (
  id            uuid pk default gen_random_uuid(),
  name          text not null,    -- poll_view | vote | cta_view | cta_click | poll_create_start | poll_create | share_copy | share_native
  poll_id       text nullable,
  cookie        text,
  ref           text nullable,    -- e.g., poll_abc123 for attributed creates
  meta          jsonb,
  created_at    timestamptz default now()
)

-- rate-limit helper is in-memory/Redis or Postgres advisory; no table needed for MVP
```

Indexes: `polls(created_at)`, `poll_options(poll_id)`, `votes(poll_id)`, `votes(ip_hash, created_at)`, `events(name, poll_id, created_at)` — tune after first load (INFERRED).

---

## API surface (Next.js API routes or Supabase RPC)

```
POST   /api/polls                — create poll (multipart: title, context, 2-4 images/labels) → { id, url, og_image_url }
GET    /api/polls/:id            — fetch poll + options + counts
POST   /api/polls/:id/vote       — { option_id } + cookie → { counts } + broadcast via Realtime
GET    /api/polls/:id/og         — 1200x630 OG image (edge-rendered, cached)
POST   /api/events               — { name, poll_id, ref, meta } (beacon, no auth)
GET    /api/metrics              — aggregated CTR/K/voters_per_poll (hidden, no auth for MVP; add key later)
```

All endpoints are idempotent where it matters: vote is upsert-on-(poll_id, voter_cookie, ip_hash) — last vote wins.

---

## Realtime tally

- Channel: `poll:{id}` via Supabase Realtime (Postgres changes on `poll_options.votes` or `votes` insert).
- Client subscribes on `p/{id}` mount; receives `counts` payload; animates bars (optimistic first, confirmed on ack).
- Burst handling: transactional increment (`update poll_options set votes = votes + 1 where id = :option_id`) + debounce broadcast 150–300 ms window (ESTIMATE) to avoid storm. (INFERRED best practice per `poll_infra.md`.)
- Fallback: polling `GET /api/polls/:id` every 5s if websocket drops (INFERRED resilience).

---

## OG / link preview (critical for share CTR)

- At poll creation: server composes 1200×630 collage (2–4 thumbs + title overlay) → uploads to Storage → sets `polls.og_image_url`.
- SSR: `p/{id}` page renders `<meta property="og:image" content="{og_image_url}">`, `og:title`, `og:description`, `twitter:card=summary_large_image`.
- Static fallback for crawlers that don't execute JS: `p/{id}.html` is a pre-rendered or edge-rendered static HTML with OG tags (generated at create time or via ISR). This is how validation's 8 polls unfurl today; same pattern for MVP.
- Cache: `og:image` URL is content-addressed (or versioned) and cached at edge with `Cache-Control: public, max-age=3600, stale-while-revalidate` (ESTIMATE).

---

## Soft dedup + abuse controls

**Vote dedup (fuzzy, not strict — preserves virality per `poll_infra.md`):**
- Key: `cookie (uuid v4, httpOnly false for JS + httpOnly mirror) + localStorage backup + ip_hash (sha256 of IP + server salt)`.
- Rule: one counted vote per `(poll_id, voter_cookie, ip_hash)` window. Changing vote = update existing row (last write wins), not new row. Clearing cookie but same IP stays soft-blocked for window (ESTIMATE: 24h sliding window). No hard identity.

**Rate limiting:**
- Per-IP-per-poll vote cap: 10 / 24h (ESTIMATE).
- Create cap: 5 polls / IP / hour (ESTIMATE).
- Implemented via Postgres advisory or in-memory counter + `429` with `Retry-After`. Tune live; do not over-engineer with Redis for MVP.

**NSFW / moderation (minimal viable):**
- Image upload → async NSFW check (Cloudflare Images moderation or Rekognition `DetectModerationLabels`). While pending, poll is `active` but flagged images are blurred in UI. Flagged → `status=flagged`, held from public listing (when listing exists), with manual unflag path.
- Title/profanity filter: simple word list for MVP (INFERRED — replace with LLM vision/text filter only if abuse appears).

**Privacy:** Raw IP is never persisted — only `ip_hash` (salted SHA-256) is stored, and only for the dedup window. No PII in `events`. (§29 UNKNOWN — legal review deferred but posture is conservative.)

---

## Cost model — $0 inference

| Item | Cost at MVP scale (ESTIMATE) | At 100k polls / 1M votes | Notes |
|---|---|---|---|
| Supabase (Postgres+Realtime+Storage) | Free tier covers MVP; $25/mo Pro thereafter | $25–$50/mo (ESTIMATE) | No inference line item |
| Vercel / edge | Free–$20/mo (hobby/pro) | $20–$50/mo (ESTIMATE) | OG rendering at edge is cheap |
| Image storage + bandwidth | Pennies — ~200 KB / image avg | ~$5–$15/mo (ESTIMATE) | 2–4 images per poll |
| NSFW checks | $0–$10/mo at MVP volume | Pay-per-image, ~$0.001/img (ESTIMATE) | Only on create |
| Total MVP month 1 | **~$0–$25** (ESTIMATE) | **~$50–$115/mo** (ESTIMATE) | Gross margin is infra pennies |

All numbers are ESTIMATE until metered. No GPU, no per-generation cost — the reason PollPop's validation is cheap.

---

## Deploy target

- **Primary:** Vercel + Supabase (Postgres in same region as Vercel edge). GitHub `main` → Vercel deploy (or Cloudflare Pages if Vercel friction). Docs/validation site remains on GitHub Pages at `xpopdev.github.io/pollpop` independently.
- **Env:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `IP_HASH_SALT`, `OG_CACHE_TTL` — no secrets in client bundle beyond anon key.
- **Migrations:** Supabase SQL migrations checked into `supabase/migrations/`.
- **Rollback:** Vercel instant rollback + Supabase point-in-time recovery (PITR on Pro) — INFERRED, verify on setup.

## Failure modes & what we do

| Failure | Behavior |
|---|---|
| Supabase Realtime down | Fallback poll every 5s; vote still works transactionally |
| Image upload fails | Inline retry + "paste image URL" fallback |
| OG render fails | Serve poll without OG image (degraded unfurl), queue retry |
| NSFW provider down | Allow publish, queue re-check — don't block creation |
| Rate limit hit | 429 with human message ("too many votes — try again in X") |

---

## What we don't build for MVP

Auth-required voting, discovery feed/leaderboard, ranking, monetization, native app. No Redis, no queue, no microservices. One DB, one realtime channel type, one OG path. Reference `technologies/poll_infra.md` for deferred AI option (poll suggestions) — not MVP.
