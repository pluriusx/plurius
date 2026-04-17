-- Users table (Google OAuth managed)
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (email);

-- Agency members (links users to agencies with roles)
create table if not exists public.agency_members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  agency_id   uuid not null references public.agencies (id) on delete cascade,
  role        text not null default 'owner'
              check (role in ('owner', 'admin', 'agent')),
  created_at  timestamptz not null default now(),
  unique (user_id, agency_id)
);

create index if not exists idx_agency_members_user on public.agency_members (user_id);
create index if not exists idx_agency_members_agency on public.agency_members (agency_id);

-- RLS policies
alter table public.users enable row level security;
alter table public.agency_members enable row level security;

-- MVP: allow service-role and anon read/write (will tighten with proper auth later)
create policy "users_all" on public.users for all using (true) with check (true);
create policy "agency_members_all" on public.agency_members for all using (true) with check (true);
