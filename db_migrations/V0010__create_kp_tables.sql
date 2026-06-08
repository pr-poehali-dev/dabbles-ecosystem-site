CREATE TABLE kp_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Основной шаблон',
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE kp_requests (
    id SERIAL PRIMARY KEY,
    organization TEXT NOT NULL,
    director_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    result_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
