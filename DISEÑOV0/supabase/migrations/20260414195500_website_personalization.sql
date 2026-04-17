alter table public.website_settings
  add column if not exists theme_preset text not null default 'brisa'
    check (theme_preset in ('brisa', 'editorial', 'nocturno')),
  add column if not exists hero_variant text not null default 'split'
    check (hero_variant in ('split', 'centered', 'immersive')),
  add column if not exists featured_section_title text not null default 'Propiedades destacadas',
  add column if not exists featured_section_body text default 'Una selección inicial para abrir el catálogo con las propiedades que mejor representan a la inmobiliaria.',
  add column if not exists show_highlight_section integer not null default 1
    check (show_highlight_section in (0, 1)),
  add column if not exists highlight_title text not null default 'Una presencia digital más clara, confiable y lista para captar consultas.',
  add column if not exists highlight_body text not null default 'La home ya puede combinar identidad visual, propiedades reales y llamados a la acción visibles. Esta capa de personalización apunta a que cada cliente sienta el sitio más propio sin perder velocidad de salida.',
  add column if not exists highlight_cta_label text not null default 'Hablar con la inmobiliaria',
  add column if not exists recent_section_title text not null default 'Últimas incorporaciones',
  add column if not exists recent_section_body text default 'Novedades publicadas recientemente para mantener la portada viva y transmitir movimiento comercial.',
  add column if not exists show_final_cta integer not null default 1
    check (show_final_cta in (0, 1)),
  add column if not exists final_cta_title text not null default 'Coordinemos una búsqueda o una visita con tu próximo cliente.',
  add column if not exists final_cta_body text not null default 'El sitio ya tiene consultas conectadas al panel. Sumando identidad y bloques editables, la experiencia se siente mucho más cercana a la marca de cada inmobiliaria.',
  add column if not exists final_cta_label text not null default 'Quiero hacer una consulta';

update public.website_settings
set
  theme_preset = coalesce(theme_preset, 'brisa'),
  hero_variant = coalesce(hero_variant, 'split'),
  featured_section_title = coalesce(featured_section_title, 'Propiedades destacadas'),
  featured_section_body = coalesce(
    featured_section_body,
    'Una selección inicial para abrir el catálogo con las propiedades que mejor representan a la inmobiliaria.'
  ),
  show_highlight_section = coalesce(show_highlight_section, 1),
  highlight_title = coalesce(
    highlight_title,
    'Una presencia digital más clara, confiable y lista para captar consultas.'
  ),
  highlight_body = coalesce(
    highlight_body,
    'La home ya puede combinar identidad visual, propiedades reales y llamados a la acción visibles. Esta capa de personalización apunta a que cada cliente sienta el sitio más propio sin perder velocidad de salida.'
  ),
  highlight_cta_label = coalesce(highlight_cta_label, 'Hablar con la inmobiliaria'),
  recent_section_title = coalesce(recent_section_title, 'Últimas incorporaciones'),
  recent_section_body = coalesce(
    recent_section_body,
    'Novedades publicadas recientemente para mantener la portada viva y transmitir movimiento comercial.'
  ),
  show_final_cta = coalesce(show_final_cta, 1),
  final_cta_title = coalesce(
    final_cta_title,
    'Coordinemos una búsqueda o una visita con tu próximo cliente.'
  ),
  final_cta_body = coalesce(
    final_cta_body,
    'El sitio ya tiene consultas conectadas al panel. Sumando identidad y bloques editables, la experiencia se siente mucho más cercana a la marca de cada inmobiliaria.'
  ),
  final_cta_label = coalesce(final_cta_label, 'Quiero hacer una consulta');
