import json
import os
import io
import base64
import uuid
from datetime import datetime
import psycopg2
import boto3
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def s3():
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

def replace_in_paragraph(para, replacements):
    full_text = ''.join(r.text for r in para.runs)
    new_text = full_text
    for key, val in replacements.items():
        new_text = new_text.replace('{' + key + '}', str(val))
    if new_text != full_text and para.runs:
        para.runs[0].text = new_text
        for r in para.runs[1:]:
            r.text = ''

def replace_in_table_cell(cell, replacements):
    for para in cell.paragraphs:
        replace_in_paragraph(para, replacements)

def set_cell_bg(cell, color_hex):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def add_table_row(table, cells_data, bold=False, bg_color=None):
    row = table.add_row()
    for i, text in enumerate(cells_data):
        cell = row.cells[i]
        para = cell.paragraphs[0]
        run = para.add_run(str(text))
        run.font.size = Pt(10)
        if bold:
            run.bold = True
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER if i > 0 else WD_ALIGN_PARAGRAPH.LEFT
        if bg_color:
            set_cell_bg(cell, bg_color)

def format_money(val):
    try:
        f = float(val)
        return f'{f:,.2f}'.replace(',', ' ')
    except Exception:
        return str(val)

def check_stopwords(text, stopwords):
    """Проверяет наличие стоп-слов (без учёта регистра). Возвращает найденное слово или None."""
    text_lower = text.lower()
    for sw in stopwords:
        if sw.lower() in text_lower:
            return sw
    return None

