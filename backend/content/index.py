import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

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

SCHEMAS = {
    'hero': {
        'table': 'hero_slides',
        'fields': ['title', 'subtitle', 'image_url', 'bg_gradient', 'accent_color', 'sort_order', 'is_active'],
        'bools': ['is_active'],
        'ints': ['sort_order'],
    },
    'news': {
        'table': 'news_cards',
        'fields': ['title', 'tag', 'tag_icon', 'image_url', 'image_position', 'bg_color', 'is_light', 'sort_order', 'is_active'],
        'bools': ['is_light', 'is_active'],
        'ints': ['sort_order'],
    },
    'blog': {
        'table': 'blog_posts',
        'fields': ['title', 'excerpt', 'body', 'tag', 'color', 'published_at', 'is_published', 'sort_order'],
        'bools': ['is_published'],
        'ints': ['sort_order'],
    },
}

def row_dict(cur, row):
    cols = [c.name for c in cur.description]
    return {col: val for col, val in zip(cols, row)}

def handler(event, context):
    """Контент сайта: hero-слайды, карточки 'Что нового', статьи блога. GET публично, мутации только админ."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    kind = qs.get('kind', '')
    if kind not in SCHEMAS:
        return resp(400, {'error': 'kind должен быть hero, news или blog'})
    schema = SCHEMAS[kind]
    table = schema['table']

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''

    conn = db()
    try:
        if method == 'GET':
            show_all = qs.get('all') == '1'
            with conn.cursor() as cur:
                if kind == 'blog':
                    where = '' if show_all else 'WHERE is_published = TRUE'
                    cur.execute(f"SELECT * FROM {table} {where} ORDER BY sort_order ASC, id ASC")
                else:
                    where = '' if show_all else 'WHERE is_active = TRUE'
                    cur.execute(f"SELECT * FROM {table} {where} ORDER BY sort_order ASC, id ASC")
                items = [row_dict(cur, r) for r in cur.fetchall()]
            return resp(200, {'items': items})

        admin = get_admin(conn, token)
        if not admin:
            return resp(403, {'error': 'Только для админа'})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            cols, vals = [], []
            for f in schema['fields']:
                if f in body:
                    cols.append(f)
                    if f in schema['bools']:
                        vals.append(esc(bool(body[f])))
                    elif f in schema['ints']:
                        vals.append(esc(int(body[f])))
                    else:
                        vals.append(esc(body[f]))
            if not cols:
                return resp(400, {'error': 'Нет полей'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if method == 'PUT':
            iid = int(body.get('id') or 0)
            if not iid:
                return resp(400, {'error': 'id обязателен'})
            sets = []
            for f in schema['fields']:
                if f in body:
                    if f in schema['bools']:
                        sets.append(f"{f} = {esc(bool(body[f]))}")
                    elif f in schema['ints']:
                        sets.append(f"{f} = {esc(int(body[f]))}")
                    else:
                        sets.append(f"{f} = {esc(body[f])}")
            sets.append("updated_at = NOW()")
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {table} SET {', '.join(sets)} WHERE id = {iid}")
            conn.commit()
            return resp(200, {'ok': True})

        if method == 'DELETE':
            iid = int(qs.get('id') or 0)
            if not iid:
                return resp(400, {'error': 'id обязателен'})
            # Деактивация вместо удаления для совместимости с правилами БД
            if kind == 'blog':
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE {table} SET is_published = FALSE, updated_at = NOW() WHERE id = {iid}")
            else:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE {table} SET is_active = FALSE, updated_at = NOW() WHERE id = {iid}")
            conn.commit()
            return resp(200, {'ok': True})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()
