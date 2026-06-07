CREATE TABLE director_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE director_socials (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO director_socials (platform, label, url, sort_order) VALUES
  ('telegram', 'Telegram', '', 10),
  ('vk', 'ВКонтакте', '', 20);
