CREATE TABLE IF NOT EXISTS org_nodes (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES org_nodes(id),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO org_nodes (parent_id, title, subtitle, description, sort_order) VALUES
  (NULL, 'Сергей Серебренников', 'Генеральный директор', 'Руководит корпорацией экосистемных проектов «Даббл»', 0);
