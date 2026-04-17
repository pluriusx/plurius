create table if not exists public.website_settings (
  agency_id uuid primary key references public.agencies(id) on delete cascade,
  site_title text not null,
  site_tagline text,
  hero_title text not null,
  hero_subtitle text,
  hero_cta_label text not null,
  services_title text not null,
  services_body text not null,
  about_title text not null,
  about_body text not null,
  contact_title text not null,
  contact_body text not null,
  primary_phone text,
  whatsapp_phone text,
  public_email text,
  lead_email text,
  address text,
  instagram_url text,
  facebook_url text,
  primary_color text not null,
  accent_color text not null,
  navigation_mode text not null check (navigation_mode in ('simple', 'operaciones')),
  show_sale_link integer not null default 1 check (show_sale_link in (0, 1)),
  show_rent_link integer not null default 1 check (show_rent_link in (0, 1)),
  show_temporary_link integer not null default 1 check (show_temporary_link in (0, 1)),
  show_featured_properties integer not null default 1 check (show_featured_properties in (0, 1)),
  show_recent_properties integer not null default 1 check (show_recent_properties in (0, 1)),
  featured_limit integer not null default 3,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  source text not null check (source in ('general', 'propiedad')),
  page_path text not null,
  status text not null check (status in ('nueva', 'leida', 'respondida')) default 'nueva',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inquiries_agency_created_at
  on public.inquiries (agency_id, created_at desc);

create index if not exists idx_inquiries_agency_status
  on public.inquiries (agency_id, status);

drop trigger if exists set_website_settings_updated_at on public.website_settings;
create trigger set_website_settings_updated_at
before update on public.website_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at
before update on public.inquiries
for each row
execute function public.set_updated_at();
