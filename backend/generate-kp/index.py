# v6 — Documentero
import json
import os
import uuid
import urllib.request
import urllib.error
from datetime import datetime
import psycopg2
import boto3
import base64

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

DOCUMENTERO_URL = 'https://app.documentero.com/api/generate'
DOCUMENTERO_DOC = 'Waf2OyofsXSAuT9rmhQR'
DOCUMENTERO_KEY = '6QFVLII-Q4RUPRI-VPG6POI-LYMP27I'


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def esc(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def get_admin(conn, token, schema):
    if not token:
        return None
    safe = token.replace("'", "''")
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.role FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id "
            f"WHERE s.token = '{safe}' AND s.expires_at > NOW() AND u.is_active = TRUE"
        )
        row = cur.fetchone()
    if not row or row[1] != 'admin':
        return None
    return {'id': row[0]}


def format_money(val):
    try:
        f = float(val)
        return '{:,.2f}'.format(f).replace(',', ' ').replace('.', ',')
    except Exception:
        return str(val)


def check_stopwords(text, stopwords):
    text_lower = text.lower()
    for sw in stopwords:
        if sw.lower() in text_lower:
            return sw
    return None


def call_documentero(data: dict) -> str:
    """Отправляет запрос в Documentero, возвращает URL готового PDF."""
    payload = {
        'document': DOCUMENTERO_DOC,
        'apiKey': DOCUMENTERO_KEY,
        'format': 'pdf',
        'data': data,
    }
    body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        DOCUMENTERO_URL,
        data=body,
        method='POST',
        headers={'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        result = json.loads(r.read().decode('utf-8'))

    if result.get('status') != 200:
        raise RuntimeError(f"Documentero error: {result}")

    pdf_url = result.get('data', '')
    if not pdf_url:
        raise RuntimeError('Documentero: пустой URL в ответе')
    return pdf_url


def download_and_store(pdf_url: str, safe_org: str, client) -> str:
    """Скачивает PDF по ссылке и кладёт в S3, возвращает CDN URL."""
    req = urllib.request.Request(pdf_url)
    with urllib.request.urlopen(req, timeout=60) as r:
        pdf_bytes = r.read()

    result_key = f'kp-results/{uuid.uuid4()}/KP_{safe_org}.pdf'
    client.put_object(
        Bucket='files',
        Key=result_key,
        Body=pdf_bytes,
        ContentType='application/pdf',
        ContentDisposition='attachment; filename="KP.pdf"',
    )
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{result_key}"
    return cdn_url


def handler(event, context):
    """Генерирует КП (PDF) через Documentero с проверкой стоп-слов и автонумерацией."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    headers_in = event.get('headers') or {}
    token = headers_in.get('X-Auth-Token') or headers_in.get('x-auth-token') or ''

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = db()

    # === STOPWORDS ===
    if action == 'stopwords':
        if method == 'GET':
            is_admin = get_admin(conn, token, schema)
            with conn.cursor() as cur:
                cur.execute(f"SELECT id, word, created_at FROM {schema}.kp_stopwords ORDER BY id DESC")
                rows = cur.fetchall()
            conn.close()
            words = [{'id': r[0], 'word': r[1], 'created_at': r[2]} for r in rows]
            if is_admin:
                return resp(200, {'words': words})
            return resp(200, {'words': [w['word'] for w in words]})
        if method == 'POST':
            if not get_admin(conn, token, schema):
                conn.close()
                return resp(403, {'error': 'Доступ запрещён'})
            body = json.loads(event.get('body') or '{}')
            word = (body.get('word') or '').strip()
            if not word:
                conn.close()
                return resp(400, {'error': 'Слово не передано'})
            with conn.cursor() as cur:
                cur.execute(f"INSERT INTO {schema}.kp_stopwords (word) VALUES ({esc(word)}) ON CONFLICT (word) DO NOTHING")
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})
        if method == 'DELETE':
            if not get_admin(conn, token, schema):
                conn.close()
                return resp(403, {'error': 'Доступ запрещён'})
            body = json.loads(event.get('body') or '{}')
            wid = int(body.get('id') or 0)
            if not wid:
                conn.close()
                return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {schema}.kp_stopwords WHERE id={wid}")
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})

    # === GET KP HISTORY (admin) ===
    if action == 'history' and method == 'GET':
        if not get_admin(conn, token, schema):
            conn.close()
            return resp(403, {'error': 'Доступ запрещён'})
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, organization, director_name, total_amount, doc_number, result_url, created_at "
                f"FROM {schema}.kp_requests ORDER BY id DESC LIMIT 50"
            )
            rows = cur.fetchall()
        conn.close()
        keys = ['id', 'organization', 'director_name', 'total_amount', 'doc_number', 'result_url', 'created_at']
        return resp(200, {'items': [dict(zip(keys, r)) for r in rows]})

    # === GENERATE KP ===
    if action == 'generate' and method == 'POST':
        body_raw = json.loads(event.get('body') or '{}')
        organization = body_raw.get('organization', '').strip()
        director_name = body_raw.get('director_name', '').strip()
        items = body_raw.get('items', [])

        if not organization or not director_name or not items:
            conn.close()
            return resp(400, {'error': 'Заполните все обязательные поля'})

        # Проверка стоп-слов
        with conn.cursor() as cur:
            cur.execute(f"SELECT word FROM {schema}.kp_stopwords")
            stopwords = [r[0] for r in cur.fetchall()]

        check_text = organization + ' ' + director_name + ' ' + ' '.join(it.get('name', '') for it in items)
        if check_stopwords(check_text, stopwords):
            conn.close()
            return resp(403, {'error': 'DENIED', 'code': 'stopword_match'})

        # Автонумерация
        with conn.cursor() as cur:
            cur.execute(f"SELECT nextval('{schema}.kp_doc_seq')")
            seq_num = cur.fetchone()[0]
        doc_number = f"89-101/{datetime.now().year}-{seq_num}"

        total = sum(float(it.get('total', 0) or 0) for it in items)

        # Формируем таблицу позиций как массив объектов (секция Documentero)
        table_rows = []
        for idx, it in enumerate(items, 1):
            qty = it.get('qty', 1)
            price = it.get('price', 0)
            it_total = it.get('total', float(qty) * float(price))
            table_rows.append({
                'num':   str(idx),
                'name':  it.get('name', ''),
                'unit':  it.get('unit', 'шт.'),
                'qty':   str(qty),
                'price': format_money(price),
                'total': format_money(it_total),
            })

        # Данные для Documentero.
        # Секция с таблицей — ключ "items", поля: num, name, unit, qty, price, total.
        # В шаблоне строка таблицы должна содержать: {#items.num}, {#items.name} и т.д.
        doc_data = {
            'ОРГАНИЗАЦИЯ': organization,
            'ФИО_руководителя': director_name,
            'ДАТА': datetime.now().strftime('%d.%m.%Y'),
            'НОМЕР_ДОКУМЕНТА': doc_number,
            'ИТОГО': format_money(total) + ' руб.',
            'items': table_rows,
        }
        print(f'Documentero payload keys: {list(doc_data.keys())}, rows: {len(table_rows)}, first row: {table_rows[0] if table_rows else None}')

        try:
            pdf_url = call_documentero(doc_data)
        except Exception as e:
            conn.close()
            print(f'Documentero error: {e}')
            return resp(502, {'error': f'Ошибка генерации документа: {str(e)}'})

        # Скачиваем и сохраняем в S3
        client = s3_client()
        safe_org = organization[:30].replace('/', '-').replace('"', '')
        try:
            result_url = download_and_store(pdf_url, safe_org, client)
        except Exception:
            # Если не удалось скачать — отдаём прямую ссылку Documentero
            result_url = pdf_url

        # Сохраняем в БД
        with conn.cursor() as cur:
            items_json = json.dumps(items, ensure_ascii=False)
            cur.execute(
                f"INSERT INTO {schema}.kp_requests (organization, director_name, items, total_amount, result_url, doc_number) "
                f"VALUES ({esc(organization)}, {esc(director_name)}, {esc(items_json)}::jsonb, "
                f"{esc(total)}, {esc(result_url)}, {esc(doc_number)})"
            )
        conn.commit()
        conn.close()

        return resp(200, {'ok': True, 'download_url': result_url, 'doc_number': doc_number})

    conn.close()
    return resp(404, {'error': 'Неизвестное действие'})