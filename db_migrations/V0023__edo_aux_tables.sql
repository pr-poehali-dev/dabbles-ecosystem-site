
CREATE TABLE IF NOT EXISTS edo_organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  inn TEXT UNIQUE,
  kpp TEXT DEFAULT '',
  address TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  is_active TEXT DEFAULT 'yes',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edo_routes (
  id SERIAL PRIMARY KEY,
  document_id INTEGER,
  step_order INTEGER NOT NULL DEFAULT 1,
  approver_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  comment TEXT DEFAULT '',
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edo_history (
  id SERIAL PRIMARY KEY,
  document_id INTEGER,
  user_id INTEGER,
  action TEXT NOT NULL,
  old_status TEXT DEFAULT '',
  new_status TEXT DEFAULT '',
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_assignee ON documents(assignee_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_edo_routes_doc ON edo_routes(document_id);
CREATE INDEX IF NOT EXISTS idx_edo_history_doc ON edo_history(document_id);
