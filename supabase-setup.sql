-- ========================================================
-- SUPABASE FULL DATABASE SETUP FOR XAU-ALERT
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ========================================================

-- 1. BẢNG PROFILES (Quản lý người dùng, phân quyền & hạn VIP)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  role text default 'user',
  vip_plan text default 'none',
  vip_expires_at timestamptz default null,
  created_at timestamptz not null default now()
);

alter table public.profiles 
  add column if not exists role text default 'user',
  add column if not exists vip_plan text default 'none',
  add column if not exists vip_expires_at timestamptz default null;

alter table public.profiles enable row level security;

-- Policies cho profiles
drop policy if exists "user reads own profile" on public.profiles;
create policy "user reads own profile"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com'
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

drop policy if exists "admin can update profiles" on public.profiles;
create policy "admin can update profiles"
  on public.profiles for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com');

-- 2. BẢNG TICKETS (Lưu trữ tín hiệu vàng realtime)
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  pair text not null default 'XAU/USD',
  side text not null default 'sell',
  setup text not null default 'limit',
  open boolean not null default true,
  status text not null default 'New plan',
  vip boolean not null default false,
  entry text,
  sl text,
  tp1 text,
  tp2 text,
  tp3 text,
  pips numeric default 0,
  result text,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.tickets enable row level security;

-- Policies cho tickets: Ai cũng xem được danh sách
drop policy if exists "anyone can read tickets" on public.tickets;
create policy "anyone can read tickets"
  on public.tickets for select
  to anon, authenticated
  using (true);

-- Chỉ Admin mới được thêm/sửa/xóa tickets
-- Lưu ý: Policy INSERT trong PostgreSQL chỉ dùng WITH CHECK, không dùng USING
drop policy if exists "admin can insert tickets" on public.tickets;
create policy "admin can insert tickets"
  on public.tickets for insert
  to authenticated
  with check (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com');

drop policy if exists "admin can update tickets" on public.tickets;
create policy "admin can update tickets"
  on public.tickets for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com');

drop policy if exists "admin can delete tickets" on public.tickets;
create policy "admin can delete tickets"
  on public.tickets for delete
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com');

-- 3. BẢNG MESSAGES (Hộp thư hỗ trợ khách hàng)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  body text not null,
  reply text,
  replied_at timestamptz,
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
  using (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com');

drop policy if exists "user reads own support" on public.messages;
create policy "user reads own support"
  on public.messages for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "admin can reply support" on public.messages;
create policy "admin can reply support"
  on public.messages for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'howopus1@gmail.com');

-- 4. Gán quyền admin cho tài khoản chính
update public.profiles 
set role = 'admin' 
where lower(email) = 'howopus1@gmail.com';

-- 5. Bật đồng bộ Realtime cho bảng tickets
alter publication supabase_realtime add table public.tickets;
