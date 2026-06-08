-- Таблица стоп-слов для проверки КП
CREATE TABLE kp_stopwords (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Счётчик номеров документов (начиная с 100, чтобы первый получил 100)
CREATE SEQUENCE kp_doc_seq START 100;

-- Добавляем поле doc_number в kp_requests
ALTER TABLE kp_requests ADD COLUMN doc_number TEXT;
