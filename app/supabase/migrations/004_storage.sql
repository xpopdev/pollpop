-- 004_storage.sql — Supabase Storage bucket for poll option images (RT-BUG-18)
-- Creates public bucket `poll-images` used by app/app/api/polls/route.ts to offload
-- data URLs (FileReader readAsDataURL) into Storage and store the public URL in
-- poll_options.image_url instead of an unbounded data: string.
-- Run: supabase db push  OR  psql $DATABASE_URL -f 004_storage.sql
-- Idempotent via ON CONFLICT / IF NOT EXISTS. Requires storage schema (Supabase-hosted
-- has it by default; self-hosted needs `create schema storage` + storage extension).
-- After `supabase db push`, verify: select id, name, public from storage.buckets where id='poll-images';

insert into storage.buckets (id, name, public)
values ('poll-images', 'poll-images', true)
on conflict (id) do update set public = true;

-- Storage RLS: allow anon read (public bucket serves via public URL) and service_role write.
-- Supabase storage.objects has RLS enabled by default. These policies mirror the pattern
-- used for polls/poll_options in 003_rls_tighten.sql: anon SELECT only, service_role for writes
-- (route.ts uses supaService() / SUPABASE_SERVICE_ROLE_KEY for uploads).
-- Idempotent: drop if exists before create.

drop policy if exists "public read poll-images" on storage.objects;
create policy "public read poll-images" on storage.objects
  for select using (bucket_id = 'poll-images');

drop policy if exists "service write poll-images" on storage.objects;
create policy "service write poll-images" on storage.objects
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role' and bucket_id = 'poll-images');

-- Alternative for local dev without service_role separation (uncomment if you test with anon key):
-- drop policy if exists "anon write poll-images" on storage.objects;
-- create policy "anon write poll-images" on storage.objects
--   for insert with check (bucket_id = 'poll-images');
-- create policy "anon update poll-images" on storage.objects
--   for update using (bucket_id = 'poll-images');
