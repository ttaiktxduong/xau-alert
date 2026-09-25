-- Run in Supabase SQL Editor

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
  using (auth.jwt() ->> 'email' = 'howopus1@gmail.com');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "user reads own profile" on public.profiles;
create policy "user reads own profile"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or auth.jwt() ->> 'email' = 'howopus1@gmail.com'
  );

drop policy if exists "user writes own profile" on public.profiles;
create policy "user writes own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "user updates own profile" on public.profiles;
create policy "user updates own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);