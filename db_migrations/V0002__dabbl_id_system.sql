-- USERS: добавляем avatar_url, phone, 2fa
ALTER TABLE users ADD COLUMN avatar_url TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN phone VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN tfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- SESSIONS: добавляем устройство и IP
ALTER TABLE sessions ADD COLUMN user_agent TEXT NOT NULL DEFAULT '';
ALTER TABLE sessions ADD COLUMN ip VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE sessions ADD COLUMN last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN client_id VARCHAR(64) NOT NULL DEFAULT 'cabinet';

-- OAUTH CLIENTS (зарегистрированные сервисы, использующие Даббл ID)
CREATE TABLE oauth_clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(64) NOT NULL UNIQUE,
    client_secret VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    logo_url TEXT NOT NULL DEFAULT '',
    redirect_uris TEXT NOT NULL DEFAULT '',
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUTHORIZATION CODES (короткоживущие коды для обмена на токен)
CREATE TABLE oauth_codes (
    code VARCHAR(64) PRIMARY KEY,
    client_id VARCHAR(64) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVITES (приглашения сотрудников)
CREATE TABLE invites (
    token VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    position VARCHAR(255) NOT NULL DEFAULT '',
    access_tasks BOOLEAN NOT NULL DEFAULT FALSE,
    access_documents BOOLEAN NOT NULL DEFAULT FALSE,
    access_crm BOOLEAN NOT NULL DEFAULT FALSE,
    invited_by INTEGER NOT NULL REFERENCES users(id),
    used BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2FA CODES (одноразовые коды для входа)
CREATE TABLE tfa_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    code VARCHAR(8) NOT NULL,
    purpose VARCHAR(32) NOT NULL DEFAULT 'login',
    used BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tfa_user ON tfa_codes(user_id);

-- SEED: внутренние OAuth-клиенты
INSERT INTO oauth_clients (client_id, client_secret, name, description, redirect_uris, is_internal) VALUES
('cabinet', 'cabinet-internal-secret', 'Даббл Кабинет', 'Личный кабинет сотрудников', '/cabinet', TRUE),
('vibe', 'vibe-internal-secret', 'ВАЙБ кофейня', 'Личный кабинет франчайзи и партнёров', '/vibe', TRUE);
