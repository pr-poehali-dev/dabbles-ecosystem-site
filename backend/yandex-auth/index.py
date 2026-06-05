import json, os, secrets, urllib.request, urllib.parse
import psycopg2
from datetime import datetime, timedelta, timezone

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }

def make_session(conn, user_id, user_agent, ip):
    token = secrets.token_hex(32)
    exp = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO sessions (token, user_id, expires_at, user_agent, ip, client_id) "
            f"VALUES ('{token}', {user_id}, '{exp}', {esc(user_agent[:500])}, {esc(ip)}, 'meroshkins')"
        )
    conn.commit()
    return token

def get_user_row(conn, user_id):
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT id, email, full_name, position, role, must_change_password, "
            f"access_tasks, access_documents, access_crm, is_active, avatar_url, phone, tfa_enabled "
            f"FROM users WHERE id = {user_id} LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    return {
        'id': row[0], 'email': row[1], 'full_name': row[2], 'position': row[3],
        'role': row[4], 'must_change_password': row[5],
        'access_tasks': row[6], 'access_documents': row[7], 'access_crm': row[8],
        'is_active': row[9], 'avatar_url': row[10], 'phone': row[11], 'tfa_enabled': row[12],
    }

def yandex_token_exchange(code, redirect_uri):
    """Обменивает код авторизации на access_token Яндекса."""
    client_id = os.environ['YANDEX_CLIENT_ID']
    client_secret = os.environ['YANDEX_CLIENT_SECRET']
    data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://oauth.yandex.ru/token',
        data=data,
        method='POST',
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode('utf-8'))

def yandex_get_user(access_token):
    """Получает профиль пользователя из Яндекс ID."""
    req = urllib.request.Request(
        'https://login.yandex.ru/info?format=json',
        headers={'Authorization': f'OAuth {access_token}'},
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode('utf-8'))

def handler(event: dict, context) -> dict:
    """Яндекс OAuth для Мерошкинса: обмен кода на сессию Даббл."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    user_agent = headers.get('User-Agent') or headers.get('user-agent') or ''
    ip = ''
    try:
        ip = (event.get('requestContext', {}).get('identity', {}).get('sourceIp') or '')[:64]
    except Exception:
        pass

    # GET /?action=url — вернуть ссылку для редиректа на Яндекс
    if method == 'GET' and qs.get('action') == 'url':
        redirect_uri = qs.get('redirect_uri', '')
        client_id = os.environ['YANDEX_CLIENT_ID']
        params = urllib.parse.urlencode({
            'response_type': 'code',
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'scope': 'login:email login:info login:avatar',
            'force_confirm': 'no',
        })
        url = f'https://oauth.yandex.ru/authorize?{params}'
        return resp(200, {'url': url})

    # POST / — обменять code → токен → сессия Даббл
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        code = body.get('code', '').strip()
        redirect_uri = body.get('redirect_uri', '').strip()
        if not code or not redirect_uri:
            return resp(400, {'error': 'code и redirect_uri обязательны'})

        # Обмен кода на токен Яндекса
        try:
            token_data = yandex_token_exchange(code, redirect_uri)
        except Exception as e:
            return resp(400, {'error': f'Ошибка Яндекс OAuth: {e}'})

        access_token = token_data.get('access_token')
        if not access_token:
            return resp(400, {'error': 'Не получен access_token от Яндекса'})

        # Получаем профиль Яндекс
        try:
            ya_user = yandex_get_user(access_token)
        except Exception as e:
            return resp(400, {'error': f'Ошибка получения профиля Яндекса: {e}'})

        ya_email = (ya_user.get('default_email') or '').strip().lower()
        ya_name = ya_user.get('real_name') or ya_user.get('display_name') or ''
        ya_avatar = ya_user.get('default_avatar_id', '')
        avatar_url = f'https://avatars.yandex.net/get-yapic/{ya_avatar}/islands-200' if ya_avatar else ''

        if not ya_email:
            return resp(400, {'error': 'Яндекс не вернул email. Проверьте права приложения.'})

        conn = db()
        try:
            # Ищем пользователя по email
            with conn.cursor() as cur:
                cur.execute(f"SELECT id, is_active FROM users WHERE LOWER(email) = {esc(ya_email)} LIMIT 1")
                row = cur.fetchone()

            if row:
                user_id, is_active = row
                if not is_active:
                    return resp(403, {'error': 'Аккаунт заблокирован'})
                # Обновляем аватар если не был задан
                if avatar_url:
                    with conn.cursor() as cur:
                        cur.execute(f"UPDATE users SET avatar_url = {esc(avatar_url)} WHERE id = {user_id} AND avatar_url = ''")
                conn.commit()
            else:
                # Создаём нового пользователя автоматически
                with conn.cursor() as cur:
                    cur.execute(
                        f"INSERT INTO users (email, password_hash, full_name, role, must_change_password, is_active, avatar_url) "
                        f"VALUES ({esc(ya_email)}, '', {esc(ya_name)}, 'employee', FALSE, TRUE, {esc(avatar_url)}) RETURNING id"
                    )
                    user_id = cur.fetchone()[0]
                conn.commit()

            session_token = make_session(conn, user_id, user_agent, ip)
            user = get_user_row(conn, user_id)
            return resp(200, {'token': session_token, 'user': user})
        finally:
            conn.close()

    return resp(404, {'error': 'Не найдено'})
