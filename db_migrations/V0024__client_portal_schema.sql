
-- Клиенты портала
CREATE TABLE cp_clients (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  passport TEXT DEFAULT '',
  inn TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_active TEXT DEFAULT 'yes',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Сессии клиентов
CREATE TABLE cp_sessions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES cp_clients(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Дела
CREATE TABLE cp_cases (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES cp_clients(id),
  case_number TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  plaintiff TEXT DEFAULT '',
  defendant TEXT DEFAULT '',
  amount NUMERIC(15,2),
  court TEXT DEFAULT '',
  description TEXT DEFAULT '',
  docs_link TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  is_active TEXT DEFAULT 'yes',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Статусы дела (история)
CREATE TABLE cp_case_statuses (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cp_cases(id),
  status TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  comment TEXT DEFAULT '',
  happened_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Оплаты
CREATE TABLE cp_payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES cp_clients(id),
  case_id INTEGER,
  amount NUMERIC(15,2) NOT NULL,
  basis TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date DATE,
  due_date DATE,
  notes TEXT DEFAULT '',
  created_by INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Документы клиента (договоры, допники — онлайн-текст)
CREATE TABLE cp_documents (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES cp_clients(id),
  case_id INTEGER,
  doc_type TEXT NOT NULL DEFAULT 'contract',
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  is_active TEXT DEFAULT 'yes',
  sort_order INTEGER DEFAULT 1,
  created_by INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Заявления от клиентов
CREATE TABLE cp_requests (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES cp_clients(id),
  case_id INTEGER,
  request_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  comment TEXT DEFAULT '',
  admin_comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email-шаблоны
CREATE TABLE cp_email_templates (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  variables TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вставляем базовые шаблоны
INSERT INTO cp_email_templates (code, name, subject, body_html, variables) VALUES
(
  'welcome',
  'Приветствие нового клиента',
  'Добро пожаловать в личный кабинет — {{company_name}}',
  '<p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
<p>Для вас создан личный кабинет на портале <strong>{{company_name}}</strong>.</p>
<p>Ваши данные для входа:</p>
<ul>
  <li><b>Ссылка:</b> <a href="{{portal_url}}">{{portal_url}}</a></li>
  <li><b>Логин:</b> {{email}}</li>
  <li><b>Пароль:</b> {{password}}</li>
</ul>
<p>После первого входа рекомендуем сменить пароль.</p>
<p>С уважением,<br>{{company_name}}</p>',
  'full_name,email,password,portal_url,company_name'
),
(
  'new_status',
  'Новый статус по делу',
  'По вашему делу №{{case_number}} обновился статус',
  '<p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
<p>По делу <strong>№{{case_number}}</strong> ({{case_title}}) установлен новый статус:</p>
<p style="font-size:18px;font-weight:bold;color:#1a0a6e">{{status_label}}</p>
<p>{{comment}}</p>
<p>Подробности в личном кабинете: <a href="{{portal_url}}">{{portal_url}}</a></p>
<p>С уважением,<br>{{company_name}}</p>',
  'full_name,case_number,case_title,status_label,comment,portal_url,company_name'
),
(
  'new_payment',
  'Счёт на оплату',
  'Выставлен счёт на оплату — {{company_name}}',
  '<p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
<p>Выставлен счёт на оплату:</p>
<ul>
  <li><b>Сумма:</b> {{amount}} ₽</li>
  <li><b>Основание:</b> {{basis}}</li>
  <li><b>Срок оплаты:</b> {{due_date}}</li>
</ul>
<p>Реквизиты для оплаты: карта <b>2202 2006 5913 8646</b></p>
<p>Личный кабинет: <a href="{{portal_url}}">{{portal_url}}</a></p>
<p>С уважением,<br>{{company_name}}</p>',
  'full_name,amount,basis,due_date,portal_url,company_name'
),
(
  'send_document',
  'Отправка документа клиенту',
  'Документ для вас — {{company_name}}',
  '<p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
<p>По вашему запросу направляем документ: <b>{{doc_title}}</b></p>
<p>{{doc_content}}</p>
<p>Скачать файл: <a href="{{file_url}}">{{file_url}}</a></p>
<p>С уважением,<br>{{company_name}}</p>',
  'full_name,doc_title,doc_content,file_url,portal_url,company_name'
);

CREATE INDEX IF NOT EXISTS idx_cp_cases_client ON cp_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cp_payments_client ON cp_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_cp_documents_client ON cp_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_cp_requests_client ON cp_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_cp_sessions_token ON cp_sessions(token);
CREATE INDEX IF NOT EXISTS idx_cp_case_statuses_case ON cp_case_statuses(case_id);
