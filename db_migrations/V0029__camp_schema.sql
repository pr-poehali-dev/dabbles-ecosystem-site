-- ═══════════════════════════════════════════════════════════
-- КЭМП от Даббл.Образования — образовательная платформа
-- ═══════════════════════════════════════════════════════════

CREATE TABLE camp_students (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone VARCHAR(32) NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camp_sessions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES camp_students(id),
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camp_programs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    duration_label VARCHAR(64) NOT NULL DEFAULT '',
    level VARCHAR(32) NOT NULL DEFAULT 'Начальный',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camp_modules (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES camp_programs(id),
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE camp_lectures (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES camp_modules(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    video_url TEXT NOT NULL DEFAULT '',
    file_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE camp_tests (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES camp_programs(id),
    module_id INTEGER REFERENCES camp_modules(id),
    title TEXT NOT NULL,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    passing_score INTEGER NOT NULL DEFAULT 70,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE camp_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES camp_tests(id),
    question TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE camp_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES camp_questions(id),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE camp_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES camp_students(id),
    program_id INTEGER NOT NULL REFERENCES camp_programs(id),
    status VARCHAR(16) NOT NULL DEFAULT 'in_progress',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, program_id)
);

CREATE TABLE camp_lecture_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES camp_students(id),
    lecture_id INTEGER NOT NULL REFERENCES camp_lectures(id),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, lecture_id)
);

CREATE TABLE camp_test_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES camp_students(id),
    test_id INTEGER NOT NULL REFERENCES camp_tests(id),
    score INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camp_certificates (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES camp_students(id),
    program_id INTEGER NOT NULL REFERENCES camp_programs(id),
    cert_number VARCHAR(32) NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, program_id)
);