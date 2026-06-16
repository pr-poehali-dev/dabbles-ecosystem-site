
ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_status TEXT DEFAULT 'active';
