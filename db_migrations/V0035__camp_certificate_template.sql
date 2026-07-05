CREATE TABLE IF NOT EXISTS camp_certificate_template (
    id INTEGER PRIMARY KEY DEFAULT 1,
    template_key TEXT NOT NULL DEFAULT '',
    template_url TEXT NOT NULL DEFAULT '',
    preview_url TEXT NOT NULL DEFAULT '',
    page_width REAL NOT NULL DEFAULT 841.89,
    page_height REAL NOT NULL DEFAULT 595.28,
    name_x REAL NOT NULL DEFAULT 0.5,
    name_y REAL NOT NULL DEFAULT 0.45,
    name_size INTEGER NOT NULL DEFAULT 28,
    name_color VARCHAR(7) NOT NULL DEFAULT '#141414',
    name_align VARCHAR(8) NOT NULL DEFAULT 'center',
    date_x REAL NOT NULL DEFAULT 0.25,
    date_y REAL NOT NULL DEFAULT 0.85,
    date_size INTEGER NOT NULL DEFAULT 12,
    date_color VARCHAR(7) NOT NULL DEFAULT '#6e6e6e',
    date_align VARCHAR(8) NOT NULL DEFAULT 'left',
    number_x REAL NOT NULL DEFAULT 0.75,
    number_y REAL NOT NULL DEFAULT 0.85,
    number_size INTEGER NOT NULL DEFAULT 12,
    number_color VARCHAR(7) NOT NULL DEFAULT '#6e6e6e',
    number_align VARCHAR(8) NOT NULL DEFAULT 'right',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT camp_certificate_template_singleton CHECK (id = 1)
);

INSERT INTO camp_certificate_template (id) VALUES (1) ON CONFLICT (id) DO NOTHING;