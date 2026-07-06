-- Пересчёт баланса лицевых счетов на основе фактической истории оплаченных платежей.
-- Причина расхождения: списание/зачисление на баланс не применялось, если лицевой счёт
-- клиента ещё не был создан на момент отметки платежа как "оплачено" (счёт создаётся лениво).
UPDATE cp_accounts a
SET balance = sub.correct_balance, updated_at = NOW()
FROM (
  SELECT client_id,
    COALESCE(SUM(CASE WHEN payment_type = 'topup' AND status = 'paid' THEN amount ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN payment_type = 'charge' AND status = 'paid' THEN amount ELSE 0 END), 0) AS correct_balance
  FROM cp_payments
  GROUP BY client_id
) sub
WHERE a.client_id = sub.client_id;