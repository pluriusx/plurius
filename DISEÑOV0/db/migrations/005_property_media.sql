CREATE TABLE IF NOT EXISTS property_media (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_cover INTEGER NOT NULL DEFAULT 0 CHECK (is_cover IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_media_property_order
  ON property_media (property_id, sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_property_media_agency_property
  ON property_media (agency_id, property_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_media_cover_once
  ON property_media (property_id)
  WHERE is_cover = 1;
