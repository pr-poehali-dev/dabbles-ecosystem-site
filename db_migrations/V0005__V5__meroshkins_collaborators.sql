CREATE TABLE IF NOT EXISTS m_collaborators (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  collaborator_id INTEGER REFERENCES users(id),
  invite_token VARCHAR(64) NOT NULL UNIQUE,
  invite_email VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(32) NOT NULL DEFAULT 'editor',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_m_collab_owner ON m_collaborators(owner_id);
CREATE INDEX IF NOT EXISTS idx_m_collab_user ON m_collaborators(collaborator_id);
