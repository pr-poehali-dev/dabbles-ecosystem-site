import json, os, base64, uuid
import psycopg2
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
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


def get_admin(conn, event):
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()
    if not token: return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.role FROM sessions s JOIN users u ON u.id = s.user_id "
            f"WHERE s.token = {esc(token)} AND s.expires_at > NOW() AND u.is_active = TRUE LIMIT 1"
        )
        row = cur.fetchone()
    if not row or row[1] not in ('admin', 'manager'): return None
    return {'id': row[0]}


def row_dict(cur, row):
    cols = [c.name for c in cur.description]
    return {col: val for col, val in zip(cols, row)}


def s3_client():
    return boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def handler(event: dict, context) -> dict:
    """Интернет-магазин мерча ВАЙБ: каталог товаров (публично), заказы, админка товаров."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    conn = db()

    try:
        # ══════════════════════════════════════════════════════
        # ПУБЛИЧНО: КАТАЛОГ
        # ══════════════════════════════════════════════════════

        if action == 'products' and method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, description, price, old_price, image_url, category, sizes, sort_order "
                    "FROM vibe_products WHERE is_active = TRUE ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'products': [{
                'id': r[0], 'name': r[1], 'description': r[2], 'price': r[3], 'old_price': r[4],
                'image_url': r[5], 'category': r[6], 'sizes': r[7].split(','), 'sort_order': r[8],
            } for r in rows]})

        # ══════════════════════════════════════════════════════
        # ПУБЛИЧНО: ОФОРМЛЕНИЕ ЗАКАЗА
        # ══════════════════════════════════════════════════════

        if action == 'order' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            customer_name = (body.get('customer_name') or '').strip()
            phone = (body.get('phone') or '').strip()
            address = (body.get('address') or '').strip()
            comment = (body.get('comment') or '').strip()
            items = body.get('items') or []
            total = int(body.get('total') or 0)
            if not customer_name or not phone or not items:
                return resp(400, {'error': 'Заполните имя, телефон и добавьте товары'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO vibe_orders (customer_name, phone, address, comment, items, total) "
                    f"VALUES ({esc(customer_name)}, {esc(phone)}, {esc(address)}, {esc(comment)}, "
                    f"{esc(json.dumps(items, ensure_ascii=False))}::jsonb, {esc(total)}) RETURNING id"
                )
                order_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': order_id})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ТОВАРЫ
        # ══════════════════════════════════════════════════════

        if action == 'admin-products' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, description, price, old_price, image_url, category, sizes, sort_order, is_active "
                    "FROM vibe_products ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'products': [{
                'id': r[0], 'name': r[1], 'description': r[2], 'price': r[3], 'old_price': r[4],
                'image_url': r[5], 'category': r[6], 'sizes': r[7], 'sort_order': r[8], 'is_active': r[9],
            } for r in rows]})

        if action == 'admin-product-save' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            pid = body.get('id')
            fields = {
                'name': body.get('name', ''), 'description': body.get('description', ''),
                'price': int(body.get('price', 0)),
                'old_price': int(body['old_price']) if body.get('old_price') not in (None, '') else None,
                'image_url': body.get('image_url', ''), 'category': body.get('category', 'Футболки'),
                'sizes': body.get('sizes', 'S,M,L,XL'), 'sort_order': int(body.get('sort_order', 0)),
                'is_active': bool(body.get('is_active', True)),
            }
            with conn.cursor() as cur:
                if pid:
                    sets = ', '.join(f"{k} = {esc(v)}" for k, v in fields.items())
                    cur.execute(f"UPDATE vibe_products SET {sets} WHERE id = {esc(int(pid))}")
                    new_id = int(pid)
                else:
                    cols = ', '.join(fields.keys())
                    vals = ', '.join(esc(v) for v in fields.values())
                    cur.execute(f"INSERT INTO vibe_products ({cols}) VALUES ({vals}) RETURNING id")
                    new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'admin-product-delete' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            pid = int(body.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM vibe_products WHERE id = {esc(pid)}")
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ЗАКАЗЫ
        # ══════════════════════════════════════════════════════

        if action == 'admin-orders' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, customer_name, phone, address, comment, items, total, status, created_at "
                    "FROM vibe_orders ORDER BY created_at DESC LIMIT 200"
                )
                rows = cur.fetchall()
            return resp(200, {'orders': [{
                'id': r[0], 'customer_name': r[1], 'phone': r[2], 'address': r[3], 'comment': r[4],
                'items': r[5], 'total': r[6], 'status': r[7], 'created_at': str(r[8]),
            } for r in rows]})

        if action == 'admin-order-status' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            oid = int(body.get('id', 0))
            status = body.get('status', 'new')
            with conn.cursor() as cur:
                cur.execute(f"UPDATE vibe_orders SET status = {esc(status)} WHERE id = {esc(oid)}")
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # ЗАГРУЗКА ФАЙЛОВ (S3)
        # ══════════════════════════════════════════════════════

        if action == 'upload' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(403, {'error': 'Только для админа'})
            data = json.loads(event.get('body') or '{}')
            file_b64 = data.get('file') or ''
            ext = (data.get('ext') or 'jpg').lower().strip('.')
            content_types = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}
            ct = content_types.get(ext, 'image/jpeg')
            file_bytes = base64.b64decode(file_b64)
            key = f"vibe/products/{uuid.uuid4()}.{ext}"
            s3 = s3_client()
            s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=ct)
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            return resp(200, {'url': cdn_url})

        return resp(404, {'error': 'Неизвестное действие'})
    finally:
        conn.close()
