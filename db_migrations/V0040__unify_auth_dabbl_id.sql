-- Единая идентификация: связываем camp_students и cp_clients с центральной таблицей users (Даббл ID)
ALTER TABLE camp_students ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_camp_students_user ON camp_students(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE cp_clients ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_clients_user ON cp_clients(user_id) WHERE user_id IS NOT NULL;

-- Регистрируем Кэмп и Юридический портал как внутренние OAuth-клиенты Даббл ID
INSERT INTO oauth_clients (client_id, client_secret, name, description, redirect_uris, is_internal, is_active)
VALUES
  ('camp', 'camp-internal-secret', 'Кэмп', 'Образовательная платформа Даббл', '/camp/app', TRUE, TRUE),
  ('client-portal', 'client-portal-internal-secret', 'Юридический портал', 'Личный кабинет клиента', '/client/home', TRUE, TRUE)
ON CONFLICT (client_id) DO NOTHING;