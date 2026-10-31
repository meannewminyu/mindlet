-- Existing database: preserve data and RLS policies.
begin;
revoke all on table public.memos from anon, authenticated;
revoke select (password_hash) on public.memos from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select (id, title, content, created_at), insert on table public.memos to anon, authenticated;
grant select, insert, delete on table public.memos to service_role;
commit;
