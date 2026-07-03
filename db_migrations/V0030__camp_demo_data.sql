-- Демонстрационная программа для проверки работы платформы Кэмп
INSERT INTO camp_programs (title, description, duration_label, level, sort_order)
VALUES ('Добро пожаловать в Кэмп', 'Знакомство с платформой Кэмп от Даббл.Образования: как проходить программы, лекции и тесты.', '15 минут', 'Начальный', 1);

INSERT INTO camp_modules (program_id, title, sort_order)
SELECT id, 'Модуль 1. Знакомство', 1 FROM camp_programs WHERE title = 'Добро пожаловать в Кэмп';

INSERT INTO camp_lectures (module_id, title, content, sort_order)
SELECT m.id, 'Что такое Кэмп',
'Кэмп — образовательная платформа Даббл. Здесь вы можете проходить программы обучения, изучать лекции и получать сертификаты после успешного прохождения итогового теста.',
1
FROM camp_modules m JOIN camp_programs p ON p.id = m.program_id WHERE p.title = 'Добро пожаловать в Кэмп';

INSERT INTO camp_tests (program_id, module_id, title, is_final, passing_score, sort_order)
SELECT p.id, m.id, 'Тест по модулю 1', FALSE, 70, 1
FROM camp_modules m JOIN camp_programs p ON p.id = m.program_id WHERE p.title = 'Добро пожаловать в Кэмп';

INSERT INTO camp_questions (test_id, question, sort_order)
SELECT t.id, 'Что нужно пройти, чтобы получить сертификат?', 1
FROM camp_tests t JOIN camp_programs p ON p.id = t.program_id WHERE p.title = 'Добро пожаловать в Кэмп' AND t.is_final = FALSE;

INSERT INTO camp_answers (question_id, answer_text, is_correct, sort_order)
SELECT q.id, 'Все лекции и итоговый тест', TRUE, 1 FROM camp_questions q
JOIN camp_tests t ON t.id = q.test_id JOIN camp_programs p ON p.id = t.program_id
WHERE p.title = 'Добро пожаловать в Кэмп';
INSERT INTO camp_answers (question_id, answer_text, is_correct, sort_order)
SELECT q.id, 'Ничего, сертификат выдаётся сразу', FALSE, 2 FROM camp_questions q
JOIN camp_tests t ON t.id = q.test_id JOIN camp_programs p ON p.id = t.program_id
WHERE p.title = 'Добро пожаловать в Кэмп';

INSERT INTO camp_tests (program_id, title, is_final, passing_score, sort_order)
SELECT id, 'Итоговый тест', TRUE, 70, 99 FROM camp_programs WHERE title = 'Добро пожаловать в Кэмп';

INSERT INTO camp_questions (test_id, question, sort_order)
SELECT t.id, 'Кто выпускает программы в Кэмпе?', 1
FROM camp_tests t JOIN camp_programs p ON p.id = t.program_id WHERE p.title = 'Добро пожаловать в Кэмп' AND t.is_final = TRUE;

INSERT INTO camp_answers (question_id, answer_text, is_correct, sort_order)
SELECT q.id, 'Даббл.Образование', TRUE, 1 FROM camp_questions q
JOIN camp_tests t ON t.id = q.test_id JOIN camp_programs p ON p.id = t.program_id
WHERE p.title = 'Добро пожаловать в Кэмп' AND t.is_final = TRUE;
INSERT INTO camp_answers (question_id, answer_text, is_correct, sort_order)
SELECT q.id, 'Сторонняя компания', FALSE, 2 FROM camp_questions q
JOIN camp_tests t ON t.id = q.test_id JOIN camp_programs p ON p.id = t.program_id
WHERE p.title = 'Добро пожаловать в Кэмп' AND t.is_final = TRUE;