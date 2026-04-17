ALTER TABLE website_settings
  ADD COLUMN theme_preset TEXT NOT NULL DEFAULT 'brisa'
  CHECK (theme_preset IN ('brisa', 'editorial', 'nocturno'));

ALTER TABLE website_settings
  ADD COLUMN hero_variant TEXT NOT NULL DEFAULT 'split'
  CHECK (hero_variant IN ('split', 'centered', 'immersive'));

ALTER TABLE website_settings
  ADD COLUMN featured_section_title TEXT NOT NULL DEFAULT 'Propiedades destacadas';

ALTER TABLE website_settings
  ADD COLUMN featured_section_body TEXT DEFAULT 'Una selección inicial para abrir el catálogo con las propiedades que mejor representan a la inmobiliaria.';

ALTER TABLE website_settings
  ADD COLUMN show_highlight_section INTEGER NOT NULL DEFAULT 1
  CHECK (show_highlight_section IN (0, 1));

ALTER TABLE website_settings
  ADD COLUMN highlight_title TEXT NOT NULL DEFAULT 'Una presencia digital más clara, confiable y lista para captar consultas.';

ALTER TABLE website_settings
  ADD COLUMN highlight_body TEXT NOT NULL DEFAULT 'La home ya puede combinar identidad visual, propiedades reales y llamados a la acción visibles. Esta capa de personalización apunta a que cada cliente sienta el sitio más propio sin perder velocidad de salida.';

ALTER TABLE website_settings
  ADD COLUMN highlight_cta_label TEXT NOT NULL DEFAULT 'Hablar con la inmobiliaria';

ALTER TABLE website_settings
  ADD COLUMN recent_section_title TEXT NOT NULL DEFAULT 'Últimas incorporaciones';

ALTER TABLE website_settings
  ADD COLUMN recent_section_body TEXT DEFAULT 'Novedades publicadas recientemente para mantener la portada viva y transmitir movimiento comercial.';

ALTER TABLE website_settings
  ADD COLUMN show_final_cta INTEGER NOT NULL DEFAULT 1
  CHECK (show_final_cta IN (0, 1));

ALTER TABLE website_settings
  ADD COLUMN final_cta_title TEXT NOT NULL DEFAULT 'Coordinemos una búsqueda o una visita con tu próximo cliente.';

ALTER TABLE website_settings
  ADD COLUMN final_cta_body TEXT NOT NULL DEFAULT 'El sitio ya tiene consultas conectadas al panel. Sumando identidad y bloques editables, la experiencia se siente mucho más cercana a la marca de cada inmobiliaria.';

ALTER TABLE website_settings
  ADD COLUMN final_cta_label TEXT NOT NULL DEFAULT 'Quiero hacer una consulta';
