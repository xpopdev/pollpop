# Security — Phase B — 2026-08-14

**Fixed (VERIFIED):** 003 `003_rls_tighten.sql` — dropped `allow all` `using (true)` on polls/poll_options/votes/events (RT-SEC-01 Critical, now resolved); anon `SELECT` only, `service_role` `ALL` — writes via `supaService()` API routes. 004 `004_storage.sql` — `poll-images` bucket public-read / service-write; data URLs offloaded in `POST /api/polls`. OG `api/polls/[id]/og` — `content-security-policy: default-src 'none'` + `x-content-type-options: nosniff` on PNG+SVG, `escapeXml` now covers `'` (RT-SEC-08). Rate — 5/hr create (`create:${ip}`) + 10/poll/24h vote (`vote:${poll_id}:${ip_hash}`), 2 KB `meta` cap.

**Remains (Medium — next):** `HttpOnly; Secure` cookie still missing — `dedup.ts:27` JS-readable `pollpop_cid` + `x-pollpop-cid` header trusted (RT-SEC-05). `clientIpFromHeaders` trusts `x-forwarded-for` first entry — must use `x-vercel-forwarded-for`/`req.ip` or rate bypass persists (RT-SEC-04). Also `IP_HASH_SALT` fallback `dev-salt`, unbounded `image_url`/`meta` size, `events` `poll_id`/`ref` unvalidated.

No formal threat-model sign-off. **Quality-bar security: PARTIAL.**

Refs: `red-team-2026-08-14.md`, `rls-2026-08-14.md`, `003_rls_tighten.sql`, `004_storage.sql`, `app/api/polls/[id]/og/route.ts:88`, `lib/store.ts:188/298`, `lib/dedup.ts:27/59`.
