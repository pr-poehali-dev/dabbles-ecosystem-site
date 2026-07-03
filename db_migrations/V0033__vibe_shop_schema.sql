-- ВАЙБ — интернет-магазин мерча
CREATE TABLE vibe_products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    old_price INTEGER,
    image_url TEXT NOT NULL DEFAULT '',
    category VARCHAR(32) NOT NULL DEFAULT 'Футболки',
    sizes VARCHAR(64) NOT NULL DEFAULT 'S,M,L,XL',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vibe_orders (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]',
    total INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO vibe_products (name, description, price, old_price, category, sizes, sort_order) VALUES
('Худи «ВАЙБ Классика»', 'Плотное худи из хлопка с вышитым логотипом. Свободный крой.', 3990, 4990, 'Худи', 'S,M,L,XL,XXL', 1),
('Футболка «ВАЙБ Оверсайз»', 'Базовая футболка оверсайз из плотного хлопка 240 г/м².', 1990, NULL, 'Футболки', 'S,M,L,XL', 2),
('Лонгслив «ВАЙБ Mono»', 'Лонгслив с минималистичным принтом на груди.', 2490, NULL, 'Футболки', 'S,M,L,XL', 3),
('Кепка «ВАЙБ»', 'Классическая кепка с вышитым логотипом, регулируемый ремешок.', 1490, NULL, 'Аксессуары', 'One size', 4),
('Сумка-шоппер «ВАЙБ»', 'Плотная хлопковая сумка-шоппер с логотипом.', 990, NULL, 'Аксессуары', 'One size', 5),
('Свитшот «ВАЙБ Basic»', 'Тёплый свитшот прямого кроя, начёс внутри.', 3490, NULL, 'Худи', 'S,M,L,XL,XXL', 6);