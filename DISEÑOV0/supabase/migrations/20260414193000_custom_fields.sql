create table if not exists public.custom_property_fields (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  slug text not null,
  field_type text not null check (
    field_type in (
      'short_text',
      'long_text',
      'number',
      'boolean',
      'single_select',
      'multi_select',
      'url'
    )
  ),
  options jsonb,
  show_in_public boolean not null default true,
  is_required boolean not null default false,
  sort_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agency_id, slug)
);

create table if not exists public.property_custom_field_values (
  property_id uuid not null references public.properties(id) on delete cascade,
  custom_field_id uuid not null references public.custom_property_fields(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (property_id, custom_field_id)
);

create index if not exists idx_custom_property_fields_agency_sort
  on public.custom_property_fields (agency_id, sort_order asc, created_at asc);

create index if not exists idx_property_custom_field_values_agency_property
  on public.property_custom_field_values (agency_id, property_id);

grant select, insert, update, delete on public.custom_property_fields to anon, authenticated;
grant select, insert, update, delete on public.property_custom_field_values to anon, authenticated;

alter table public.custom_property_fields enable row level security;
alter table public.property_custom_field_values enable row level security;

drop policy if exists "mvp custom fields access" on public.custom_property_fields;
create policy "mvp custom fields access"
on public.custom_property_fields
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mvp property custom field values access" on public.property_custom_field_values;
create policy "mvp property custom field values access"
on public.property_custom_field_values
for all
to anon, authenticated
using (true)
with check (true);

drop trigger if exists set_custom_property_fields_updated_at on public.custom_property_fields;
create trigger set_custom_property_fields_updated_at
before update on public.custom_property_fields
for each row
execute function public.set_updated_at();

drop trigger if exists set_property_custom_field_values_updated_at on public.property_custom_field_values;
create trigger set_property_custom_field_values_updated_at
before update on public.property_custom_field_values
for each row
execute function public.set_updated_at();
