-- Chạy trong Supabase → SQL Editor → Run

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "anyone can send support" on public.messages;
create policy "anyone can send support"
  on public.messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin can read support" on public.messages;
create policy "admin can read support"
  on public.messages for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'thegrindchronicle.contact@gmail.com');