CREATE TABLE IF NOT EXISTS website_settings (
  agency_id TEXT PRIMARY KEY,
  site_title TEXT NOT NULL,
  site_tagline TEXT,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  hero_cta_label TEXT NOT NULL,
  services_title TEXT NOT NULL,
  services_body TEXT NOT NULL,
  about_title TEXT NOT NULL,
  about_body TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  contact_body TEXT NOT NULL,
  primary_phone TEXT,
  whatsapp_phone TEXT,
  public_email TEXT,
  lead_email TEXT,
  address TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  primary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  navigation_mode TEXT NOT NULL CHECK (navigation_mode IN ('simple', 'operaciones')),
  show_sale_link INTEGER NOT NULL DEFAULT 1 CHECK (show_sale_link IN (0, 1)),
  show_rent_link INTEGER NOT NULL DEFAULT 1 CHECK (show_rent_link IN (0, 1)),
  show_temporary_link INTEGER NOT NULL DEFAULT 1 CHECK (show_temporary_link IN (0, 1)),
  show_featured_properties INTEGER NOT NULL DEFAULT 1 CHECK (show_featured_properties IN (0, 1)),
  show_recent_properties INTEGER NOT NULL DEFAULT 1 CHECK (show_recent_properties IN (0, 1)),
  featured_limit INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  property_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('general', 'propiedad')),
  page_path TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('nueva', 'leida', 'respondida')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_agency_created_at
  ON inquiries (agency_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_agency_status
  ON inquiries (agency_id, status);
