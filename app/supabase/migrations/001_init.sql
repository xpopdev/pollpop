-- PollPop MVP — Supabase schema (architecture.md)
-- Run: supabase db push  OR  psql $DATABASE_URL -f 001_init.sql
-- Idempotent where possible via IF NOT EXISTS.

-- enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- polls
create table if not exists polls (
  id text primary key,
  title text not null check (char_length(title) between 1 and 80),
  context text,
  category text,
  creator_cookie text,
  creator_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  og_image_url text,
  status text not null default 'active' check (status in ('active','flagged','removed'))
);
create index if not exists polls_created_at_idx on polls (created_at desc);

-- poll_options (2-4 per poll)
create table if not exists poll_options (
  id text primary key,
  poll_id text not null references polls(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 24),
  image_url text not null,
  thumb_url text,
  position smallint not null check (position between 0 and 3),
  votes int not null default 0,
  unique (poll_id, position)
);
create index if not exists poll_options_poll_id_idx on poll_options (poll_id);

-- votes (soft dedup: one counted vote per poll per dedup key; last wins via upsert)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  poll_id text not null references polls(id) on delete cascade,
  option_id text not null references poll_options(id) on delete cascade,
  voter_cookie text not null,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_cookie, ip_hash)
);
create index if not exists votes_poll_id_idx on votes (poll_id);
create index if not exists votes_ip_hash_created_at_idx on votes (ip_hash, created_at desc);
create index if not exists votes_option_id_idx on votes (option_id);

-- events (analytics, anonymous, cookie-keyed)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name in ('poll_view','vote','cta_view','cta_click','poll_create','poll_create_start','poll_create_complete','share_copy','share_native','poll_create_error')),
  poll_id text references polls(id) on delete set null,
  cookie text,
  ref text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_name_poll_created_idx on events (name, poll_id, created_at desc);
create index if not exists events_created_at_idx on events (created_at desc);
create index if not exists events_ref_idx on events (ref) where ref is not null;

-- Storage bucket for poll images (create via Supabase dashboard or SQL if self-hosted)
-- insert into storage.buckets (id, name, public) values ('poll-images','poll-images', true)
-- on conflict do nothing;

-- RLS: MVP is anon-friendly; enable RLS but allow anon read/write via anon key
-- Adjust to stricter policies after MVP if needed.
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table votes enable row level security;
alter table events enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'allow all polls') then
    create policy "allow all polls" on polls for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'allow all options') then
    create policy "allow all options" on poll_options for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'allow all votes') then
    create policy "allow all votes" on votes for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'allow all events') then
    create policy "allow all events" on events for all using (true) with check (true);
  end if;
end $$;

-- Realtime: enable publication for poll_options (vote counts) and votes
-- Supabase Realtime listens to these tables; ensure they are in supabase_realtime publication
-- alter publication supabase_realtime add table poll_options;
-- alter publication supabase_realtime add table votes;
-- (Run manually in Supabase SQL editor if needed — requires owner)
