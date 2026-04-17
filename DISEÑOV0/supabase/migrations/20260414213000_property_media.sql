create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 1,
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_property_media_property_order
  on public.property_media (property_id, sort_order asc, created_at asc);

create index if not exists idx_property_media_agency_property
  on public.property_media (agency_id, property_id);

create unique index if not exists idx_property_media_cover_once
  on public.property_media (property_id)
  where is_cover = true;

grant select, insert, update, delete on public.property_media to anon, authenticated;

alter table public.property_media enable row level security;

drop policy if exists "mvp property media access" on public.property_media;
create policy "mvp property media access"
on public.property_media
for all
to anon, authenticated
using (true)
with check (true);

drop trigger if exists set_property_media_updated_at on public.property_media;
create trigger set_property_media_updated_at
before update on public.property_media
for each row
execute function public.set_updated_at();
