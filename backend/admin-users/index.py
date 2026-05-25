import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def sha(s: str) -> str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_admin(conn, token: str):
    if not token:
        return None
    safe = token.replace("'", "''")
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.id, u.role FROM sessions s JOIN users u ON s.user_id = u.id "
            f"WHERE s.token = '{safe}' AND s.expires_at > NOW() AND u.is_active = TRUE"
        )
        row = cur.fetchone()
    if not row or row[1] != 'admin':
        return None
    return {'id': row[0]}

def esc(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }

def row_to_user(r):
    return {
        'id': r[0], 'email': r[1], 'full_name': r[2], 'position': r[3], 'role': r[4],
        'must_change_password': r[5], 'access_tasks': r[6], 'access_documents': r[7],
        'access_crm': r[8], 'is_active': r[9], 'created_at': r[10],
    }

def handler(event, context):
    """Админ управляет сотрудниками: список, создание, обновление, сброс пароля, деактивация."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    conn = db()
    try:
        admin = get_admin(conn, token)
        if not admin:
            return resp(403, {'error': 'Доступ запрещён'})

        # === INVITES ===
        if action == 'invites' and method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT token, email, full_name, position, used, expires_at, created_at, "
                    "access_tasks, access_documents, access_crm FROM invites ORDER BY id DESC LIMIT 50"
                )
                rows = cur.fetchall()
            return resp(200, {'invites': [{
                'token': r[0], 'email': r[1], 'full_name': r[2], 'position': r[3], 'used': r[4],
                'expires_at': r[5], 'created_at': r[6],
                'access_tasks': r[7], 'access_documents': r[8], 'access_crm': r[9],
            } for r in rows]})

        if action == 'invite-create' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            email = (data.get('email') or '').strip().lower()
            if not email:
                return resp(400, {'error': 'Email обязателен'})
            inv_token = secrets.token_urlsafe(24)
            exp = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO invites (token, email, full_name, position, access_tasks, "
                    f"access_documents, access_crm, invited_by, expires_at) "
                    f"VALUES ({esc(inv_token)}, {esc(email)}, {esc(data.get('full_name') or '')}, "
                    f"{esc(data.get('position') or '')}, {esc(bool(data.get('access_tasks')))}, "
                    f"{esc(bool(data.get('access_documents')))}, {esc(bool(data.get('access_crm')))}, "
                    f"{admin['id']}, '{exp}')"
                )
            conn.commit()
            return resp(200, {'token': inv_token, 'invite_url': f"/id/invite/{inv_token}"})

        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, email, full_name, position, role, must_change_password, "
                    "access_tasks, access_documents, access_crm, is_active, created_at "
                    "FROM users ORDER BY id ASC"
                )
                rows = cur.fetchall()
            return resp(200, {'users': [row_to_user(r) for r in rows]})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            email = (body.get('email') or '').strip().lower()
            full_name = body.get('full_name') or ''
            position = body.get('position') or ''
            password = body.get('password') or 'temp1234'
            access_tasks = bool(body.get('access_tasks'))
            access_documents = bool(body.get('access_documents'))
            access_crm = bool(body.get('access_crm'))
            if not email:
                return resp(400, {'error': 'Email обязателен'})
            ph = sha(password)
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO users (email, password_hash, full_name, position, role, must_change_password, access_tasks, access_documents, access_crm, is_active) "
                    f"VALUES ({esc(email)}, {esc(ph)}, {esc(full_name)}, {esc(position)}, 'employee', TRUE, {esc(access_tasks)}, {esc(access_documents)}, {esc(access_crm)}, TRUE) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id, 'temp_password': password})

        if method == 'PUT':
            uid = int(body.get('id') or 0)
            if not uid:
                return resp(400, {'error': 'id обязателен'})
            fields = []
            for k in ['full_name', 'position']:
                if k in body:
                    fields.append(f"{k} = {esc(body[k])}")
            for k in ['access_tasks', 'access_documents', 'access_crm', 'is_active']:
                if k in body:
                    fields.append(f"{k} = {esc(bool(body[k]))}")
            if body.get('new_password'):
                fields.append(f"password_hash = {esc(sha(body['new_password']))}")
                fields.append("must_change_password = TRUE")
            if not fields:
                return resp(400, {'error': 'Нет полей для обновления'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = {uid}")
            conn.commit()
            return resp(200, {'ok': True})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()