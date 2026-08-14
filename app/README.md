# PollPop — Supabase MVP

15s visual polls with a participation-required viral loop: **create → vote (no auth) → live results → share + OG → CTA “Create your own →” → new poll**.

This is **Phase 3 BUILD** after H-001 validation PASS (CTR ≥0.08 per `company/decisions/approved.md`). Spec authority: `company/product/requirements.md`, `architecture.md`, `ux.md`.

## Stack

- Next.js 14 App Router (TypeScript)
- Supabase (Postgres + Realtime + Storage) — **optional for dev**
- No auth-required voting, no feed, no monetization — P0 only

## Run locally — WITHOUT Supabase (mock mode, default)

No provisioning needed. The app runs with an in-memory + file-backed mock that implements the same store interface. Data persists to `.pollpop-mock.json` (git-ignored) and survives restarts.

```bash
cd app
npm install
npm run dev
# open http://localhost:3000
```

- Create polls with 2–4 images (drag / paste / file / URL), labels ≤24, title ≤80
- Vote: soft dedup via `cookie + ip_hash` (24h window, last write wins), transactional increment
- Results: animated bars + live update (polls every 5s + Supabase Realtime when configured, falls back automatically)
- Share: `Copy link` + Web Share API + OG image at `/api/polls/[id]/og` (edge SVG collage)
- CTA: sticky bottom card on mobile, `?ref=poll_{id}` attribution, `cta_view` via IntersectionObserver
- Metrics: `/metrics` — CTR, voters/poll, K-factor, referred retention (all ESTIMATE until real traffic)

`npm run build` passes in mock mode — no env required.

## Run locally — WITH Supabase (flip via env, zero code change)

1. Create a Supabase project at https://supabase.com
2. Run the migration: `supabase/migrations/001_init.sql` (via SQL editor or `supabase db push`)
3. Create a public Storage bucket `poll-images` if you will upload binaries (or use image URLs which skip Storage for MVP)
4. Copy env template and fill values:

```bash
cp .env.example .env.local
# fill:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# IP_HASH_SALT= (random 32 hex)
# NEXT_PUBLIC_APP_URL=http://localhost:3000 (or Vercel URL)
```

5. Realtime: in Supabase SQL editor run
```sql
alter publication supabase_realtime add table poll_options;
alter publication supabase_realtime add table votes;
```
6. `npm run dev` — the app auto-detects env and switches to Supabase (check console: no `mock mode` warning).

No secrets are shipped to the client beyond the anon key.

## Deploy to Vercel

1. Push `app/` to GitHub (or connect repo in Vercel dashboard, set Root Directory to `app`)
2. Add the same env vars in Vercel → Settings → Environment Variables
3. Build command: `npm run build`, Output: `.next`
4. OG images are edge-rendered SVG at `/api/polls/[id]/og` (cached `public, max-age=3600`). No `sharp`/`vercel/og` needed for MVP; swap to `vercel/og` collage later without changing callers (`lib/og.ts` is the seam).

## Project layout

```
app/
  app/
    layout.tsx                 — root layout + nav
    page.tsx                   — create (P0-1)
    p/[id]/page.tsx            — vote + results + CTA (server wrapper + PollClient)
    p/[id]/PollClient.tsx      — interactive poll (client)
    metrics/page.tsx           — hidden dashboard (CTR/K/referred retention)
    api/polls/route.ts         — POST create
    api/polls/[id]/route.ts    — GET fetch
    api/polls/[id]/vote/route.ts — POST vote (soft dedup)
    api/polls/[id]/og/route.ts — GET OG (edge SVG)
    api/events/route.ts        — POST beacon
    api/metrics/route.ts       — GET aggregated metrics
    globals.css                — design system (reuse validation tokens, polished)
  components/
    CreateForm.tsx, VoteGrid.tsx, ResultsBars.tsx, ShareRow.tsx, CTACard.tsx
  lib/
    types.ts, supabase.ts, dedup.ts, analytics.ts, og.ts, store.ts
  supabase/migrations/001_init.sql
```

## Key behaviors per specs (acceptance)

- **Create (P0-1):** title ≤80, 2–4 images (upload ≤5 MB or URL) + labels ≤24. Disabled submit until valid. `POST /api/polls` → `{id, url}` → redirect `p/{id}?created=1`.
- **Vote (P0-2):** tap image to vote, cookie+localStorage+`sha256(ip+salt)` soft dedup (24h), last write wins, 10 votes/IP/poll/24h 429 guard, optimistic <500 ms.
- **Live results (P0-3):** animated bars (%+count+total), optimistic then reconciled, Realtime subscription + 5s poll fallback, 0-vote empty state.
- **Share (P0-4):** stable `p/{id}`, OG meta via `generateMetadata` (server) + `/api/polls/[id]/og`, Copy + Web Share API, unfurls in WhatsApp/iMessage/Discord.
- **CTA (P0-5):** sticky bottom card on 375px, `cta_view` once via IntersectionObserver, `cta_click` with `?ref=poll_{id}`.
- **Metrics (P0-6):** `poll_view, vote, cta_view, cta_click, poll_create*` → CTR/K/referred retention at `/metrics` + `/api/metrics`.
- **Abuse (P0-7):** per-IP caps, title profanity gate, NSFW hook point (async, pluggable).

## Environment variables

| Var | Required | Notes |
|-----|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | no (mock) | If missing, mock mode activates |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no (mock) | Client reads via anon |
| `SUPABASE_SERVICE_ROLE_KEY` | no (mock) | Server writes only |
| `IP_HASH_SALT` | no | Salt for `sha256(ip+salt)`; defaults to `local-dev-salt-change-me` |
| `NEXT_PUBLIC_APP_URL` | no | For absolute OG URLs; defaults to request host |

## Troubleshooting

- **Images not showing?** Pasted URLs must be direct image links; data URLs from file picker work in mock mode but need Storage in production for persistence across instances.
- **Votes not live?** Mock mode uses 5s polling automatically. With Supabase, ensure Realtime publication includes `poll_options`/`votes`.
- **Build fails?** In mock mode the app has no Supabase dep at build time — ensure `npm install` succeeded and Node ≥18.

## Evidence labels

All non-obvious claims in code comments/specs are tagged `VERIFIED / INFERRED / HYPOTHESIS / ESTIMATE / UNKNOWN` per CLAUDE.md — keep them as Supabase is provisioned and metrics become VERIFIED.
