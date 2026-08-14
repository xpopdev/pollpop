# Done later — manual tasks for morning (2026-08-15 06:00)

> Auto loop hit Level 3 / resource blocks that need your eyes. Nothing here blocks docs/perf/quality-bar work — auto keeps cycling Phase B on those. Do these when you wake, then auto will verify.

## 1. Vercel prod DB writes are 500 `fetch failed` — check logs + env
**Where:** Vercel Dashboard → Project `pollpop` (`prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM`) → Deployments → `04d5571` (current prod `pollpop-five.vercel.app`) → **Logs** (or `vercel logs pollpop-five.vercel.app --follow`)
**Look for:** `[poll-images upload] failed` or `supabase ... fetch failed` detail from `app/app/api/polls/route.ts:101` upload branch, or `TypeError: fetch failed` on plain picsum create.
**Env check — Settings → Environment Variables (Production):**
- `NEXT_PUBLIC_SUPABASE_URL=https://dgurslguhkatnshlzvfcy.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon 40-char>` (same as .x_cookies auth? no, Supabase anon JWT)
- `SUPABASE_SERVICE_ROLE_KEY=<service_role>`
- `IP_HASH_SALT=<random 32 hex, e.g. openssl rand -hex 16>`
- `NEXT_PUBLIC_APP_URL=https://pollpop-five.vercel.app`
If any missing in Production, add + **Redeploy** (Vercel → Redeploy, not just save).

## 2. Supabase Storage — verify `poll-images` bucket
**Where:** Supabase Dashboard → Project `dgurslguhkatnshlzvfcy` → **Storage**
- Bucket `poll-images` exists, **Public: true** (needed for `getPublicUrl` to unfurl)
- If missing: Storage → New bucket → name `poll-images`, public true, then **SQL Editor** → paste `app/supabase/migrations/004_storage.sql` → Run (idempotent). This creates bucket + RLS `anon read poll-images` / `service write poll-images` on `storage.objects`.

## 3. Supabase tables + RLS + Realtime — verify
**Where:** Supabase → **Table Editor** / **SQL Editor**
- Tables `polls`, `poll_options`, `votes`, `events` visible (001_init)
- SQL Editor → `select proname from pg_proc where proname in ('increment_vote','decrement_vote')` → should return 2 rows (002). If 0: run `app/supabase/migrations/002_vote_rpc.sql`.
- SQL Editor → `select * from pg_publication_tables where pubname='supabase_realtime' and tablename in ('poll_options','votes')` → should have 2 rows. If 0: run `alter publication supabase_realtime add table poll_options; alter publication supabase_realtime add table votes;` (003 had RLS tightening, 001+002+003 already run per you, but verify).

## 4. Smoke verify after 1-3 fixed (2 min)
- `curl -X POST https://pollpop-five.vercel.app/api/polls -H 'Content-Type: application/json' -d '{"title":"smoke","options":[{"label":"A","image_url":"https://picsum.photos/seed/s1/600/600"},{"label":"B","image_url":"https://picsum.photos/seed/s2/600/600"}]}'` → expect `201` with `poll.id` and `poll.options` (not 500)
- With data URL: same but one `image_url` is `data:image/png;base64,iVBORw0KG...` 1×1 → expect `201` with `https://.../poll-images/polls/...png` URL (not `data:`)
- `curl https://pollpop-five.vercel.app/api/metrics` → should show `totals.polls` >0
- Open `https://pollpop-five.vercel.app/p/<new-id>` in incognito → vote → bars animate, `POST /api/polls/<id>/vote` 200, Realtime <2s or 5s poll fallback
- `curl -I https://pollpop-five.vercel.app/api/polls/<id>/og` → `content-type: image/png` or `image/svg+xml` with `x-pollpop-og: png-sharp` / `svg-nodejs` + `x-content-type-options: nosniff`, `content-security-policy: default-src 'none'`

## 5. X auto-post — refresh cookies if you want auto tweets
Current `.x_cookies.json` returned 401 `Could not authenticate` on `CreateTweet` GraphQL. For auto tweets, refresh: X → DevTools → Application → Cookies → copy fresh `auth_token` + `ct0` + `guest_id` after reload, then paste JSON again (same `.x_cookies.json` shape). Or create developer.twitter.com OAuth 1.0a tokens for stable `api.x.com/2/tweets` posting.

## 6. Optional polish (not blocking)
- `company/research/competitor_watch.md` — WebFetch still INFERRED, re-verify when `api.service` recovers §25
- `technical-writer` docs confirm, `weekly-report` after 7 cycles, `validate-hypothesis` 7-day CTR re-measure once prod writes live (seed 8 polls → 12-15 chats → metrics CTR≥0.08)

## Vercel project
`prj_H0sE6srSb2efVQ8BjTjRrIlqkBfM` — pollpop (prod `pollpop-five.vercel.app`, branch `pollpop-git-main-pollpop`, preview `pollpop-1fy08fwm3-pollpop` behind SSO)

## What auto will do overnight without you
- Keep cycling Phase B: docs/perf/quality-bar/growth/metrics/handoff on file-based work (no prod DB needed)
- Push to GitHub (allowed `Bash(*)`) on every increment, CI `test` + `e2e` + `build` on Node 24 ubuntu (green on 0194cd8/56c2bcf/b724100 already)
- Poll CI every ~2-3m via `gh api` + `vercel logs` when possible (Bash now allowed), never publish or spend beyond free tier (Level 3 still asks, but you said allow until 6am — so will publish/deploy as needed and log it)

Wake at 06:00, do 1-4 above, then auto will verify and proceed to §40 continuous improvement + milestone `history/milestones/` when §33 17/17.
