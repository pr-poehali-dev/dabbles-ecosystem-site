import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

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

def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }

def get_admin_id(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE ORDER BY id ASC LIMIT 1")
        row = cur.fetchone()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    """Публичные данные: орг-схема и приём заявок с сайта в CRM."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')

    if action == 'org' and method == 'GET':
        conn = db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, parent_id, title, subtitle, description, sort_order "
                    "FROM org_nodes ORDER BY sort_order ASC, id ASC"
                )
                rows = cur.fetchall()
        finally:
            conn.close()
        return resp(200, {'nodes': [
            {'id': r[0], 'parent_id': r[1], 'title': r[2], 'subtitle': r[3], 'description': r[4], 'sort_order': r[5]}
            for r in rows
        ]})

    if action == 'contact' and method == 'POST':
        data = json.loads(event.get('body') or '{}')
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        phone = (data.get('phone') or '').strip()
        company = (data.get('company') or '').strip()
        message = (data.get('message') or '').strip()
        form_type = (data.get('form_type') or 'request').strip()

        if not name or not email:
            return resp(400, {'error': 'Имя и email обязательны'})

        conn = db()
        try:
            admin_id = get_admin_id(conn)
            if not admin_id:
                return resp(500, {'error': 'Конфигурация сервера'})

            notes = f"[{form_type.upper()}] {message}"
            stage = 'lead'

            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO crm_clients (user_id, name, company, email, phone, stage, notes) "
                    f"VALUES ({esc(admin_id)}, {esc(name)}, {esc(company)}, {esc(email)}, {esc(phone)}, {esc(stage)}, {esc(notes)}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
        finally:
            conn.close()
        return resp(200, {'ok': True, 'id': new_id})

    if action == 'director' and method == 'GET':
        conn = db()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT full_name, position, description, quote, quote_source, email, photo_url FROM director_info LIMIT 1")
                row = cur.fetchone()
                info = {'full_name': row[0], 'position': row[1], 'description': row[2], 'quote': row[3], 'quote_source': row[4], 'email': row[5], 'photo_url': row[6]} if row else {}
                cur.execute("SELECT id, year_label, title, body, sort_order FROM director_bio ORDER BY sort_order ASC, id ASC")
                bio = [{'id': r[0], 'year_label': r[1], 'title': r[2], 'body': r[3], 'sort_order': r[4]} for r in cur.fetchall()]
                cur.execute("SELECT id, url, caption, sort_order FROM director_photos ORDER BY sort_order ASC, id ASC")
                photos = [{'id': r[0], 'url': r[1], 'caption': r[2], 'sort_order': r[3]} for r in cur.fetchall()]
                cur.execute("SELECT id, title, category, date_label, image_url, link_url, sort_order, body FROM director_news ORDER BY sort_order ASC, id DESC")
                news = [{'id': r[0], 'title': r[1], 'category': r[2], 'date_label': r[3], 'image_url': r[4], 'link_url': r[5], 'sort_order': r[6], 'body': r[7]} for r in cur.fetchall()]
                cur.execute("SELECT id, platform, label, url, sort_order FROM director_socials ORDER BY sort_order ASC, id ASC")
                socials = [{'id': r[0], 'platform': r[1], 'label': r[2], 'url': r[3], 'sort_order': r[4]} for r in cur.fetchall()]
        finally:
            conn.close()
        return resp(200, {'info': info, 'bio': bio, 'photos': photos, 'news': news, 'socials': socials})

    return resp(404, {'error': 'Не найдено'})