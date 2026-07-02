-- Тип платежа: charge = списание за услуги, topup = пополнение баланса
ALTER TABLE cp_payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(10) NOT NULL DEFAULT 'charge';
-- Обновляем существующие записи
UPDATE cp_payments SET payment_type = 'charge' WHERE payment_type IS NULL OR payment_type = '';