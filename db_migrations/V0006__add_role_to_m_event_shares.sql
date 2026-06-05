ALTER TABLE m_event_shares ADD COLUMN IF NOT EXISTS role varchar(32) NOT NULL DEFAULT 'viewer';
