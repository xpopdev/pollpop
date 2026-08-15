# Architecture — PollPop MVP

> VERIFIED prod `347f22c` + CI `8d0d793`. Next.js + Supabase + Vercel. Docs lean pass 07 — audit vs code `app/app/api/polls/route.ts`, `app/app/api/polls/[id]/og/route.ts` (`nodejs` `sharp` 0.33), `app/app/p/[id]/PollClient.tsx` (`poll:{id}`+5s), `lib/dedup.ts`+`app/app/api/polls/*` (HttpOnly Secure x-vercel-forwarded-for). Costs ESTIMATE until metered. §29 labels honest: VERIFIED file/code vs INFERRED live until Dashboard/`vercel logs`/2-tab probe.

## Stack (lean, §29 labeled)

| Layer | Choice | Evidence |
|---|---|---|
| App | **Next.js App Router** — SSR OG + API colocation | VERIFIED |
| DB | **Supabase** Postgres + Realtime + Auth optional | VERIFIED |
| Storage | **004 Storage poll-images public** — bucket `poll-images` public true, anon `SELECT` / `service_role` ALL (`004_storage.sql` VERIFIED file, live INFERRED until Dashboard/`vercel logs` `select ... from storage.buckets`); route `app/app/api/polls/route.ts` uploads data: URLs → `poll-images/polls/*` via `supa.storage` | VERIFIED/INFERRED |
| OG | **OG png-sharp via sharp (nodejs runtime)** — `app/app/api/polls/[id]/og/route.ts` `runtime="nodejs"` `sharp 0.33` → 1200×630 png `max-age=3600` `x-pollpop-og: png-sharp` 68kB VERIFIED live 200; `svg-nodejs`/`svg-fallback-error` fallback; SSR `og:image` + `p/{id}.html` crawler fallback (`app/app/p/[id]/page.tsx`) | VERIFIED live 200 |
| Realtime | **Realtime poll:{id} + 5s fallback** — `poll:{id}` on `poll_options` via `supabase_realtime` (code `PollClient.tsx` `channel(poll:{id})` `.on("postgres_changes" poll_options)`, `setInterval 5000` `GET /:id` when `showResults`; publication INFERRED until live `pg_publication_tables`, propagation ESTIMATE <2s/5s until 2-tab probe) | ESTIMATE <2s/5s |
| Dedup | **HttpOnly Secure + x-vercel-forwarded-for (next-increment-04)** — `Set-Cookie: pollpop_cid HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000` server-set in `app/app/api/polls/route.ts` + `app/app/api/polls/[id]/vote/route.ts` (code `getCookieFromHeader` prefer HttpOnly, `x-pollpop-cid` fallback only then rotate); `clientIpFromHeaders` → `x-vercel-forwarded-for > x-real-ip` (drop `x-forwarded-for` → RT-SEC-04 fix VERIFIED grep old path 0, `lib/dedup.ts`) | VERIFIED code |
| Hosting | Vercel `pollpop-five.vercel.app` (`prj_H0sE6sr...`) | VERIFIED |

No inference/GPU — cheap falsification.

## Data model

`polls(id nanoid, title ≤80, og_image_url, status)` · `poll_options(id,poll_id,label≤24,image_url,thumb_url,position,votes,color — 005)` · `votes(id,poll_id,option_id,voter_cookie,ip_hash,unique poll+voter+hash)` · `events(id,name,ref,meta 2KB cap)`.

## API

`POST /polls` (data:URLs → Storage) · `GET /:id` · `POST /:id/vote` via `increment_vote` RPC atomic 002 last-wins · `GET /:id/og` png-sharp nodejs · `POST /events` · `GET /metrics`.

## Realtime + OG + Dedup (key details)

Realtime debounce 150–300ms ESTIMATE. Burst 10 VERIFIED 10/10 with distinct `x-vercel-forwarded-for` (same-IP → 1,0 by 10/poll/24h cap). OG compose at create → Storage `og_image_url`, edge cached 3600. Dedup 24h window, 10/poll/24h + 5/hr create → 429; IP never stored raw.

## Failure

Realtime down→5s poll; upload fail→retry; OG fail→degraded; NSFW down→publish+recheck. Not chaos-tested live. Non-MVP: auth, feed, monetization, Redis.
