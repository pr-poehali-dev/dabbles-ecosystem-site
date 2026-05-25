import json
import os
import hashlib
import secrets
import random
from datetime import datetime, timedelta, timezone
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Client-Id, X-Client-Secret',
}

def sha(s: str) -> str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def esc(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def resp(status, body, headers=None):
    h = {**CORS, 'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    return {
        'statusCode': status,
        'headers': h,
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }

def get_user_by_token(conn, token: str):
    if not token:
        return None
    safe = token.replace("'", "''")
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.id, u.email, u.full_name, u.position, u.role, u.must_change_password, "
            "u.access_tasks, u.access_documents, u.access_crm, u.is_active, u.avatar_url, u.phone, u.tfa_enabled "
            "FROM sessions s JOIN users u ON s.user_id = u.id "
            f"WHERE s.token = '{safe}' AND s.expires_at > NOW() AND u.is_active = TRUE"
        )
        row = cur.fetchone()
    if not row:
        return None
    # обновляем last_seen
    with conn.cursor() as cur:
        cur.execute(f"UPDATE sessions SET last_seen_at = NOW() WHERE token = '{safe}'")
    conn.commit()
    return {
        'id': row[0], 'email': row[1], 'full_name': row[2], 'position': row[3],
        'role': row[4], 'must_change_password': row[5],
        'access_tasks': row[6], 'access_documents': row[7], 'access_crm': row[8],
        'is_active': row[9], 'avatar_url': row[10], 'phone': row[11], 'tfa_enabled': row[12],
    }

def make_session(conn, user_id, client_id, user_agent, ip):
    token = secrets.token_hex(32)
    exp = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO sessions (token, user_id, expires_at, user_agent, ip, client_id) "
            f"VALUES ('{token}', {user_id}, '{exp}', {esc(user_agent[:500])}, {esc(ip)}, {esc(client_id)})"
        )
    conn.commit()
    return token

