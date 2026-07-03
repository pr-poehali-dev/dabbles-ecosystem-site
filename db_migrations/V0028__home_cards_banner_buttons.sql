-- Кнопки для баннера-обложки (пусто = кнопка не показывается)
ALTER TABLE home_cards ADD COLUMN IF NOT EXISTS button1_text TEXT NOT NULL DEFAULT '';
ALTER TABLE home_cards ADD COLUMN IF NOT EXISTS button1_href TEXT NOT NULL DEFAULT '';
ALTER TABLE home_cards ADD COLUMN IF NOT EXISTS button2_text TEXT NOT NULL DEFAULT '';
ALTER TABLE home_cards ADD COLUMN IF NOT EXISTS button2_href TEXT NOT NULL DEFAULT '';

-- Переносим текущие ссылки существующих баннеров в кнопки, чтобы не потерять поведение
UPDATE home_cards
SET button1_text = 'Обучайся с нами!', button1_href = href,
    button2_text = 'Узнать больше', button2_href = href
WHERE card_type = 'banner' AND href <> '' AND button1_text = '';