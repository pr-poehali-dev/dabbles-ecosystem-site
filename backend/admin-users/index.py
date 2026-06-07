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

        # === OAUTH APPS ===
        if action == 'oauth-list' and method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, client_id, client_secret, name, description, logo_url, "
                    "redirect_uris, is_internal, is_active, created_at FROM oauth_clients ORDER BY id ASC"
                )
                rows = cur.fetchall()
            return resp(200, {'apps': [{
                'id': r[0], 'client_id': r[1], 'client_secret': r[2], 'name': r[3],
                'description': r[4], 'logo_url': r[5], 'redirect_uris': r[6],
                'is_internal': r[7], 'is_active': r[8], 'created_at': r[9],
            } for r in rows]})

        if action == 'oauth-create' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            name = (data.get('name') or '').strip()
            if not name:
                return resp(400, {'error': 'Название обязательно'})
            client_id = (data.get('client_id') or '').strip().lower().replace(' ', '-')
            if not client_id:
                client_id = 'app-' + secrets.token_urlsafe(6).lower()
            client_secret = secrets.token_urlsafe(32)
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id FROM oauth_clients WHERE client_id = {esc(client_id)}"
                )
                if cur.fetchone():
                    return resp(400, {'error': 'Такой client_id уже занят'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO oauth_clients (client_id, client_secret, name, description, "
                    f"logo_url, redirect_uris, is_internal, is_active) VALUES ("
                    f"{esc(client_id)}, {esc(client_secret)}, {esc(name)}, "
                    f"{esc(data.get('description') or '')}, {esc(data.get('logo_url') or '')}, "
                    f"{esc(data.get('redirect_uris') or '')}, FALSE, TRUE) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id, 'client_id': client_id, 'client_secret': client_secret})

        if action == 'oauth-update' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            aid = int(data.get('id') or 0)
            if not aid:
                return resp(400, {'error': 'id обязателен'})
            sets = []
            for k in ['name', 'description', 'logo_url', 'redirect_uris']:
                if k in data:
                    sets.append(f"{k} = {esc(data[k])}")
            if 'is_active' in data:
                sets.append(f"is_active = {esc(bool(data['is_active']))}")
            if not sets:
                return resp(400, {'error': 'Нет полей для обновления'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE oauth_clients SET {', '.join(sets)} WHERE id = {aid}")
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'oauth-rotate-secret' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            aid = int(data.get('id') or 0)
            if not aid:
                return resp(400, {'error': 'id обязателен'})
            new_secret = secrets.token_urlsafe(32)
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE oauth_clients SET client_secret = {esc(new_secret)} WHERE id = {aid} AND is_internal = FALSE"
                )
            conn.commit()
            return resp(200, {'client_secret': new_secret})

        # === ORG CHART ===
        if action == 'org-create' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            title = (data.get('title') or '').strip()
            if not title:
                return resp(400, {'error': 'Название обязательно'})
            pid = data.get('parent_id')
            pid_sql = esc(int(pid)) if pid not in (None, '', 'null') else 'NULL'
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO org_nodes (parent_id, title, subtitle, description, sort_order) "
                    f"VALUES ({pid_sql}, {esc(title)}, {esc(data.get('subtitle') or '')}, "
                    f"{esc(data.get('description') or '')}, {esc(int(data.get('sort_order') or 0))}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'org-update' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            nid = int(data.get('id') or 0)
            if not nid:
                return resp(400, {'error': 'id обязателен'})
            pid = data.get('parent_id')
            pid_sql = esc(int(pid)) if pid not in (None, '', 'null') else 'NULL'
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE org_nodes SET title={esc(data.get('title') or '')}, "
                    f"subtitle={esc(data.get('subtitle') or '')}, "
                    f"description={esc(data.get('description') or '')}, "
                    f"parent_id={pid_sql}, "
                    f"sort_order={esc(int(data.get('sort_order') or 0))} "
                    f"WHERE id={nid}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'org-delete' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            nid = int(data.get('id') or 0)
            if not nid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE org_nodes SET parent_id = NULL WHERE parent_id = {nid}")
                cur.execute(f"DELETE FROM org_nodes WHERE id = {nid}")
            conn.commit()
            return resp(200, {'ok': True})

        # === DIRECTOR INFO ===
        if action == 'director-info-update' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            fields = []
            for k in ['full_name', 'position', 'description', 'quote', 'quote_source', 'email', 'photo_url']:
                if k in data:
                    fields.append(f"{k} = {esc(data[k])}")
            if not fields:
                return resp(400, {'error': 'Нет полей'})
            fields.append("updated_at = NOW()")
            with conn.cursor() as cur:
                cur.execute(f"UPDATE director_info SET {', '.join(fields)}")
            conn.commit()
            return resp(200, {'ok': True})

        # === DIRECTOR BIO ===
        if action == 'director-bio-create' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO director_bio (year_label, title, body, sort_order) "
                    f"VALUES ({esc(data.get('year_label') or '')}, {esc(data.get('title') or '')}, "
                    f"{esc(data.get('body') or '')}, {esc(int(data.get('sort_order') or 0))}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'director-bio-update' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            bid = int(data.get('id') or 0)
            if not bid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE director_bio SET year_label={esc(data.get('year_label') or '')}, "
                    f"title={esc(data.get('title') or '')}, body={esc(data.get('body') or '')}, "
                    f"sort_order={esc(int(data.get('sort_order') or 0))} WHERE id={bid}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'director-bio-delete' and method == 'DELETE':
            data = json.loads(event.get('body') or '{}')
            bid = int(data.get('id') or 0)
            if not bid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM director_bio WHERE id={bid}")
            conn.commit()
            return resp(200, {'ok': True})

        # === DIRECTOR PHOTOS ===
        if action == 'director-photo-add' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            url = (data.get('url') or '').strip()
            if not url:
                return resp(400, {'error': 'url обязателен'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO director_photos (url, caption, sort_order) "
                    f"VALUES ({esc(url)}, {esc(data.get('caption') or '')}, {esc(int(data.get('sort_order') or 0))}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'director-photo-delete' and method == 'DELETE':
            data = json.loads(event.get('body') or '{}')
            pid = int(data.get('id') or 0)
            if not pid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM director_photos WHERE id={pid}")
            conn.commit()
            return resp(200, {'ok': True})

        # === DIRECTOR NEWS ===
        if action == 'director-news-create' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO director_news (title, category, date_label, image_url, link_url, sort_order) "
                    f"VALUES ({esc(data.get('title') or '')}, {esc(data.get('category') or '')}, "
                    f"{esc(data.get('date_label') or '')}, {esc(data.get('image_url') or '')}, "
                    f"{esc(data.get('link_url') or '')}, {esc(int(data.get('sort_order') or 0))}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'director-news-update' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            nid = int(data.get('id') or 0)
            if not nid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE director_news SET title={esc(data.get('title') or '')}, "
                    f"category={esc(data.get('category') or '')}, date_label={esc(data.get('date_label') or '')}, "
                    f"image_url={esc(data.get('image_url') or '')}, link_url={esc(data.get('link_url') or '')}, "
                    f"sort_order={esc(int(data.get('sort_order') or 0))} WHERE id={nid}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'director-news-delete' and method == 'DELETE':
            data = json.loads(event.get('body') or '{}')
            nid = int(data.get('id') or 0)
            if not nid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM director_news WHERE id={nid}")
            conn.commit()
            return resp(200, {'ok': True})

        # === DIRECTOR SOCIALS ===
        if action == 'director-social-update' and method == 'PUT':
            data = json.loads(event.get('body') or '{}')
            sid = int(data.get('id') or 0)
            if not sid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE director_socials SET platform={esc(data.get('platform') or '')}, "
                    f"label={esc(data.get('label') or '')}, url={esc(data.get('url') or '')}, "
                    f"sort_order={esc(int(data.get('sort_order') or 0))} WHERE id={sid}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'director-social-create' and method == 'POST':
            data = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO director_socials (platform, label, url, sort_order) "
                    f"VALUES ({esc(data.get('platform') or '')}, {esc(data.get('label') or '')}, "
                    f"{esc(data.get('url') or '')}, {esc(int(data.get('sort_order') or 0))}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'director-social-delete' and method == 'DELETE':
            data = json.loads(event.get('body') or '{}')
            sid = int(data.get('id') or 0)
            if not sid:
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM director_socials WHERE id={sid}")
            conn.commit()
            return resp(200, {'ok': True})

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