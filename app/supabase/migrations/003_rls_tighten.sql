-- 003_rls_tighten.sql — fix RT-SEC-01 (Critical): anon anon key could write/delete via PostgREST
-- Before: `allow all` using (true) with check (true) on polls/poll_options/votes/events — anyone with anon key could INSERT/UPDATE/DELETE.
-- After:  anon can SELECT (reads via Supabase anon key / PostgREST), only service_role can INSERT/UPDATE/DELETE (writes via API routes using supaService()).
-- App usage matches: client reads via supaAnon() (PollClient, metrics), all writes go through API routes -> lib/store.ts -> supaService() with SUPABASE_SERVICE_ROLE_KEY.
-- Idempotent: drop policy if exists before create. Re-runnable with `supabase db push` or `psql $DATABASE_URL -f 003_rls_tighten.sql`.
-- Apply after 001_init.sql. Requires Supabase auth role; `auth.role()` returns 'anon' | 'authenticated' | 'service_role'.

-- ---------------------------------------------------------------------------
-- polls
-- ---------------------------------------------------------------------------
drop policy if exists "allow all polls" on polls;
drop policy if exists "anon read polls" on polls;
drop policy if exists "service write polls" on polls;
drop policy if exists "service insert polls" on polls;
drop policy if exists "service update polls" on polls;
drop policy if exists "service delete polls" on polls;

-- anon (and any role) can read — tightened to SELECT only
create policy "anon read polls" on polls for select using (true);

-- only service_role can write — API routes use supaService() / supaAdmin()
create policy "service write polls" on polls for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- poll_options
-- ---------------------------------------------------------------------------
drop policy if exists "allow all options" on poll_options;
drop policy if exists "allow all poll_options" on poll_options;
drop policy if exists "anon read poll_options" on poll_options;
drop policy if exists "service write poll_options" on poll_options;
drop policy if exists "service insert poll_options" on poll_options;
drop policy if exists "service update poll_options" on poll_options;
drop policy if exists "service delete poll_options" on poll_options;

create policy "anon read poll_options" on poll_options for select using (true);

create policy "service write poll_options" on poll_options for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- votes
-- ---------------------------------------------------------------------------
drop policy if exists "allow all votes" on votes;
drop policy if exists "anon read votes" on votes;
drop policy if exists "service write votes" on votes;
drop policy if exists "service insert votes" on votes;
drop policy if exists "service update votes" on votes;
drop policy if exists "service delete votes" on votes;

create policy "anon read votes" on votes for select using (true);

create policy "service write votes" on votes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
drop policy if exists "allow all events" on events;
drop policy if exists "anon read events" on events;
drop policy if exists "service write events" on events;
drop policy if exists "service insert events" on events;
drop policy if exists "service update events" on events;
drop policy if exists "service delete events" on events;

create policy "anon read events" on events for select using (true);

create policy "service write events" on events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Hardening notes:
-- - Keep RLS enabled (already: alter table ... enable row level security in 001).
-- - Do NOT re-enable `allow all` policies. Rotate anon key after deploying this migration
--   if the project was ever public with the permissive policies.
-- - All inserts/updates/deletes must go through API routes (app/app/api/**) that call
--   supaService() / supaAdmin(). Direct PostgREST writes with the anon key will now get 0 rows / 403.
-- - If a future feature needs anon INSERT (e.g. edge analytics beacon without API), add a narrow
--   INSERT-only policy with WITH CHECK constraints (allowed name allowlist, poll_id exists, rate limit),
--   not a blanket allow-all.
-- ---------------------------------------------------------------------------
