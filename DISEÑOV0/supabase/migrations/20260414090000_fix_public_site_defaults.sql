alter table if exists public.website_settings
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

alter table if exists public.inquiries
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now()),
  alter column status set default 'nueva';
