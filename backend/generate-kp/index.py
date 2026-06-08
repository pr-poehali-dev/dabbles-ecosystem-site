import json
import os
import io
import base64
import uuid
from datetime import datetime
import psycopg2
import boto3
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

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

def replace_in_paragraph(para, replacements):
    """Заменяет метки {KEY} в параграфе, сохраняя форматирование первого run."""
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
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            shd = OxmlElement('w:shd')
            shd.set(qn('w:val'), 'clear')
            shd.set(qn('w:color'), 'auto')
            shd.set(qn('w:fill'), bg_color)
            tcPr.append(shd)

def format_money(val):
    try:
        f = float(val)
        return f'{f:,.2f}'.replace(',', ' ')
    except Exception:
        return str(val)

def handler(event, context):
    """Генерирует КП из .docx шаблона: подставляет данные и таблицу позиций, сохраняет в S3."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')

    conn = db()
    client = s3()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    # === ПОЛУЧИТЬ АКТИВНЫЙ ШАБЛОН (для проверки наличия) ===
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
        headers = event.get('headers') or {}
        token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
        with conn.cursor() as cur:
            safe_token = token.replace("'", "''")
            cur.execute(
                f"SELECT u.id, u.role FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id "
                f"WHERE s.token = '{safe_token}' AND s.expires_at > NOW() AND u.is_active = TRUE"
            )
            row = cur.fetchone()
        if not row or row[1] != 'admin':
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
            cur.execute(
                f"INSERT INTO {schema}.kp_templates (name, file_url, is_active) VALUES ({esc(file_name)}, {esc(cdn_url)}, TRUE)"
            )
        conn.commit()
        conn.close()
        return resp(200, {'ok': True, 'url': cdn_url})

    # === СГЕНЕРИРОВАТЬ КП ===
    if action == 'generate' and method == 'POST':
        body = json.loads(event.get('body') or '{}')
        organization = body.get('organization', '')
        director_name = body.get('director_name', '')
        items = body.get('items', [])

        if not organization or not director_name or not items:
            conn.close()
            return resp(400, {'error': 'Заполните все обязательные поля'})

        # Получаем шаблон
        with conn.cursor() as cur:
            cur.execute(f"SELECT file_url FROM {schema}.kp_templates WHERE is_active = TRUE ORDER BY id DESC LIMIT 1")
            row = cur.fetchone()
        if not row:
            conn.close()
            return resp(404, {'error': 'Шаблон КП не загружен. Обратитесь к администратору.'})

        template_url = row[0]

        # Скачиваем шаблон из S3
        # Извлекаем S3 key из CDN URL
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
        }

        # Заменяем в параграфах документа
        for para in doc.paragraphs:
            replace_in_paragraph(para, replacements)

        # Заменяем в таблицах (кроме маркерной таблицы позиций)
        TABLE_MARKER = '{ТАБЛИЦА_ПОЗИЦИЙ}'
        table_found = False
        for table in doc.tables:
            for row_t in table.rows:
                for cell in row_t.cells:
                    full = ''.join(p.text for p in cell.paragraphs)
                    if TABLE_MARKER in full:
                        table_found = True
                        break
                if table_found:
                    break
            if not table_found:
                for row_t in table.rows:
                    for cell in row_t.cells:
                        replace_in_table_cell(cell, replacements)

        # Находим маркер {ТАБЛИЦА_ПОЗИЦИЙ} в параграфах и заменяем на таблицу
        marker_para = None
        for para in doc.paragraphs:
            if TABLE_MARKER in para.text:
                marker_para = para
                break

        if marker_para:
            # Вставляем таблицу позиций перед маркерным параграфом
            from docx.oxml.ns import nsmap
            tbl = doc.add_table(rows=1, cols=6)
            tbl.style = 'Table Grid'

            # Заголовок таблицы
            headers_row = tbl.rows[0]
            header_labels = ['№', 'Наименование услуги', 'Ед. изм.', 'Кол-во', 'Цена, руб.', 'Сумма, руб.']
            for i, label in enumerate(header_labels):
                cell = headers_row.cells[i]
                para_h = cell.paragraphs[0]
                run = para_h.add_run(label)
                run.bold = True
                run.font.size = Pt(10)
                para_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
                # Фон заголовка
                tc = cell._tc
                tcPr = tc.get_or_add_tcPr()
                shd = OxmlElement('w:shd')
                shd.set(qn('w:val'), 'clear')
                shd.set(qn('w:color'), 'auto')
                shd.set(qn('w:fill'), '1a0a6e')
                tcPr.append(shd)
                run.font.color.rgb = None
                from docx.shared import RGBColor
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

            # Строки позиций
            for idx, item in enumerate(items, 1):
                name = item.get('name', '')
                unit = item.get('unit', 'шт.')
                qty = item.get('qty', 1)
                price = item.get('price', 0)
                item_total = item.get('total', float(qty) * float(price))
                row_data = [str(idx), name, unit, str(qty), format_money(price), format_money(item_total)]
                bg = 'f0f0f5' if idx % 2 == 0 else None
                add_table_row(tbl, row_data, bg_color=bg)

            # Итоговая строка
            total_row = tbl.add_row()
            for i in range(5):
                cell = total_row.cells[i]
                tc = cell._tc
                tcPr = tc.get_or_add_tcPr()
                shd = OxmlElement('w:shd')
                shd.set(qn('w:val'), 'clear')
                shd.set(qn('w:color'), 'auto')
                shd.set(qn('w:fill'), 'e8e8ef')
                tcPr.append(shd)
            total_row.cells[4].paragraphs[0].add_run('ИТОГО:').bold = True
            total_run = total_row.cells[5].paragraphs[0].add_run(format_money(total))
            total_run.bold = True
            total_run.font.size = Pt(10)
            total_row.cells[4].paragraphs[0].runs[0].font.size = Pt(10)

            # Перемещаем таблицу перед маркерным параграфом
            marker_para._element.addprevious(tbl._tbl)
            # Удаляем маркерный параграф
            marker_para._element.getparent().remove(marker_para._element)
        else:
            # Если маркер не найден — ищем таблицу с {ТАБЛИЦА_ПОЗИЦИЙ} в ячейке
            for table in doc.tables:
                for row_t in table.rows:
                    for cell in row_t.cells:
                        full = ''.join(p.text for p in cell.paragraphs)
                        if TABLE_MARKER in full:
                            # Очищаем ячейку и добавляем позиции
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

        # Также заменяем оставшиеся метки в таблицах
        for table in doc.tables:
            for row_t in table.rows:
                for cell in row_t.cells:
                    replace_in_table_cell(cell, replacements)

        # Сохраняем результат
        out_buffer = io.BytesIO()
        doc.save(out_buffer)
        out_buffer.seek(0)

        result_key = f'kp-results/{uuid.uuid4()}/КП_{organization[:30]}.docx'
        client.put_object(
            Bucket='files', Key=result_key, Body=out_buffer.read(),
            ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ContentDisposition=f'attachment; filename="KP.docx"'
        )
        result_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{result_key}"

        # Сохраняем запрос в БД
        with conn.cursor() as cur:
            items_json = json.dumps(items, ensure_ascii=False)
            cur.execute(
                f"INSERT INTO {schema}.kp_requests (organization, director_name, items, total_amount, result_url) "
                f"VALUES ({esc(organization)}, {esc(director_name)}, {esc(items_json)}::jsonb, {esc(total)}, {esc(result_url)})"
            )
        conn.commit()
        conn.close()

        return resp(200, {'ok': True, 'download_url': result_url})

    conn.close()
    return resp(404, {'error': 'Неизвестное действие'})
