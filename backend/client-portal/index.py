import json, os, secrets, hashlib, smtplib, re  # v3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr, formatdate, make_msgid
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
}

CARD_NUMBER = '2202200659138646'
PORTAL_URL = os.environ.get('PORTAL_URL', 'https://xn----8sbarwhfgi0a.xn--p1ai/client')

REQUEST_TYPES = {
    'recalculation': 'Заявление на перерасчёт',
    'termination': 'Заявление на расторжение договора',
    'additional': 'Дополнительное соглашение',
}

CASE_STATUSES = {
    'new': 'Принято в работу',
    'documents_prep': 'Подготовка документов',
    'filed': 'Документы поданы',
    'hearing': 'Судебное заседание',
    'decision': 'Решение суда',
    'enforcement': 'Исполнительное производство',
    'completed': 'Дело закрыто',
    'suspended': 'Приостановлено',
}


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def esc(v):
    if v is None: return 'NULL'
    if isinstance(v, bool): return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }


def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


def get_client(conn, event):
    headers = event.get('headers') or {}
    raw = (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()
    if not raw: return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT c.id, c.email, c.full_name, c.phone, c.address, c.passport, c.inn "
            f"FROM cp_sessions s JOIN cp_clients c ON c.id = s.client_id "
            f"WHERE s.token = {esc(raw)} AND s.expires_at > NOW() AND c.is_active = 'yes' LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    return {'id': row[0], 'email': row[1], 'full_name': row[2],
            'phone': row[3], 'address': row[4], 'passport': row[5], 'inn': row[6]}


def get_admin(conn, event):
    headers = event.get('headers') or {}
    raw = (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()
    if not raw: return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.email, u.full_name, u.role FROM sessions s "
            f"JOIN users u ON u.id = s.user_id "
            f"WHERE s.token = {esc(raw)} AND s.expires_at > NOW() AND u.is_active = TRUE LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    if row[3] not in ('admin', 'manager'): return None
    return {'id': row[0], 'email': row[1], 'full_name': row[2], 'role': row[3]}


def send_email(to_email, subject, body_html, from_name=None):
    host = os.environ.get('SMTP_HOST', '')
    port = int(os.environ.get('SMTP_PORT', '465'))
    user = os.environ.get('SMTP_USER', '')
    password = os.environ.get('SMTP_PASSWORD', '')
    sender_name = from_name or os.environ.get('SMTP_FROM_NAME', 'Личный кабинет')
    if not host or not user or not password:
        return False
    # Текстовая версия из HTML (важно для антиспама)
    text_body = re.sub(r'<[^>]+>', '', body_html)
    text_body = re.sub(r'\n\s*\n+', '\n\n', text_body).strip()
    msg = MIMEMultipart('alternative')
    msg['Subject'] = Header(subject, 'utf-8')
    # From обязан содержать тот же адрес, что и SMTP_USER (требование Mail.ru)
    msg['From'] = formataddr((str(Header(sender_name, 'utf-8')), user))
    msg['To'] = to_email
    msg['Reply-To'] = user
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain=user.split('@')[-1] if '@' in user else None)
    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(body_html, 'html', 'utf-8'))
    try:
        if port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=20) as s:
                s.login(user, password)
                s.sendmail(user, [to_email], msg.as_bytes())
        else:
            with smtplib.SMTP(host, port, timeout=20) as s:
                s.ehlo()
                s.starttls()
                s.ehlo()
                s.login(user, password)
                s.sendmail(user, [to_email], msg.as_bytes())
        print(f'[SMTP OK] to={to_email} subject={subject}')
        return True
    except Exception as e:
        print(f'[SMTP ERROR] host={host} port={port} user={user} to={to_email} err={e}')
        return str(e)


def render_template(html, variables):
    for k, v in variables.items():
        html = html.replace('{{' + k + '}}', str(v) if v else '')
    return html


def send_from_template(conn, code, to_email, variables):
    with conn.cursor() as cur:
        cur.execute(f"SELECT subject, body_html FROM cp_email_templates WHERE code = {esc(code)} LIMIT 1")
        row = cur.fetchone()
    if not row: return False
    subject = render_template(row[0], variables)
    body = render_template(row[1], variables)
    return send_email(to_email, subject, body)


