
CREATE TABLE director_info (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Сергей Серебренников',
  position TEXT NOT NULL DEFAULT 'Генеральный директор',
  description TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  quote_source TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO director_info (full_name, position, description, quote, quote_source, email, photo_url)
VALUES (
  'Сергей Серебренников',
  'Генеральный директор',
  'Основатель и генеральный директор корпорации экосистемных проектов «Даббл». Предприниматель, стратег, архитектор цифрового будущего.',
  'Когда мы основывали «Даббл», перед нами стоял один вопрос: почему современный человек вынужден тратить силы на рутину вместо того, чтобы создавать? Мы решили дать ответ делом. Технологии должны служить человеку, а не наоборот. Мы строим будущее, в котором каждый инструмент понимает тебя с первого шага. И это только начало.',
  'Из интервью, январь 2026',
  'ceo@dabble.ru',
  'https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/2a281114-efe8-4e7f-a35b-4fced26c2d80.jpg'
);

CREATE TABLE director_bio (
  id SERIAL PRIMARY KEY,
  year_label TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO director_bio (year_label, title, body, sort_order) VALUES
  ('2002–2010', 'Начало карьеры', 'Окончил Московский государственный университет по специальности «Экономика и управление». Начал карьеру в крупной консалтинговой компании, где прошёл путь от аналитика до руководителя проектного офиса.', 10),
  ('2010–2018', 'Управление и рост', 'Занимал руководящие позиции в ведущих технологических компаниях России. Специализировался на построении цифровых экосистем и трансформации бизнес-процессов. Под его руководством реализованы проекты с совокупным оборотом свыше 5 млрд рублей.', 20),
  ('2018–2023', 'Предпринимательство', 'Основал и вывел на рынок несколько успешных цифровых продуктов в сфере B2B-сервисов. Стал партнёром венчурного фонда, специализирующегося на инвестициях в технологические стартапы.', 30),
  ('2025 — н.в.', '«Даббл»', 'Основал корпорацию экосистемных проектов «Даббл». Сформировал команду и стратегию компании, направленную на создание единой инфраструктуры цифровых сервисов для бизнеса и частных пользователей.', 40);

CREATE TABLE director_photos (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);
