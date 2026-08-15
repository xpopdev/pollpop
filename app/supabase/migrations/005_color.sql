-- 005: add color column to poll_options (for PollCard / design exact)
alter table poll_options add column if not exists color text;
