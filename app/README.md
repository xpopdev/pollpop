# PollPop — Supabase MVP

## 06:00 manual unblock — prod writes 500

Prod `POST /api/polls` is 500 `fetch failed` until Vercel env + Storage bucket are fixed — see [`company/history/done_later.md`](../company/history/done_later.md) steps 1–3 (Vercel `NEXT_PUBLIC_SUPABASE_URL`/keys/`IP_HASH_SALT` + Supabase `poll-images` public bucket). After fix run [`scripts/verify-06am.sh`](../scripts/verify-06am.sh): `bash scripts/verify-06am.sh` (hits `pollpop-five.vercel.app`, 5 curls → 201/`poll-images`/`totals`/OG headers).

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
- Results: animated bars + live update — **Realtime poll:{id} on poll_options + 5s `GET /:id` fallback** (code `PollClient.tsx` `channel(poll:{id})` + `setInterval 5000`; publication `supabase_realtime` INFERRED until `pg_publication_tables`, propagation ESTIMATE <2s/5s until live 2-tab probe) — falls back automatically if ws drops
- Share: `Copy link` + Web Share API + OG image at `/api/polls/[id]/og` — **png-sharp nodejs** 1200×630 png via `sharp` 0.33 `runtime=nodejs` (`x-pollpop-og: png-sharp` 68kB `max-age=3600` VERIFIED live 200, `svg-nodejs` fallback)
- CTA: sticky bottom card on mobile, `?ref=poll_{id}` attribution, `cta_view` via IntersectionObserver
- Metrics: `/metrics` — CTR, voters/poll, K-factor, referred retention (all **ESTIMATE until ≥50 poll_view** + 7-day seed 8 polls → 12–15 chats per `seeding-plan-2026-08-15.md`; §29 labels stay ESTIMATE)

`npm run build` passes in mock mode — no env required.

## Run locally — WITH Supabase (flip via env, zero code change) — VERIFIED code, live INFERRED until Dashboard

1. Create a Supabase project at https://supabase.com
2. Run migrations `supabase/migrations/001_init.sql` + `002_vote_rpc.sql` + `003_rls_tighten.sql` + `004_storage.sql` + `005_color.sql` (via SQL editor or `supabase db push`). `004_storage.sql` creates bucket `poll-images` public true + anon `SELECT` / `service_role` ALL — file VERIFIED, live INFERRED until `select id,name,public from storage.buckets where id='poll-images'` or `vercel logs`.
3. Verify bucket: public `poll-images` exists (004). No manual create needed; manual bucket is fallback only. Binaries >2048 chars auto-upload via `app/app/api/polls/route.ts` → `poll-images/polls/{timestamp}.*`; URLs ≤2048 stay as-is.
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

5. Realtime: `poll:{id}` on `poll_options` (code `app/app/p/[id]/PollClient.tsx` `channel(poll:{id})` + `postgres_changes` `poll_options` + 5s `GET /:id` fallback). Publication must include `poll_options`; `votes` propagates via counts refresh — add `votes` to publication to observe raw votes (optional). In Supabase SQL editor run
```sql
alter publication supabase_realtime add table poll_options;
-- optional, for raw vote rows: alter publication supabase_realtime add table votes;
-- verify: select * from pg_publication_tables where pubname='supabase_realtime';
```
6. `npm run dev` — the app auto-detects env and switches to Supabase (check console: no `mock mode` warning). Live INFERRED until Dashboard.

No secrets are shipped to the client beyond the anon key.

## Deploy to Vercel

1. Push `app/` to GitHub (or connect repo in Vercel dashboard, set Root Directory to `app`)
2. Add the same env vars in Vercel → Settings → Environment Variables
3. Build command: `npm run build`, Output: `.next`
4. OG: `runtime=nodejs` png-sharp via `sharp` 0.33 at `/api/polls/[id]/og` — 1200×630 png, `cache-control: public, max-age=3600`, `x-pollpop-og: png-sharp` 68kB VERIFIED live 200, `svg-nodejs` fallback when sharp missing; never 500. SSR `og:image` via `generateMetadata` + `p/{id}.html` crawler fallback (code `app/app/api/polls/[id]/og/route.ts`, `app/app/p/[id]/page.tsx`).

## Testing

```bash
cd app
npm install

# unit only (vitest, jsdom, mock store — no Supabase needed, deterministic)
npm run test          # single run
npm run test:watch    # watch mode

# e2e (Playwright, mock mode via Next dev server, or prod if reachable)
npm run test:e2e      # runs against localhost (webServer) or PLAYWRIGHT_BASE_URL
#  PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e   # force local
#  PLAYWRIGHT_BASE_URL=https://pollpop-five.vercel.app npm run test:e2e  # prod

# all
npm run test:all      # vitest run && playwright test
```

- Unit tests live under `lib/*.test.ts` and `app/api/polls/route.test.ts` — they use the mock store (`isSupabaseConfigured=false`) so they are deterministic without Supabase.
- `lib/store.test.ts` — validates P0-1 (2-4 opts, label≤24, title≤80), rejects bad input, hash dedup last-wins, burst 50 concurrent votes additive.
- `lib/dedup.test.ts` — `pollpop_cid` uuid, `hashIpSync` deterministic, `clientIpFromHeaders` prefers `x-vercel-forwarded-for > x-real-ip` (drop `x-forwarded-for` per RT-SEC-04 fix VERIFIED `grep -r x-forwarded-for` 0 on old path) + HttpOnly Secure `SameSite=Lax` server `Set-Cookie` (code `app/app/api/polls/route.ts`, `app/app/api/polls/[id]/vote/route.ts`, `lib/dedup.ts`).
- `lib/analytics.test.ts` — beacon payload shape + single-fire per action.
- `app/api/polls/route.test.ts` — `POST /api/polls` 201 happy path, 400 validation.
- E2E: `e2e/create-vote-cta.spec.ts` — create → vote → bars + sticky CTA → `cta_view`/`cta_click` + OG meta `og:image`/`og:title`/`twitter:card`. Runs against mock mode (localhost) or prod if `PLAYWRIGHT_BASE_URL` is set.

Configs: `vitest.config.ts` (jsdom, `@/*` alias, `app/**/*.test.ts` + `lib/**/*.test.ts`), `playwright.config.ts` (baseURL `https://pollpop-five.vercel.app` with `http://localhost:3000` fallback via `webServer`).

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