def handler(event, context):
    """Генерирует КП из .docx шаблона с проверкой стоп-слов и автонумерацией документов."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    headers_in = event.get('headers') or {}
    token = headers_in.get('X-Auth-Token') or headers_in.get('x-auth-token') or ''

    conn = db()
    client = s3()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    # === ПОЛУЧИТЬ АКТИВНЫЙ ШАБЛОН ===
    if action == 'get-template' and method == 'GET':
        with conn.cursor() as cur:
            cur.execute(f"SELECT id, name, file_url, uploaded_at FROM {schema}.kp_templates WHERE is_active = TRUE ORDER BY id DESC LIMIT 1")
            row = cur.fetchone()
        conn.close()
        if not row:
            return resp(404, {'error': 'Шаблон не загружен'})
        return resp(200, {'id': row[0], 'name': row[1], 'file_url': row[2], 'uploaded_at': row[3]})

    # === ЗАГРУЗИТЬ ШАБЛОН (admin) ===
    if action == 'upload-template' and method == 'POST':
        if not get_admin(conn, token, schema):
            conn.close()
            return resp(403, {'error': 'Доступ запрещён'})

        body = json.loads(event.get('body') or '{}')
        file_b64 = body.get('file_base64', '')
        file_name = body.get('file_name', 'template.docx')
        if not file_b64:
            conn.close()
            return resp(400, {'error': 'Файл не передан'})

        file_bytes = base64.b64decode(file_b64)
        key = f'kp-templates/{uuid.uuid4()}/{file_name}'
        client.put_object(
            Bucket='files', Key=key, Body=file_bytes,
            ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

        with conn.cursor() as cur:
            cur.execute(f"UPDATE {schema}.kp_templates SET is_active = FALSE")
            cur.execute(f"INSERT INTO {schema}.kp_templates (name, file_url, is_active) VALUES ({esc(file_name)}, {esc(cdn_url)}, TRUE)")
        conn.commit()
        conn.close()
        return resp(200, {'ok': True, 'url': cdn_url})

    # === УПРАВЛЕНИЕ СТОП-СЛОВАМИ (admin) ===
    if action == 'stopwords':
        if method == 'GET':
            # Все пользователи могут читать (для валидации), но вернём только список без ID для публичного
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
                cur.execute(f"DELETE FROM {schema}.kp_stopwords WHERE id = {wid}")
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})

    # === СГЕНЕРИРОВАТЬ КП ===
    if action == 'generate' and method == 'POST':
        body = json.loads(event.get('body') or '{}')
        organization = body.get('organization', '')
        director_name = body.get('director_name', '')
        items = body.get('items', [])

        if not organization or not director_name or not items:
            conn.close()
            return resp(400, {'error': 'Заполните все обязательные поля'})

        # Загружаем стоп-слова
        with conn.cursor() as cur:
            cur.execute(f"SELECT word FROM {schema}.kp_stopwords")
            stopwords = [r[0] for r in cur.fetchall()]

        # Проверяем все текстовые поля на стоп-слова
        check_text = f"{organization} {director_name} " + " ".join(
            it.get('name', '') for it in items
        )
        found = check_stopwords(check_text, stopwords)
        if found:
            conn.close()
            return resp(403, {
                'error': 'Отказ в предоставлении КП',
                'reason': f'В данных обнаружено ключевое слово, по которому предоставление коммерческого предложения невозможно.'
            })

        # Получаем шаблон
        with conn.cursor() as cur:
            cur.execute(f"SELECT file_url FROM {schema}.kp_templates WHERE is_active = TRUE ORDER BY id DESC LIMIT 1")
            row = cur.fetchone()
        if not row:
            conn.close()
            return resp(404, {'error': 'Шаблон КП не загружен. Обратитесь к администратору.'})

        template_url = row[0]

        # Генерируем номер документа: 89-101/2026-{seq}
        with conn.cursor() as cur:
            cur.execute(f"SELECT nextval('{schema}.kp_doc_seq')")
            seq_num = cur.fetchone()[0]
        doc_number = f"89-101/{datetime.now().year}-{seq_num}"

        # Скачиваем шаблон из S3
        prefix = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/"
        s3_key = template_url.replace(prefix, '')
        obj = client.get_object(Bucket='files', Key=s3_key)
        template_bytes = obj['Body'].read()

        doc = Document(io.BytesIO(template_bytes))

        # Вычисляем итог
        total = sum(float(it.get('total', 0) or 0) for it in items)

        # Словарь замен
        today = datetime.now()
        replacements = {
            'ОРГАНИЗАЦИЯ': organization,
            'organization': organization,
            'ФИО_руководителя': director_name,
            'director_name': director_name,
            'ДАТА': today.strftime('%d.%m.%Y'),
            'date': today.strftime('%d.%m.%Y'),
            'ИТОГО': format_money(total),
            'total': format_money(total),
            'НОМЕР_ДОКУМЕНТА': doc_number,
            'doc_number': doc_number,
            'НОМ': doc_number,
        }

        # Заменяем в параграфах
        for para in doc.paragraphs:
            replace_in_paragraph(para, replacements)

        # Обрабатываем таблицы — ищем маркер ТАБЛИЦА_ПОЗИЦИЙ
        TABLE_MARKER = '{ТАБЛИЦА_ПОЗИЦИЙ}'

        def build_items_table(doc):
            tbl = doc.add_table(rows=1, cols=6)
            tbl.style = 'Table Grid'
            headers_row = tbl.rows[0]
            header_labels = ['№', 'Наименование услуги', 'Ед. изм.', 'Кол-во', 'Цена, руб.', 'Сумма, руб.']
            for i, label in enumerate(header_labels):
                cell = headers_row.cells[i]
                para_h = cell.paragraphs[0]
                run = para_h.add_run(label)
                run.bold = True
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                para_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
                set_cell_bg(cell, '1a0a6e')

            for idx, item in enumerate(items, 1):
                name = item.get('name', '')
                unit = item.get('unit', 'шт.')
                qty = item.get('qty', 1)
                price = item.get('price', 0)
                item_total = item.get('total', float(qty) * float(price))
                row_data = [str(idx), name, unit, str(qty), format_money(price), format_money(item_total)]
                add_table_row(tbl, row_data, bg_color=('f0f0f5' if idx % 2 == 0 else None))

            # Итоговая строка
            total_row = tbl.add_row()
            for i in range(6):
                set_cell_bg(total_row.cells[i], 'e8e8ef')
            r4 = total_row.cells[4].paragraphs[0].add_run('ИТОГО:')
            r4.bold = True
            r4.font.size = Pt(10)
            r5 = total_row.cells[5].paragraphs[0].add_run(format_money(total))
            r5.bold = True
            r5.font.size = Pt(10)
            return tbl

        # Ищем маркер в параграфах
        marker_para = None
        for para in doc.paragraphs:
            if TABLE_MARKER in para.text:
                marker_para = para
                break

        if marker_para:
            tbl = build_items_table(doc)
            marker_para._element.addprevious(tbl._tbl)
            marker_para._element.getparent().remove(marker_para._element)
        else:
            # Ищем в ячейках таблицы
            for table in doc.tables:
                for row_t in table.rows:
                    for cell in row_t.cells:
                        full = ''.join(p.text for p in cell.paragraphs)
                        if TABLE_MARKER in full:
                            for p in cell.paragraphs:
                                p.clear()
                            for idx, item in enumerate(items, 1):
                                name = item.get('name', '')
                                unit = item.get('unit', 'шт.')
                                qty = item.get('qty', 1)
                                price = item.get('price', 0)
                                item_total = item.get('total', float(qty) * float(price))
                                p = cell.add_paragraph()
                                p.add_run(f"{idx}. {name} — {qty} {unit} × {format_money(price)} = {format_money(item_total)} руб.")

        # Заменяем оставшиеся метки во всех таблицах
        for table in doc.tables:
            for row_t in table.rows:
                for cell in row_t.cells:
                    replace_in_table_cell(cell, replacements)

        # Сохраняем результат
        out_buffer = io.BytesIO()
        doc.save(out_buffer)
        out_buffer.seek(0)

        safe_org = organization[:30].replace('/', '-').replace('"', '')
        result_key = f'kp-results/{uuid.uuid4()}/КП_{safe_org}.docx'
        client.put_object(
            Bucket='files', Key=result_key, Body=out_buffer.read(),
            ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ContentDisposition='attachment; filename="KP.docx"'
        )
        result_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{result_key}"

        # Сохраняем запрос в БД
        with conn.cursor() as cur:
            items_json = json.dumps(items, ensure_ascii=False)
            cur.execute(
                f"INSERT INTO {schema}.kp_requests (organization, director_name, items, total_amount, result_url, doc_number) "
                f"VALUES ({esc(organization)}, {esc(director_name)}, {esc(items_json)}::jsonb, {esc(total)}, {esc(result_url)}, {esc(doc_number)})"
            )
        conn.commit()
        conn.close()

        return resp(200, {'ok': True, 'download_url': result_url, 'doc_number': doc_number})

    conn.close()
    return resp(404, {'error': 'Неизвестное действие'})
