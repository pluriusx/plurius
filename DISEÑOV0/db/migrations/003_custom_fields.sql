CREATE TABLE IF NOT EXISTS custom_property_fields (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (
    field_type IN (
      'short_text',
      'long_text',
      'number',
      'boolean',
      'single_select',
      'multi_select',
      'url'
    )
  ),
  options TEXT,
  show_in_public INTEGER NOT NULL DEFAULT 1 CHECK (show_in_public IN (0, 1)),
  is_required INTEGER NOT NULL DEFAULT 0 CHECK (is_required IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  UNIQUE (agency_id, slug)
);

CREATE TABLE IF NOT EXISTS property_custom_field_values (
  property_id TEXT NOT NULL,
  custom_field_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (property_id, custom_field_id),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_field_id) REFERENCES custom_property_fields(id) ON DELETE CASCADE,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_custom_property_fields_agency_sort
  ON custom_property_fields (agency_id, sort_order ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_property_custom_field_values_agency_property
  ON property_custom_field_values (agency_id, property_id);
