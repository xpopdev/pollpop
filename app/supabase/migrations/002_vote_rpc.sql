-- PollPop 002 — atomic vote RPCs (fixes read-then-write race in voteOnPoll)
-- Run: supabase db push  OR  psql $DATABASE_URL -f 002_vote_rpc.sql

create or replace function increment_vote(p_poll_id text, p_option_id text)
returns void language plpgsql as $$
begin
  update poll_options set votes = votes + 1 where id = p_option_id and poll_id = p_poll_id;
end $$;

create or replace function decrement_vote(p_poll_id text, p_option_id text)
returns void language plpgsql as $$
begin
  update poll_options set votes = greatest(votes - 1, 0) where id = p_option_id and poll_id = p_poll_id;
end $$;
