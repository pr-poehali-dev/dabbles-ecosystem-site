import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def sha(s: str) -> str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_by_token(conn, token: str):
    if not token:
        return None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.id, u.email, u.full_name, u.position, u.role, u.must_change_password, u.access_tasks, u.access_documents, u.access_crm, u.is_active "
            "FROM sessions s JOIN users u ON s.user_id = u.id "
            f"WHERE s.token = '{token}' AND s.expires_at > NOW() AND u.is_active = TRUE"
        )
        row = cur.fetchone()
    if not row:
        return None
    return {
        'id': row[0], 'email': row[1], 'full_name': row[2], 'position': row[3],
        'role': row[4], 'must_change_password': row[5],
        'access_tasks': row[6], 'access_documents': row[7], 'access_crm': row[8],
        'is_active': row[9],
    }

def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }

def handler(event, context):
    """Аутентификация: вход, выход, текущий пользователь, смена пароля."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    path = (event.get('queryStringParameters') or {}).get('action', '')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''

    conn = db()
    try:
        if path == 'login' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            email = (data.get('email') or '').strip().lower().replace("'", "''")
            password = data.get('password') or ''
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, password_hash, is_active FROM users WHERE LOWER(email) = '{email}'"
                )
                row = cur.fetchone()
            if not row or not row[2] or row[1] != sha(password):
                return resp(401, {'error': 'Неверный email или пароль'})
            new_token = secrets.token_hex(32)
            exp = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO sessions (token, user_id, expires_at) VALUES ('{new_token}', {row[0]}, '{exp}')"
                )
            conn.commit()
            user = get_user_by_token(conn, new_token)
            return resp(200, {'token': new_token, 'user': user})

        if path == 'me' and method == 'GET':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Не авторизован'})
            return resp(200, {'user': user})

        if path == 'logout' and method == 'POST':
            if token:
                safe = token.replace("'", "''")
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE sessions SET expires_at = NOW() WHERE token = '{safe}'")
                conn.commit()
            return resp(200, {'ok': True})

        if path == 'change-password' and method == 'POST':
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
            new_hash = sha(new_pw)
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE users SET password_hash = '{new_hash}', must_change_password = FALSE WHERE id = {user['id']}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Неизвестное действие'})
    finally:
        conn.close()
