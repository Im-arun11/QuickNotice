-- ============================================================
-- QuickNotice — Supabase PostgreSQL Migration Script
-- ============================================================
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- ============================================================

-- =====================
-- 1. PROFILES TABLE
-- =====================
-- Linked to Supabase Auth users (auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('worker', 'employer')),
  phone text not null default '',
  district text not null default '',
  company_name text default '',
  address text default '',
  profile_image text default '',
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: Anyone can read profiles (needed for employer info on notices)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can insert their own profile (during signup)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- =====================
-- 2. NOTICES TABLE
-- =====================
create table if not exists public.notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  description text not null,
  salary numeric not null check (salary > 0),
  salary_type text not null default 'day' check (salary_type in ('day', 'hour')),
  people_needed integer not null default 1 check (people_needed >= 1),
  people_applied integer not null default 0,
  location text not null,
  address text not null,
  date text not null,
  working_time text not null,
  phone_number text not null,
  requirements text[] default '{}',
  status text not null default 'open' check (status in ('open', 'closed')),
  employer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.notices enable row level security;

-- Anyone can read open notices
create policy "Open notices are viewable by everyone"
  on public.notices for select
  using (true);

-- Only authenticated employers can insert notices
create policy "Employers can insert notices"
  on public.notices for insert
  with check (auth.uid() = employer_id);

-- Only the employer who posted the notice can update it
create policy "Employers can update their own notices"
  on public.notices for update
  using (auth.uid() = employer_id)
  with check (auth.uid() = employer_id);

-- Only the employer who posted the notice can delete it
create policy "Employers can delete their own notices"
  on public.notices for delete
  using (auth.uid() = employer_id);


-- =====================
-- 3. APPLICATIONS TABLE
-- =====================
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  notice_id uuid references public.notices(id) on delete cascade not null,
  worker_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- A worker can only apply once per notice
  unique (notice_id, worker_id)
);

-- Enable RLS
alter table public.applications enable row level security;

-- Workers can see their own applications
create policy "Workers can view their own applications"
  on public.applications for select
  using (auth.uid() = worker_id);

-- Employers can see applications for their notices
create policy "Employers can view applications for their notices"
  on public.applications for select
  using (
    exists (
      select 1 from public.notices
      where notices.id = applications.notice_id
      and notices.employer_id = auth.uid()
    )
  );

-- Workers can insert applications (apply to notices)
create policy "Workers can insert applications"
  on public.applications for insert
  with check (auth.uid() = worker_id);

-- Workers can update their own applications (cancel)
create policy "Workers can update their own applications"
  on public.applications for update
  using (auth.uid() = worker_id);

-- Employers can update applications for their notices (accept/reject)
create policy "Employers can update applications for their notices"
  on public.applications for update
  using (
    exists (
      select 1 from public.notices
      where notices.id = applications.notice_id
      and notices.employer_id = auth.uid()
    )
  );


-- =====================
-- 4. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- =====================
-- This trigger automatically creates a profile row when a user signs up.
-- The user's metadata (name, role, phone, district, etc.) is passed during signup
-- and stored in raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, phone, district, company_name, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'worker'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'district', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'address', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =====================
-- 5. AUTO-UPDATE updated_at TIMESTAMP
-- =====================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to notices table
drop trigger if exists update_notices_updated_at on public.notices;
create trigger update_notices_updated_at
  before update on public.notices
  for each row execute procedure public.update_updated_at_column();

-- Apply to applications table
drop trigger if exists update_applications_updated_at on public.applications;
create trigger update_applications_updated_at
  before update on public.applications
  for each row execute procedure public.update_updated_at_column();


-- ============================================================
-- DONE! Your database is ready for QuickNotice.
-- ============================================================
