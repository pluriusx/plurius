-- Esquema legado del bootstrap local con SQLite. Supabase es la fuente primaria actual del MVP.
CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  title TEXT NOT NULL,
  internal_code TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('venta', 'alquiler_anual', 'alquiler_temporario')),
  property_type TEXT NOT NULL CHECK (property_type IN ('casa', 'departamento', 'duplex', 'local', 'terreno')),
  price_amount REAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  status TEXT NOT NULL CHECK (status IN ('borrador', 'publicada', 'reservada', 'vendida', 'alquilada')),
  show_price INTEGER NOT NULL DEFAULT 1 CHECK (show_price IN (0, 1)),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  location_mode TEXT NOT NULL CHECK (location_mode IN ('exacta', 'aproximada', 'oculta')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  covered_area REAL,
  total_area REAL,
  description TEXT,
  slug TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  UNIQUE (agency_id, internal_code),
  UNIQUE (agency_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_properties_agency_created_at
  ON properties (agency_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_properties_agency_status
  ON properties (agency_id, status);