def handler(event: dict, context) -> dict:
    """Клиентский портал: авторизация клиентов, дела, оплаты, документы, заявления. Управление для администраторов."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    conn = db()

    try:
        # ══════════════════════════════════════════════════════════
        # КЛИЕНТ: АВТОРИЗАЦИЯ
        # ══════════════════════════════════════════════════════════

        if action == 'login' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            if not email or not password:
                return resp(400, {'error': 'Email и пароль обязательны'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, email, full_name, password_hash, is_active "
                    f"FROM cp_clients WHERE email = {esc(email)} LIMIT 1"
                )
                row = cur.fetchone()
            if not row or row[3] != hash_pw(password):
                return resp(401, {'error': 'Неверный email или пароль'})
            if row[4] != 'yes':
                return resp(403, {'error': 'Аккаунт заблокирован'})
            token = secrets.token_hex(32)
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO cp_sessions (client_id, token, expires_at) "
                    f"VALUES ({esc(row[0])}, {esc(token)}, NOW() + INTERVAL '30 days')"
                )
            conn.commit()
            return resp(200, {'token': token, 'client': {'id': row[0], 'email': row[1], 'full_name': row[2]}})

        if action == 'logout' and method == 'POST':
            headers = event.get('headers') or {}
            raw = (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()
            if raw:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE cp_sessions SET expires_at = NOW() WHERE token = {esc(raw)}")
                conn.commit()
            return resp(200, {'ok': True})

        if action == 'me' and method == 'GET':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            return resp(200, {'client': client})

        # ══════════════════════════════════════════════════════════
        # КЛИЕНТ: МОИ ДЕЛА
        # ══════════════════════════════════════════════════════════

        if action == 'cases' and method == 'GET':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, case_number, title, plaintiff, defendant, amount, court, status, docs_link, created_at "
                    f"FROM cp_cases WHERE client_id = {esc(client['id'])} AND is_active = 'yes' ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
            cases = []
            for r in rows:
                with conn.cursor() as cur2:
                    cur2.execute(
                        f"SELECT status, label, comment, happened_at FROM cp_case_statuses "
                        f"WHERE case_id = {esc(r[0])} ORDER BY happened_at"
                    )
                    statuses = [{'status': s[0], 'label': s[1], 'comment': s[2], 'happened_at': str(s[3])} for s in cur2.fetchall()]
                cases.append({
                    'id': r[0], 'case_number': r[1], 'title': r[2],
                    'plaintiff': r[3], 'defendant': r[4],
                    'amount': float(r[5]) if r[5] else None,
                    'court': r[6], 'status': r[7],
                    'status_label': CASE_STATUSES.get(r[7], r[7]),
                    'docs_link': r[8], 'created_at': str(r[9]),
                    'statuses': statuses,
                })
            return resp(200, {'cases': cases})

        if action == 'case' and method == 'GET':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            case_id = int(qs.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, case_number, title, plaintiff, defendant, amount, court, description, status, docs_link, created_at "
                    f"FROM cp_cases WHERE id = {esc(case_id)} AND client_id = {esc(client['id'])} AND is_active = 'yes' LIMIT 1"
                )
                row = cur.fetchone()
            if not row: return resp(404, {'error': 'Дело не найдено'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT status, label, comment, happened_at FROM cp_case_statuses "
                    f"WHERE case_id = {esc(case_id)} ORDER BY happened_at"
                )
                statuses = [{'status': s[0], 'label': s[1], 'comment': s[2], 'happened_at': str(s[3])} for s in cur.fetchall()]
            return resp(200, {'case': {
                'id': row[0], 'case_number': row[1], 'title': row[2],
                'plaintiff': row[3], 'defendant': row[4],
                'amount': float(row[5]) if row[5] else None,
                'court': row[6], 'description': row[7], 'status': row[8],
                'status_label': CASE_STATUSES.get(row[8], row[8]),
                'docs_link': row[9], 'created_at': str(row[10]),
                'statuses': statuses,
            }})

        # ══════════════════════════════════════════════════════════
        # КЛИЕНТ: ОПЛАТЫ
        # ══════════════════════════════════════════════════════════

        if action == 'payments' and method == 'GET':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT p.id, p.amount, p.basis, p.status, p.payment_date, p.due_date, p.notes, p.created_at, "
                    f"c.case_number, c.title "
                    f"FROM cp_payments p LEFT JOIN cp_cases c ON c.id = p.case_id "
                    f"WHERE p.client_id = {esc(client['id'])} ORDER BY p.created_at DESC"
                )
                rows = cur.fetchall()
            return resp(200, {'payments': [{
                'id': r[0], 'amount': float(r[1]) if r[1] else 0,
                'basis': r[2], 'status': r[3],
                'payment_date': str(r[4]) if r[4] else None,
                'due_date': str(r[5]) if r[5] else None,
                'notes': r[6], 'created_at': str(r[7]),
                'case_number': r[8], 'case_title': r[9],
                'card_number': CARD_NUMBER,
            } for r in rows]})

        # ══════════════════════════════════════════════════════════
        # КЛИЕНТ: МОИ ДОКУМЕНТЫ
        # ══════════════════════════════════════════════════════════

        if action == 'documents' and method == 'GET':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, doc_type, title, content, file_url, file_name, case_id, sort_order, created_at "
                    f"FROM cp_documents WHERE client_id = {esc(client['id'])} AND is_active = 'yes' ORDER BY sort_order, created_at"
                )
                rows = cur.fetchall()
            return resp(200, {'documents': [{
                'id': r[0], 'doc_type': r[1], 'title': r[2],
                'content': r[3], 'file_url': r[4], 'file_name': r[5],
                'case_id': r[6], 'sort_order': r[7], 'created_at': str(r[8]),
            } for r in rows]})

        # ══════════════════════════════════════════════════════════
        # КЛИЕНТ: ЗАЯВЛЕНИЯ
        # ══════════════════════════════════════════════════════════

        if action == 'submit-request' and method == 'POST':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            req_type = body.get('request_type', '')
            if req_type not in REQUEST_TYPES:
                return resp(400, {'error': 'Неверный тип заявления'})
            case_id = body.get('case_id') or None
            comment = body.get('comment', '')
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO cp_requests (client_id, case_id, request_type, status, comment) "
                    f"VALUES ({esc(client['id'])}, {esc(case_id)}, {esc(req_type)}, 'new', {esc(comment)}) RETURNING id"
                )
                req_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': req_id, 'message': 'Заявление принято'})

        if action == 'my-requests' and method == 'GET':
            client = get_client(conn, event)
            if not client: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT r.id, r.request_type, r.status, r.comment, r.admin_comment, r.created_at, c.case_number "
                    f"FROM cp_requests r LEFT JOIN cp_cases c ON c.id = r.case_id "
                    f"WHERE r.client_id = {esc(client['id'])} ORDER BY r.created_at DESC"
                )
                rows = cur.fetchall()
            return resp(200, {'requests': [{
                'id': r[0], 'request_type': r[1],
                'request_type_label': REQUEST_TYPES.get(r[1], r[1]),
                'status': r[2], 'comment': r[3], 'admin_comment': r[4],
                'created_at': str(r[5]), 'case_number': r[6],
            } for r in rows]})

        # ══════════════════════════════════════════════════════════
        # ADMIN: КЛИЕНТЫ
        # ══════════════════════════════════════════════════════════

        if action == 'admin-clients' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            search = qs.get('search', '')
            where = "is_active = 'yes'"
            if search:
                s = esc(f'%{search}%')
                where += f" AND (full_name ILIKE {s} OR email ILIKE {s} OR phone ILIKE {s})"
            with conn.cursor() as cur:
                cur.execute(f"SELECT id, email, full_name, phone, inn, created_at FROM cp_clients WHERE {where} ORDER BY full_name")
                rows = cur.fetchall()
            return resp(200, {'clients': [{'id': r[0], 'email': r[1], 'full_name': r[2], 'phone': r[3], 'inn': r[4], 'created_at': str(r[5])} for r in rows]})

        if action == 'admin-client-get' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            client_id = int(qs.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, email, full_name, phone, address, passport, inn, notes, is_active, created_at "
                    f"FROM cp_clients WHERE id = {esc(client_id)} LIMIT 1"
                )
                row = cur.fetchone()
            if not row: return resp(404, {'error': 'Клиент не найден'})
            return resp(200, {'client': {
                'id': row[0], 'email': row[1], 'full_name': row[2], 'phone': row[3],
                'address': row[4], 'passport': row[5], 'inn': row[6],
                'notes': row[7], 'is_active': row[8], 'created_at': str(row[9]),
            }})

        if action == 'admin-client-create' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            email = (body.get('email') or '').strip().lower()
            full_name = (body.get('full_name') or '').strip()
            if not email or not full_name:
                return resp(400, {'error': 'Email и ФИО обязательны'})
            # Генерируем пароль
            password = secrets.token_urlsafe(8)
            with conn.cursor() as cur:
                cur.execute(f"SELECT id FROM cp_clients WHERE email = {esc(email)} LIMIT 1")
                if cur.fetchone():
                    return resp(409, {'error': 'Клиент с таким email уже существует'})
                cur.execute(
                    f"INSERT INTO cp_clients (email, password_hash, full_name, phone, address, passport, inn, notes) "
                    f"VALUES ({esc(email)}, {esc(hash_pw(password))}, {esc(full_name)}, "
                    f"{esc(body.get('phone',''))}, {esc(body.get('address',''))}, "
                    f"{esc(body.get('passport',''))}, {esc(body.get('inn',''))}, {esc(body.get('notes',''))}) RETURNING id"
                )
                client_id = cur.fetchone()[0]
            conn.commit()
            # Отправляем welcome-письмо
            send_from_template(conn, 'welcome', email, {
                'full_name': full_name,
                'email': email,
                'password': password,
                'portal_url': PORTAL_URL,
                'company_name': os.environ.get('SMTP_FROM_NAME', 'Личный кабинет'),
            })
            return resp(201, {'id': client_id, 'password': password})

        if action == 'admin-client-update' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('id', 0))
            fields = []
            for k in ('full_name', 'phone', 'address', 'passport', 'inn', 'notes', 'email'):
                if k in body: fields.append(f"{k} = {esc(body[k])}")
            if 'is_active' in body: fields.append(f"is_active = {esc(body['is_active'])}")
            if not fields: return resp(400, {'error': 'Нет данных'})
            fields.append("updated_at = NOW()")
            with conn.cursor() as cur:
                cur.execute(f"UPDATE cp_clients SET {', '.join(fields)} WHERE id = {esc(client_id)}")
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'admin-client-reset-password' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('id', 0))
            new_password = secrets.token_urlsafe(8)
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE cp_clients SET password_hash = {esc(hash_pw(new_password))}, updated_at = NOW() WHERE id = {esc(client_id)}"
                )
                cur.execute(f"SELECT email, full_name FROM cp_clients WHERE id = {esc(client_id)} LIMIT 1")
                row = cur.fetchone()
            conn.commit()
            if row:
                send_email(row[0], f'Новый пароль — {os.environ.get("SMTP_FROM_NAME","Кабинет")}',
                    f'<p>Здравствуйте, <b>{row[1]}</b>!</p><p>Ваш новый пароль: <b>{new_password}</b></p>'
                    f'<p>Вход: <a href="{PORTAL_URL}">{PORTAL_URL}</a></p>')
            return resp(200, {'ok': True, 'password': new_password})

        if action == 'admin-client-send-credentials' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('id', 0))
            new_password = secrets.token_urlsafe(8)
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE cp_clients SET password_hash = {esc(hash_pw(new_password))}, updated_at = NOW() WHERE id = {esc(client_id)}"
                )
                cur.execute(f"SELECT email, full_name FROM cp_clients WHERE id = {esc(client_id)} LIMIT 1")
                row = cur.fetchone()
            conn.commit()
            if not row:
                return resp(404, {'error': 'Клиент не найден'})
            sent = send_from_template(conn, 'welcome', row[0], {
                'full_name': row[1],
                'email': row[0],
                'password': new_password,
                'portal_url': PORTAL_URL,
                'company_name': os.environ.get('SMTP_FROM_NAME', 'Личный кабинет'),
            })
            return resp(200, {'ok': sent is True, 'result': sent, 'sent_to': row[0], 'password': new_password})

        # ══════════════════════════════════════════════════════════
        # ADMIN: ДЕЛА
        # ══════════════════════════════════════════════════════════

        if action == 'admin-cases' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            client_id = qs.get('client_id')
            where = "c.is_active = 'yes'"
            if client_id: where += f" AND c.client_id = {esc(int(client_id))}"
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT c.id, c.case_number, c.title, c.plaintiff, c.defendant, c.amount, c.status, c.created_at, "
                    f"cl.full_name, cl.email "
                    f"FROM cp_cases c JOIN cp_clients cl ON cl.id = c.client_id "
                    f"WHERE {where} ORDER BY c.created_at DESC"
                )
                rows = cur.fetchall()
            return resp(200, {'cases': [{
                'id': r[0], 'case_number': r[1], 'title': r[2], 'plaintiff': r[3],
                'defendant': r[4], 'amount': float(r[5]) if r[5] else None,
                'status': r[6], 'status_label': CASE_STATUSES.get(r[6], r[6]),
                'created_at': str(r[7]), 'client_name': r[8], 'client_email': r[9],
            } for r in rows]})

        if action == 'admin-case-create' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('client_id', 0))
            title = (body.get('title') or '').strip()
            if not client_id or not title:
                return resp(400, {'error': 'client_id и title обязательны'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO cp_cases (client_id, case_number, title, plaintiff, defendant, amount, court, description, docs_link, status) "
                    f"VALUES ({esc(client_id)}, {esc(body.get('case_number',''))}, {esc(title)}, "
                    f"{esc(body.get('plaintiff',''))}, {esc(body.get('defendant',''))}, "
                    f"{esc(body.get('amount') or None)}, {esc(body.get('court',''))}, "
                    f"{esc(body.get('description',''))}, {esc(body.get('docs_link',''))}, 'new') RETURNING id"
                )
                case_id = cur.fetchone()[0]
                # Начальный статус
                cur.execute(
                    f"INSERT INTO cp_case_statuses (case_id, status, label, comment) "
                    f"VALUES ({esc(case_id)}, 'new', 'Принято в работу', {esc(body.get('status_comment',''))})"
                )
            conn.commit()
            return resp(201, {'id': case_id})

        if action == 'admin-case-update' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            case_id = int(body.get('id', 0))
            fields = []
            for k in ('case_number', 'title', 'plaintiff', 'defendant', 'court', 'description', 'docs_link'):
                if k in body: fields.append(f"{k} = {esc(body[k])}")
            if 'amount' in body: fields.append(f"amount = {esc(body['amount'] or None)}")
            if fields:
                fields.append("updated_at = NOW()")
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE cp_cases SET {', '.join(fields)} WHERE id = {esc(case_id)}")
                conn.commit()
            return resp(200, {'ok': True})

        if action == 'admin-case-add-status' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            case_id = int(body.get('case_id', 0))
            status = body.get('status', '')
            label = body.get('label') or CASE_STATUSES.get(status, status)
            comment = body.get('comment', '')
            notify = body.get('notify', True)
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO cp_case_statuses (case_id, status, label, comment) "
                    f"VALUES ({esc(case_id)}, {esc(status)}, {esc(label)}, {esc(comment)})"
                )
                cur.execute(f"UPDATE cp_cases SET status = {esc(status)}, updated_at = NOW() WHERE id = {esc(case_id)}")
                if notify:
                    cur.execute(
                        f"SELECT cl.email, cl.full_name, c.case_number, c.title "
                        f"FROM cp_cases c JOIN cp_clients cl ON cl.id = c.client_id WHERE c.id = {esc(case_id)} LIMIT 1"
                    )
                    row = cur.fetchone()
                    if row:
                        send_from_template(conn, 'new_status', row[0], {
                            'full_name': row[1], 'case_number': row[2], 'case_title': row[3],
                            'status_label': label, 'comment': comment,
                            'portal_url': PORTAL_URL,
                            'company_name': os.environ.get('SMTP_FROM_NAME', 'Кабинет'),
                        })
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════════
        # ADMIN: ОПЛАТЫ
        # ══════════════════════════════════════════════════════════

        if action == 'admin-payments' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            client_id = qs.get('client_id')
            where = "p.id > 0"
            if client_id: where += f" AND p.client_id = {esc(int(client_id))}"
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT p.id, p.amount, p.basis, p.status, p.payment_date, p.due_date, p.notes, p.created_at, "
                    f"cl.full_name, c.case_number "
                    f"FROM cp_payments p LEFT JOIN cp_clients cl ON cl.id = p.client_id "
                    f"LEFT JOIN cp_cases c ON c.id = p.case_id "
                    f"WHERE {where} ORDER BY p.created_at DESC"
                )
                rows = cur.fetchall()
            return resp(200, {'payments': [{
                'id': r[0], 'amount': float(r[1]) if r[1] else 0,
                'basis': r[2], 'status': r[3],
                'payment_date': str(r[4]) if r[4] else None,
                'due_date': str(r[5]) if r[5] else None,
                'notes': r[6], 'created_at': str(r[7]),
                'client_name': r[8], 'case_number': r[9],
            } for r in rows]})

        if action == 'admin-payment-create' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('client_id', 0))
            amount = body.get('amount')
            basis = body.get('basis', '')
            notify = body.get('notify', True)
            if not client_id or not amount:
                return resp(400, {'error': 'client_id и amount обязательны'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO cp_payments (client_id, case_id, amount, basis, status, due_date, notes, created_by) "
                    f"VALUES ({esc(client_id)}, {esc(body.get('case_id') or None)}, {esc(float(amount))}, "
                    f"{esc(basis)}, 'pending', {esc(body.get('due_date') or None)}, "
                    f"{esc(body.get('notes',''))}, {esc(admin['id'])}) RETURNING id"
                )
                pay_id = cur.fetchone()[0]
                if notify:
                    cur.execute(f"SELECT email, full_name FROM cp_clients WHERE id = {esc(client_id)} LIMIT 1")
                    row = cur.fetchone()
                    if row:
                        send_from_template(conn, 'new_payment', row[0], {
                            'full_name': row[1], 'amount': f"{float(amount):,.2f}".replace(',', ' '),
                            'basis': basis, 'due_date': body.get('due_date', 'не указан'),
                            'portal_url': PORTAL_URL,
                            'company_name': os.environ.get('SMTP_FROM_NAME', 'Кабинет'),
                        })
            conn.commit()
            return resp(201, {'id': pay_id})

        if action == 'admin-payment-update' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            pay_id = int(body.get('id', 0))
            fields = []
            for k in ('basis', 'status', 'notes'):
                if k in body: fields.append(f"{k} = {esc(body[k])}")
            if 'amount' in body: fields.append(f"amount = {esc(float(body['amount']))}")
            if 'payment_date' in body: fields.append(f"payment_date = {esc(body['payment_date'] or None)}")
            if 'due_date' in body: fields.append(f"due_date = {esc(body['due_date'] or None)}")
            if fields:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE cp_payments SET {', '.join(fields)} WHERE id = {esc(pay_id)}")
                conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════════
        # ADMIN: ДОКУМЕНТЫ
        # ══════════════════════════════════════════════════════════

        if action == 'admin-documents' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            client_id = int(qs.get('client_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, doc_type, title, content, file_url, file_name, case_id, sort_order, is_active, created_at "
                    f"FROM cp_documents WHERE client_id = {esc(client_id)} ORDER BY sort_order, created_at"
                )
                rows = cur.fetchall()
            return resp(200, {'documents': [{
                'id': r[0], 'doc_type': r[1], 'title': r[2], 'content': r[3],
                'file_url': r[4], 'file_name': r[5], 'case_id': r[6],
                'sort_order': r[7], 'is_active': r[8], 'created_at': str(r[9]),
            } for r in rows]})

        if action == 'admin-document-save' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            doc_id = body.get('id')
            client_id = int(body.get('client_id', 0))
            if doc_id:
                fields = []
                for k in ('doc_type', 'title', 'content', 'file_url', 'file_name', 'is_active'):
                    if k in body: fields.append(f"{k} = {esc(body[k])}")
                if 'sort_order' in body: fields.append(f"sort_order = {esc(int(body['sort_order']))}")
                if 'case_id' in body: fields.append(f"case_id = {esc(body['case_id'] or None)}")
                if fields:
                    fields.append("updated_at = NOW()")
                    with conn.cursor() as cur:
                        cur.execute(f"UPDATE cp_documents SET {', '.join(fields)} WHERE id = {esc(int(doc_id))}")
                    conn.commit()
                return resp(200, {'ok': True})
            else:
                with conn.cursor() as cur:
                    cur.execute(
                        f"INSERT INTO cp_documents (client_id, case_id, doc_type, title, content, file_url, file_name, sort_order, created_by) "
                        f"VALUES ({esc(client_id)}, {esc(body.get('case_id') or None)}, "
                        f"{esc(body.get('doc_type','contract'))}, {esc(body.get('title',''))}, "
                        f"{esc(body.get('content',''))}, {esc(body.get('file_url',''))}, "
                        f"{esc(body.get('file_name',''))}, {esc(int(body.get('sort_order',1)))}, "
                        f"{esc(admin['id'])}) RETURNING id"
                    )
                    new_id = cur.fetchone()[0]
                conn.commit()
                return resp(201, {'id': new_id})

        # ══════════════════════════════════════════════════════════
        # ADMIN: ЗАЯВЛЕНИЯ
        # ══════════════════════════════════════════════════════════

        if action == 'admin-requests' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            client_id = qs.get('client_id')
            where = "r.id > 0"
            if client_id: where += f" AND r.client_id = {esc(int(client_id))}"
            status_f = qs.get('status', '')
            if status_f: where += f" AND r.status = {esc(status_f)}"
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT r.id, r.request_type, r.status, r.comment, r.admin_comment, r.created_at, "
                    f"cl.full_name, cl.email, c.case_number "
                    f"FROM cp_requests r JOIN cp_clients cl ON cl.id = r.client_id "
                    f"LEFT JOIN cp_cases c ON c.id = r.case_id "
                    f"WHERE {where} ORDER BY r.created_at DESC LIMIT 100"
                )
                rows = cur.fetchall()
            return resp(200, {'requests': [{
                'id': r[0], 'request_type': r[1],
                'request_type_label': REQUEST_TYPES.get(r[1], r[1]),
                'status': r[2], 'comment': r[3], 'admin_comment': r[4],
                'created_at': str(r[5]), 'client_name': r[6], 'client_email': r[7], 'case_number': r[8],
            } for r in rows]})

        if action == 'admin-request-update' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            req_id = int(body.get('id', 0))
            fields = []
            if 'status' in body: fields.append(f"status = {esc(body['status'])}")
            if 'admin_comment' in body: fields.append(f"admin_comment = {esc(body['admin_comment'])}")
            if fields:
                fields.append("updated_at = NOW()")
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE cp_requests SET {', '.join(fields)} WHERE id = {esc(req_id)}")
                conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════════
        # ADMIN: ОТПРАВКА ДОКУМЕНТА НА ПОЧТУ
        # ══════════════════════════════════════════════════════════

        if action == 'admin-send-doc' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('client_id', 0))
            doc_title = body.get('doc_title', 'Документ')
            doc_content = body.get('doc_content', '')
            file_url = body.get('file_url', '')
            with conn.cursor() as cur:
                cur.execute(f"SELECT email, full_name FROM cp_clients WHERE id = {esc(client_id)} LIMIT 1")
                row = cur.fetchone()
            if not row: return resp(404, {'error': 'Клиент не найден'})
            ok = send_from_template(conn, 'send_document', row[0], {
                'full_name': row[1], 'doc_title': doc_title,
                'doc_content': doc_content, 'file_url': file_url,
                'portal_url': PORTAL_URL,
                'company_name': os.environ.get('SMTP_FROM_NAME', 'Кабинет'),
            })
            return resp(200, {'ok': ok, 'sent_to': row[0]})

        if action == 'admin-send-email' and method == 'POST':
            """Отправить произвольное письмо клиенту."""
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            client_id = int(body.get('client_id', 0))
            subject = body.get('subject', '').strip()
            message = body.get('message', '').strip()
            if not client_id or not subject or not message:
                return resp(400, {'error': 'Заполните получателя, тему и текст'})
            with conn.cursor() as cur:
                cur.execute(f"SELECT email, full_name FROM cp_clients WHERE id = {esc(client_id)} LIMIT 1")
                row = cur.fetchone()
            if not row: return resp(404, {'error': 'Клиент не найден'})
            company = os.environ.get('SMTP_FROM_NAME', 'Личный кабинет')
            html = (
                f'<p>Здравствуйте, <b>{row[1]}</b>!</p>'
                f'<div style="line-height:1.7">{message.replace(chr(10), "<br>")}</div>'
                f'<p style="margin-top:24px">С уважением,<br><b>{company}</b></p>'
                f'<p><a href="{PORTAL_URL}">Личный кабинет</a></p>'
            )
            ok = send_email(row[0], subject, html)
            return resp(200, {'ok': ok is True, 'sent_to': row[0]})

        if action == 'admin-payment-reminders' and method == 'POST':
            """Отправить напоминания об оплате всем клиентам, у кого дедлайн через ≤3 дня."""
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT p.id, p.amount, p.basis, p.due_date, cl.email, cl.full_name "
                    "FROM cp_payments p JOIN cp_clients cl ON cl.id = p.client_id "
                    "WHERE p.status = 'pending' AND p.due_date IS NOT NULL "
                    "AND p.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'"
                )
                rows = cur.fetchall()
            sent, errors = [], []
            for r in rows:
                pay_id, amount, basis, due_date, email, full_name = r
                due_str = due_date.strftime('%d.%m.%Y') if hasattr(due_date, 'strftime') else str(due_date)
                ok = send_from_template(conn, 'new_payment', email, {
                    'full_name': full_name,
                    'amount': f"{float(amount):,.2f}".replace(',', ' '),
                    'basis': basis,
                    'due_date': due_str,
                    'portal_url': PORTAL_URL,
                    'company_name': os.environ.get('SMTP_FROM_NAME', 'Кабинет'),
                })
                if ok is True:
                    sent.append({'payment_id': pay_id, 'email': email})
                else:
                    errors.append({'payment_id': pay_id, 'email': email, 'error': str(ok)})
            return resp(200, {'sent': sent, 'errors': errors, 'total': len(rows)})

        # ══════════════════════════════════════════════════════════
        # ADMIN: EMAIL-ШАБЛОНЫ
        # ══════════════════════════════════════════════════════════

        if action == 'admin-templates' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute("SELECT id, code, name, subject, body_html, variables FROM cp_email_templates ORDER BY id")
                rows = cur.fetchall()
            return resp(200, {'templates': [{'id': r[0], 'code': r[1], 'name': r[2], 'subject': r[3], 'body_html': r[4], 'variables': r[5]} for r in rows]})

        if action == 'admin-template-update' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            tpl_id = int(body.get('id', 0))
            fields = []
            for k in ('name', 'subject', 'body_html'):
                if k in body: fields.append(f"{k} = {esc(body[k])}")
            if fields:
                fields.append("updated_at = NOW()")
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE cp_email_templates SET {', '.join(fields)} WHERE id = {esc(tpl_id)}")
                conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════════
        # ADMIN: СТАТИСТИКА
        # ══════════════════════════════════════════════════════════

        if action == 'admin-stats' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM cp_clients WHERE is_active = 'yes'")
                clients_count = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM cp_cases WHERE is_active = 'yes'")
                cases_count = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM cp_requests WHERE status = 'new'")
                new_requests = cur.fetchone()[0]
                cur.execute("SELECT COALESCE(SUM(amount),0) FROM cp_payments WHERE status = 'paid'")
                total_paid = float(cur.fetchone()[0])
                cur.execute("SELECT COALESCE(SUM(amount),0) FROM cp_payments WHERE status = 'pending'")
                total_pending = float(cur.fetchone()[0])
            return resp(200, {
                'clients_count': clients_count,
                'cases_count': cases_count,
                'new_requests': new_requests,
                'total_paid': total_paid,
                'total_pending': total_pending,
            })

        # ══ ДИАГНОСТИКА SMTP ══
        if action == 'test-email' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            to = body.get('to') or admin['email']
            host = os.environ.get('SMTP_HOST', '')
            port = os.environ.get('SMTP_PORT', '')
            user = os.environ.get('SMTP_USER', '')
            has_pw = bool(os.environ.get('SMTP_PASSWORD', ''))
            result = send_email(to, 'Тест SMTP — Клиентский портал',
                f'<p>Это тестовое письмо. SMTP подключён корректно.</p><p>host={host} port={port} user={user}</p>')
            return resp(200, {
                'ok': result is True,
                'result': result,
                'smtp_host': host,
                'smtp_port': port,
                'smtp_user': user,
                'smtp_password_set': has_pw,
                'sent_to': to,
            })

        return resp(404, {'error': 'Неизвестное действие'})

    except Exception as e:
        conn.rollback()
        return resp(500, {'error': str(e)})
    finally:
        conn.close()