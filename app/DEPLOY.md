# PollPop Deploy Checklist

## 1. Apply Supabase migration

Project: `dgurslguhkatnshlzvfcy` (Supabase). DB password not needed — use Dashboard SQL Editor (API keys alone cannot run `psql`).

1. Open Supabase Dashboard > SQL Editor for `dgurslguhkatnshlzvfcy`.
2. Paste `app/supabase/migrations/001_init.sql` (idempotent, `IF NOT EXISTS`). Run.
3. Verify tables: `polls`, `poll_options`, `votes`, `events` exist with RLS policies `allow all *`.
4. Enable Realtime (required for live vote counts):
   ```sql
   alter publication supabase_realtime add table poll_options;
   alter publication supabase_realtime add table votes;
   ```
   Do this once; re-running is safe. If tables already added, Supabase returns notice.
5. Optional: create public Storage bucket `poll-images` (Storage > New bucket, public). Not required for MVP if you use image URLs.

## 2. Configure Vercel

1. Import from GitHub: `xpopdev/pollpop`, Root Directory = `app`, Framework = Next.js.
2. Environment Variables (Settings > Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL=https://dgurslguhkatnshlzvfcy.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from app/.env.local>`
   - `SUPABASE_SERVICE_ROLE_KEY=<service_role key>`
   - `IP_HASH_SALT=<random 32 hex>` (e.g. `openssl rand -hex 16`)
   - `NEXT_PUBLIC_APP_URL=https://<your-vercel-url>`
3. Build: `npm run build` (auto), Output `.next`, Node 20. No extra config.
4. Deploy. Edge OG at `/api/polls/[id]/og` needs no `sharp`.

## 3. Verify prod

1. Create poll: open `/`, add 2-4 images + labels, publish -> redirects to `/p/<id>`.
2. Vote: open `/p/<id>` in incognito (new `voter_cookie`), vote, see bars animate.
3. Live update: open same poll in second tab, vote in first, second updates within 5s (Realtime if enabled, else polling).
4. Share: copy link, paste into Slack/Discord -> OG image unfurls via `/api/polls/[id]/og`.
5. Metrics: open `/metrics` -> `poll_view`, `vote`, `cta_view`/`cta_click`, K-factor increment.
6. Check Supabase Table Editor: `polls`, `poll_options`, `votes`, `events` rows appear.

## 4. Local dev note

Mock mode works without Supabase: `cd app && npm install && npm run dev` uses in-memory + `.pollpop-mock.json` (gitignored). No env required. Prod requires the migration above — without it `/rest/v1/polls` returns 404/PGRST205 (table not found) and writes fail. `npm run build` passes in mock mode.