def handler(event, context):
    """Даббл ID: единая система авторизации с OAuth, профилем, 2FA и приглашениями."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    user_agent = headers.get('User-Agent') or headers.get('user-agent') or ''
    ip = ''
    try:
        ip = (event.get('requestContext', {}).get('identity', {}).get('sourceIp') or '')[:64]
    except Exception:
        pass

    conn = db()
    try:
        # === LOGIN: email + password → session или 2FA challenge ===
        if action == 'login' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            email = (data.get('email') or '').strip().lower()
            password = data.get('password') or ''
            client_id = data.get('client_id') or 'cabinet'
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, password_hash, is_active, tfa_enabled, email FROM users WHERE LOWER(email) = {esc(email)}"
                )
                row = cur.fetchone()
            if not row or not row[2] or row[1] != sha(password):
                return resp(401, {'error': 'Неверный email или пароль'})
            user_id = row[0]
            tfa = row[3]
            user_email = row[4]
            if tfa:
                code = f"{random.randint(0, 999999):06d}"
                exp = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
                with conn.cursor() as cur:
                    cur.execute(
                        f"INSERT INTO tfa_codes (user_id, code, purpose, expires_at) VALUES ({user_id}, {esc(code)}, 'login', '{exp}')"
                    )
                conn.commit()
                # Без реальной отправки email — возвращаем как demo (dev-режим)
                return resp(200, {
                    'tfa_required': True,
                    'user_id': user_id,
                    'email_hint': user_email[:2] + '***' + user_email.split('@')[-1] if '@' in user_email else '***',
                    'dev_code': code,
                })
            new_token = make_session(conn, user_id, client_id, user_agent, ip)
            user = get_user_by_token(conn, new_token)
            return resp(200, {'token': new_token, 'user': user})

        # === 2FA VERIFY ===
        if action == 'tfa-verify' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            user_id = int(data.get('user_id') or 0)
            code = (data.get('code') or '').strip()
            client_id = data.get('client_id') or 'cabinet'
            if not user_id or not code:
                return resp(400, {'error': 'Не указан код'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id FROM tfa_codes WHERE user_id = {user_id} AND code = {esc(code)} "
                    f"AND used = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1"
                )
                row = cur.fetchone()
            if not row:
                return resp(400, {'error': 'Код неверный или истёк'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE tfa_codes SET used = TRUE WHERE id = {row[0]}")
            conn.commit()
            new_token = make_session(conn, user_id, client_id, user_agent, ip)
            user = get_user_by_token(conn, new_token)
            return resp(200, {'token': new_token, 'user': user})

        # === ME (внутренний) ===
        if action == 'me' and method == 'GET':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            return resp(200, {'user': user})

        # === LOGOUT ===
        if action == 'logout' and method == 'POST':
            if token:
                safe = token.replace("'", "''")
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE sessions SET expires_at = NOW() WHERE token = '{safe}'")
                conn.commit()
            return resp(200, {'ok': True})

        # === UPDATE PROFILE ===
        if action == 'profile-update' and method == 'POST':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            data = json.loads(event.get('body') or '{}')
            sets = []
            for k in ['full_name', 'position', 'phone', 'avatar_url']:
                if k in data:
                    sets.append(f"{k} = {esc(data[k])}")
            if 'tfa_enabled' in data:
                sets.append(f"tfa_enabled = {esc(bool(data['tfa_enabled']))}")
            if not sets:
                return resp(400, {'error': 'Нет данных'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE users SET {', '.join(sets)} WHERE id = {user['id']}")
            conn.commit()
            return resp(200, {'ok': True})

        # === CHANGE PASSWORD ===
        if action == 'change-password' and method == 'POST':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            data = json.loads(event.get('body') or '{}')
            old_pw = data.get('old_password') or ''
            new_pw = data.get('new_password') or ''
            if len(new_pw) < 6:
                return resp(400, {'error': 'Минимум 6 символов'})
            with conn.cursor() as cur:
                cur.execute(f"SELECT password_hash FROM users WHERE id = {user['id']}")
                row = cur.fetchone()
            if not row or row[0] != sha(old_pw):
                return resp(400, {'error': 'Старый пароль неверный'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE users SET password_hash = '{sha(new_pw)}', must_change_password = FALSE WHERE id = {user['id']}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        # === SESSIONS LIST ===
        if action == 'sessions' and method == 'GET':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            current = token
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT token, user_agent, ip, client_id, last_seen_at, created_at, expires_at "
                    f"FROM sessions WHERE user_id = {user['id']} AND expires_at > NOW() ORDER BY last_seen_at DESC"
                )
                rows = cur.fetchall()
            sessions = [{
                'token_preview': r[0][:8] + '…',
                'is_current': r[0] == current,
                'user_agent': r[1], 'ip': r[2], 'client_id': r[3],
                'last_seen_at': r[4], 'created_at': r[5], 'expires_at': r[6],
                'full_token': r[0],
            } for r in rows]
            return resp(200, {'sessions': sessions})

        if action == 'session-revoke' and method == 'POST':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            data = json.loads(event.get('body') or '{}')
            t = (data.get('token') or '').replace("'", "''")
            if not t:
                return resp(400, {'error': 'Нет токена'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE sessions SET expires_at = NOW() WHERE token = '{t}' AND user_id = {user['id']}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        # === OAUTH AUTHORIZE: создаёт auth code для клиента ===
        if action == 'authorize' and method == 'POST':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            data = json.loads(event.get('body') or '{}')
            client_id = (data.get('client_id') or '').strip()
            redirect_uri = data.get('redirect_uri') or ''
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT client_id, redirect_uris, is_active, name FROM oauth_clients WHERE client_id = {esc(client_id)}"
                )
                row = cur.fetchone()
            if not row or not row[2]:
                return resp(400, {'error': 'Неизвестное приложение'})
            allowed_uris = [u.strip() for u in (row[1] or '').split(',') if u.strip()]
            if redirect_uri and allowed_uris and not any(redirect_uri.startswith(u) for u in allowed_uris):
                return resp(400, {'error': 'redirect_uri не разрешён'})
            code = secrets.token_urlsafe(32)
            exp = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO oauth_codes (code, client_id, user_id, redirect_uri, expires_at) "
                    f"VALUES ({esc(code)}, {esc(client_id)}, {user['id']}, {esc(redirect_uri)}, '{exp}')"
                )
            conn.commit()
            return resp(200, {'code': code, 'app_name': row[3]})

        # === OAUTH TOKEN: обмен code на access_token ===
        if action == 'token' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            code = data.get('code') or ''
            client_id = data.get('client_id') or ''
            client_secret = data.get('client_secret') or ''
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT client_secret, is_active FROM oauth_clients WHERE client_id = {esc(client_id)}"
                )
                cli = cur.fetchone()
            if not cli or not cli[1] or cli[0] != client_secret:
                return resp(401, {'error': 'Неверный client_id / client_secret'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT user_id, used, expires_at FROM oauth_codes "
                    f"WHERE code = {esc(code)} AND client_id = {esc(client_id)}"
                )
                row = cur.fetchone()
            if not row or row[1]:
                return resp(400, {'error': 'Код неверный или уже использован'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE oauth_codes SET used = TRUE WHERE code = {esc(code)}")
            conn.commit()
            new_token = make_session(conn, row[0], client_id, user_agent, ip)
            return resp(200, {'access_token': new_token, 'token_type': 'Bearer'})

        # === OAUTH USERINFO: внешний публичный endpoint ===
        if action == 'userinfo' and method == 'GET':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            return resp(200, {
                'sub': str(user['id']),
                'email': user['email'],
                'name': user['full_name'],
                'position': user['position'],
                'picture': user['avatar_url'],
                'phone': user['phone'],
                'role': user['role'],
            })

        # === INVITE INFO (просмотр приглашения) ===
        if action == 'invite-info' and method == 'GET':
            inv_token = qs.get('token') or ''
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT email, full_name, position, used, expires_at FROM invites WHERE token = {esc(inv_token)}"
                )
                row = cur.fetchone()
            if not row:
                return resp(404, {'error': 'Приглашение не найдено'})
            if row[3]:
                return resp(400, {'error': 'Приглашение уже использовано'})
            return resp(200, {'email': row[0], 'full_name': row[1], 'position': row[2]})

        # === INVITE ACCEPT (сотрудник задаёт пароль) ===
        if action == 'invite-accept' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            inv_token = data.get('token') or ''
            password = data.get('password') or ''
            full_name = data.get('full_name') or ''
            if len(password) < 6:
                return resp(400, {'error': 'Минимум 6 символов в пароле'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT email, full_name, position, access_tasks, access_documents, access_crm, used, expires_at "
                    f"FROM invites WHERE token = {esc(inv_token)} AND used = FALSE AND expires_at > NOW()"
                )
                inv = cur.fetchone()
            if not inv:
                return resp(400, {'error': 'Приглашение недействительно или истекло'})
            email = inv[0].lower()
            ph = sha(password)
            name = full_name or inv[1]
            with conn.cursor() as cur:
                cur.execute(f"SELECT id FROM users WHERE LOWER(email) = {esc(email)}")
                existing = cur.fetchone()
            if existing:
                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE users SET password_hash = {esc(ph)}, full_name = {esc(name)}, "
                        f"position = {esc(inv[2])}, access_tasks = {esc(bool(inv[3]))}, "
                        f"access_documents = {esc(bool(inv[4]))}, access_crm = {esc(bool(inv[5]))}, "
                        f"must_change_password = FALSE, is_active = TRUE WHERE id = {existing[0]}"
                    )
                    user_id = existing[0]
            else:
                with conn.cursor() as cur:
                    cur.execute(
                        f"INSERT INTO users (email, password_hash, full_name, position, role, must_change_password, "
                        f"access_tasks, access_documents, access_crm, is_active) "
                        f"VALUES ({esc(email)}, {esc(ph)}, {esc(name)}, {esc(inv[2])}, 'employee', FALSE, "
                        f"{esc(bool(inv[3]))}, {esc(bool(inv[4]))}, {esc(bool(inv[5]))}, TRUE) RETURNING id"
                    )
                    user_id = cur.fetchone()[0]
            with conn.cursor() as cur:
                cur.execute(f"UPDATE invites SET used = TRUE WHERE token = {esc(inv_token)}")
            conn.commit()
            new_token = make_session(conn, user_id, 'cabinet', user_agent, ip)
            user = get_user_by_token(conn, new_token)
            return resp(200, {'token': new_token, 'user': user})

        # === LIST OAUTH CLIENTS (публично, для красивого UI) ===
        if action == 'client-info' and method == 'GET':
            client_id = qs.get('client_id') or ''
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT name, description, logo_url, is_internal FROM oauth_clients "
                    f"WHERE client_id = {esc(client_id)} AND is_active = TRUE"
                )
                row = cur.fetchone()
            if not row:
                return resp(404, {'error': 'Клиент не найден'})
            return resp(200, {
                'name': row[0], 'description': row[1], 'logo_url': row[2], 'is_internal': row[3],
            })

        return resp(404, {'error': 'Неизвестное действие: ' + action})
    finally:
        conn.close()
