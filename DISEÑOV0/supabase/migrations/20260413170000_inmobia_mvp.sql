create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  title text not null,
  internal_code text not null,
  operation text not null check (operation in ('venta', 'alquiler_anual', 'alquiler_temporario')),
  property_type text not null check (property_type in ('casa', 'departamento', 'duplex', 'local', 'terreno')),
  price_amount numeric(14, 2) not null,
  currency text not null check (currency in ('ARS', 'USD')),
  status text not null check (status in ('borrador', 'publicada', 'reservada', 'vendida', 'alquilada')),
  show_price boolean not null default true,
  address text not null,
  city text not null,
  neighborhood text,
  location_mode text not null check (location_mode in ('exacta', 'aproximada', 'oculta')),
  bedrooms integer,
  bathrooms integer,
  covered_area numeric(12, 2),
  total_area numeric(12, 2),
  description text,
  slug text not null,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agency_id, internal_code),
  unique (agency_id, slug)
);

create index if not exists idx_properties_agency_created_at
  on public.properties (agency_id, created_at desc);

create index if not exists idx_properties_agency_status
  on public.properties (agency_id, status);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.agencies to anon, authenticated;
grant select, insert, update, delete on public.properties to anon, authenticated;

alter table public.agencies enable row level security;
alter table public.properties enable row level security;

drop policy if exists "mvp agencies access" on public.agencies;
create policy "mvp agencies access"
on public.agencies
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mvp properties access" on public.properties;
create policy "mvp properties access"
on public.properties
for all
to anon, authenticated
using (true)
with check (true);

drop trigger if exists set_agencies_updated_at on public.agencies;
create trigger set_agencies_updated_at
before update on public.agencies
for each row
execute function public.set_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();
