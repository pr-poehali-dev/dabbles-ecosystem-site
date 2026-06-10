CREATE TABLE home_cards (
    id SERIAL PRIMARY KEY,
    card_type VARCHAR(16) NOT NULL DEFAULT 'finance',
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT NOT NULL DEFAULT '',
    icon VARCHAR(48) NOT NULL DEFAULT 'Sparkles',
    image_url TEXT NOT NULL DEFAULT '',
    gradient TEXT NOT NULL DEFAULT 'from-[#1a0a6e] to-[#0077FF]',
    href TEXT NOT NULL DEFAULT '',
    is_light BOOLEAN NOT NULL DEFAULT FALSE,
    is_feature BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Быстрые круглые иконки
INSERT INTO home_cards (card_type, title, icon, gradient, href, sort_order) VALUES
('quick', E'ИИ-ассистент\nДаббл', 'Sparkles', 'from-[#0077FF] to-[#56CCF2]', '', 1),
('quick', E'Трекер задач\nдля команд', 'CheckSquare', 'from-[#FD4160] to-[#0077FF]', '', 2),
('quick', E'Формус —\nонлайн-формы', 'FileText', 'from-[#0077FF] to-[#C1F089]', 'https://forms-dubble.ru', 3),
('quick', E'Компас —\nпутешествия', 'Compass', 'from-[#1a0a6e] to-[#7c3aed]', 'https://даббл-компас.рф', 4),
('quick', E'Мерошкинс —\nсобытия', 'CalendarDays', 'from-[#7c3aed] to-[#4f46e5]', '/meroshkins', 5),
('quick', E'Коммерческие\nпредложения', 'FileSignature', 'from-[#1a0a6e] to-[#0077FF]', '/kp', 6),
('quick', E'Карьера\nв Даббл', 'Briefcase', 'from-[#222] to-[#444]', '', 7),
('quick', 'О компании', 'Building2', 'from-[#FD4160] to-[#FF8A5B]', '/about', 8);

-- Карточки вкладки "Сервисы"
INSERT INTO home_cards (card_type, title, image_url, is_light, is_feature, href, sort_order) VALUES
('finance', E'Управление задачами\nи проектами', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/925b0945-cd91-4b71-bda9-73b998c95cc9.jpg', FALSE, FALSE, '', 1),
('finance', E'Конструктор форм\nс дизайном на выбор', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/c09f3176-2ad6-453a-b6b5-3059ac510b72.jpg', FALSE, FALSE, 'https://forms-dubble.ru', 2),
('finance', E'Попробуй Даббл Про\nза 1 ₽', '', FALSE, TRUE, '/about', 3),
('finance', E'Витрина сервисов\nот Даббл', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/31839e79-4a8f-4cfb-87d2-511fdc8408c9.jpg', FALSE, FALSE, '/about', 4),
('finance', E'Запусти своё\nмероприятие', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/c09f3176-2ad6-453a-b6b5-3059ac510b72.jpg', FALSE, FALSE, '/meroshkins', 5),
('finance', E'Как начать работу\nс Даббл', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/f822c5b6-73ce-4bad-a85c-e2a598dc89cd.jpg', TRUE, FALSE, '/about', 6);

-- Карточки вкладки "Для жизни"
INSERT INTO home_cards (card_type, title, image_url, is_light, is_feature, href, sort_order) VALUES
('life', E'Путешествия\nс Компасом', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/f822c5b6-73ce-4bad-a85c-e2a598dc89cd.jpg', TRUE, FALSE, 'https://даббл-компас.рф', 1),
('life', E'Подарки и бонусы\nучастникам', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/31839e79-4a8f-4cfb-87d2-511fdc8408c9.jpg', FALSE, FALSE, '/about', 2),
('life', E'Стань частью\nсообщества', '', FALSE, TRUE, '/about', 3),
('life', E'Образовательные\nпрограммы', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/925b0945-cd91-4b71-bda9-73b998c95cc9.jpg', FALSE, FALSE, '/about', 4),
('life', 'Карьера и стажировки', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/c09f3176-2ad6-453a-b6b5-3059ac510b72.jpg', FALSE, FALSE, '', 5),
('life', E'Зелёный курс\nДаббл', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/f822c5b6-73ce-4bad-a85c-e2a598dc89cd.jpg', TRUE, FALSE, '/about', 6);

-- Баннер-обложка (одна запись)
INSERT INTO home_cards (card_type, title, subtitle, image_url, href, sort_order) VALUES
('banner', E'Выиграйте\n120 000 бонусов', 'Подключите Даббл Про и участвуйте в розыгрыше для команд', 'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/31839e79-4a8f-4cfb-87d2-511fdc8408c9.jpg', '/about', 1);