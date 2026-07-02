CREATE TABLE cp_accounts (
  id            SERIAL PRIMARY KEY,
  client_id     INTEGER NOT NULL UNIQUE REFERENCES cp_clients(id),
  account_number VARCHAR(20) NOT NULL UNIQUE,
  balance       NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency      VARCHAR(3) NOT NULL DEFAULT 'RUB',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cp_cards (
  id               SERIAL PRIMARY KEY,
  account_id       INTEGER NOT NULL REFERENCES cp_accounts(id),
  client_id        INTEGER NOT NULL REFERENCES cp_clients(id),
  card_number      VARCHAR(19) NOT NULL UNIQUE,
  card_number_full VARCHAR(16) NOT NULL UNIQUE,
  expiry_month     SMALLINT NOT NULL,
  expiry_year      SMALLINT NOT NULL,
  card_holder      VARCHAR(100) NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cp_accounts_client ON cp_accounts(client_id);
CREATE INDEX idx_cp_cards_account   ON cp_cards(account_id);
CREATE INDEX idx_cp_cards_client    ON cp_cards(client_id);
