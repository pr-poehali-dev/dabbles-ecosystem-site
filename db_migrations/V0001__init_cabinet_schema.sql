CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    position VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(32) NOT NULL DEFAULT 'employee',
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    access_tasks BOOLEAN NOT NULL DEFAULT FALSE,
    access_documents BOOLEAN NOT NULL DEFAULT FALSE,
    access_crm BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
    token VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE hero_slides (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    bg_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#0a0535 0%,#1a0a6e 45%,#2d0060 100%)',
    accent_color VARCHAR(16) NOT NULL DEFAULT '#FD4160',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE news_cards (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    tag VARCHAR(64) NOT NULL DEFAULT '',
    tag_icon VARCHAR(64) NOT NULL DEFAULT 'Tag',
    image_url TEXT NOT NULL DEFAULT '',
    image_position VARCHAR(16) NOT NULL DEFAULT 'top',
    bg_color VARCHAR(32) NOT NULL DEFAULT '#FFFFFF',
    is_light BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    tag VARCHAR(64) NOT NULL DEFAULT '',
    color VARCHAR(128) NOT NULL DEFAULT 'from-[#FD4160] to-[#0077FF]',
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(16) NOT NULL DEFAULT 'new',
    priority VARCHAR(16) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tasks_user ON tasks(user_id);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_documents_user ON documents(user_id);

CREATE TABLE crm_clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(64) NOT NULL DEFAULT '',
    stage VARCHAR(32) NOT NULL DEFAULT 'lead',
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_crm_user ON crm_clients(user_id);

INSERT INTO users (email, password_hash, full_name, position, role, must_change_password, access_tasks, access_documents, access_crm, is_active)
VALUES ('21289119@mail.ru', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Администратор', 'Владелец', 'admin', TRUE, TRUE, TRUE, TRUE, TRUE);

INSERT INTO hero_slides (title, subtitle, image_url, bg_gradient, accent_color, sort_order) VALUES
('Даббл Про — инструмент роста', 'Автоматизация, аналитика и масштаб для бизнеса любого размера', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/629ac74e-9ae3-40e8-9edd-436184c71ca2.jpg', 'linear-gradient(135deg,#0a0535 0%,#1a0a6e 45%,#2d0060 100%)', '#C1F089', 1),
('Новый партнёр в вашем бизнесе', 'Даббл Нетворк объединяет лучших игроков рынка в одну экосистему', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/a14049b4-f5a1-4865-830d-03e8873b15b7.jpg', 'linear-gradient(135deg,#001a3a 0%,#003080 45%,#0a1a50 100%)', '#0077FF', 2),
('ИИ-аналитика для роста ×3', 'Реальные данные в реальном времени — принимайте решения быстрее конкурентов', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/d6ebc285-9c49-4230-92c3-6d233f410578.jpg', 'linear-gradient(135deg,#1a0010 0%,#4a0020 45%,#2a0040 100%)', '#FD4160', 3);

INSERT INTO news_cards (title, tag, tag_icon, image_url, image_position, bg_color, is_light, sort_order) VALUES
('Роботы Даббл появились в новых городах. Уже четвёртый миллион доставок', 'Автономный транспорт', 'Car', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg', 'top', '#FFFFFF', FALSE, 1),
('Как используют Даббл Про в работе', 'Даббл', 'Zap', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/a716bdd3-a613-4e25-9502-5a090b4daa82.jpg', 'center', '#6B4FBB', TRUE, 2),
('Как устроены рекомендации Даббл нового поколения', 'Музыка', 'Music', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/d6ebc285-9c49-4230-92c3-6d233f410578.jpg', 'top', '#FFFFFF', FALSE, 3),
('Нетворк или Про? Всё сразу', 'Устройства', 'Monitor', '', 'none', '#2a2018', TRUE, 4),
('Рост ×3 за полгода', 'Кейс', 'Briefcase', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg', 'center', '#FFFFFF', FALSE, 5),
('Инфраструктура будущего', 'Инфраструктура', 'Server', '', 'none', '#5a0090', TRUE, 6);

INSERT INTO blog_posts (title, excerpt, body, tag, color, published_at, sort_order) VALUES
('Как ИИ меняет правила игры в бизнесе', 'Разбираем ключевые трансформации, которые уже происходят прямо сейчас.', 'Полный текст статьи скоро будет добавлен.', 'Тренды', 'from-[#FD4160] to-[#0077FF]', '2026-05-12', 1),
('История успеха: рост ×3 за полгода', 'Как наш клиент утроил выручку, внедрив Даббл Про в свои процессы.', 'Полный текст статьи скоро будет добавлен.', 'Кейс', 'from-[#0077FF] to-[#C1F089]', '2026-05-05', 2),
('Даббл Нетворк: первые 1000 участников', 'Делимся инсайтами и данными из первых месяцев работы платформы.', 'Полный текст статьи скоро будет добавлен.', 'Продукт', 'from-[#FD4160] to-[#C1F089]', '2026-04-28', 3);
