import json, os, secrets, base64, mimetypes
import psycopg2
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token',
}

STATUS_LABELS = {
    'draft': 'Черновик',
    'pending': 'На рассмотрении',
    'review': 'На согласовании',
    'approved': 'Утверждён',
    'rejected': 'Отклонён',
    'archive': 'В архиве',
}

DOC_TYPE_LABELS = {
    'incoming': 'Входящий',
    'outgoing': 'Исходящий',
    'internal': 'Внутренний',
    'order': 'Приказ',
    'contract': 'Договор',
    'act': 'Акт',
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
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }

def get_user(conn, event):
    headers = event.get('headers') or {}
    raw = (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()
    if not raw: return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.email, u.full_name, u.role, u.position, u.avatar_url "
            f"FROM sessions s JOIN users u ON u.id = s.user_id "
            f"WHERE s.token = {esc(raw)} AND s.expires_at > NOW() AND u.is_active = TRUE LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    return {'id': row[0], 'email': row[1], 'full_name': row[2], 'role': row[3],
            'position': row[4], 'avatar_url': row[5]}

def get_doc(conn, doc_id, user_id):
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT d.id, d.title, d.doc_number, d.doc_type, d.status, d.content, "
            f"d.file_url, d.file_name, d.file_size, d.from_org, d.to_org, "
            f"d.due_date, d.created_at, d.updated_at, d.notes, d.doc_status, "
            f"d.user_id, d.assignee_id, "
            f"ua.full_name AS author_name, ua.email AS author_email, ua.avatar_url AS author_avatar, "
            f"ux.full_name AS assignee_name, ux.email AS assignee_email, ux.avatar_url AS assignee_avatar "
            f"FROM documents d "
            f"LEFT JOIN users ua ON ua.id = d.user_id "
            f"LEFT JOIN users ux ON ux.id = d.assignee_id "
            f"WHERE d.id = {esc(doc_id)} AND d.doc_status != 'deleted' "
            f"AND (d.user_id = {esc(user_id)} OR d.assignee_id = {esc(user_id)}) "
            f"LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    return {
        'id': row[0], 'title': row[1], 'doc_number': row[2], 'doc_type': row[3],
        'doc_type_label': DOC_TYPE_LABELS.get(row[3], row[3]),
        'status': row[4], 'status_label': STATUS_LABELS.get(row[4], row[4]),
        'content': row[5], 'file_url': row[6], 'file_name': row[7], 'file_size': row[8],
        'from_org': row[9], 'to_org': row[10], 'due_date': str(row[11]) if row[11] else None,
        'created_at': str(row[12]), 'updated_at': str(row[13]), 'notes': row[14],
        'doc_status': row[15],
        'author': {'id': row[16], 'full_name': row[18], 'email': row[19], 'avatar_url': row[20]},
        'assignee': {'id': row[17], 'full_name': row[21], 'email': row[22], 'avatar_url': row[23]} if row[17] else None,
    }

def get_doc_routes(conn, doc_id):
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT r.id, r.step_order, r.status, r.comment, r.acted_at, r.created_at, "
            f"u.id, u.full_name, u.email, u.avatar_url, u.position "
            f"FROM edo_routes r LEFT JOIN users u ON u.id = r.approver_id "
            f"WHERE r.document_id = {esc(doc_id)} ORDER BY r.step_order"
        )
        rows = cur.fetchall()
    return [{
        'id': r[0], 'step_order': r[1], 'status': r[2],
        'status_label': STATUS_LABELS.get(r[2], r[2]),
        'comment': r[3], 'acted_at': str(r[4]) if r[4] else None,
        'created_at': str(r[5]),
        'approver': {'id': r[6], 'full_name': r[7], 'email': r[8], 'avatar_url': r[9], 'position': r[10]}
    } for r in rows]

def get_doc_history(conn, doc_id):
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT h.id, h.action, h.old_status, h.new_status, h.comment, h.created_at, "
            f"u.full_name, u.email, u.avatar_url "
            f"FROM edo_history h LEFT JOIN users u ON u.id = h.user_id "
            f"WHERE h.document_id = {esc(doc_id)} ORDER BY h.created_at DESC LIMIT 50"
        )
        rows = cur.fetchall()
    return [{
        'id': r[0], 'action': r[1], 'old_status': r[2], 'new_status': r[3],
        'comment': r[4], 'created_at': str(r[5]),
        'user': {'full_name': r[6], 'email': r[7], 'avatar_url': r[8]}
    } for r in rows]

def add_history(conn, doc_id, user_id, action, old_status='', new_status='', comment=''):
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO edo_history (document_id, user_id, action, old_status, new_status, comment) "
            f"VALUES ({esc(doc_id)}, {esc(user_id)}, {esc(action)}, {esc(old_status)}, {esc(new_status)}, {esc(comment)})"
        )

def s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

def handler(event: dict, context) -> dict:
    """ЭДО: документы, маршруты согласования, история, организации, загрузка файлов."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    conn = db()

    try:
        user = get_user(conn, event)

        # ── СПИСОК ДОКУМЕНТОВ ──────────────────────────────────────────
        if action == 'list' and method == 'GET':
            if not user: return resp(401, {'error': 'Не авторизован'})
            status_f = qs.get('status', '')
            doc_type_f = qs.get('doc_type', '')
            search_f = qs.get('search', '')
            limit = int(qs.get('limit', 50))
            offset = int(qs.get('offset', 0))

            where = f"d.doc_status != 'deleted' AND (d.user_id = {esc(user['id'])} OR d.assignee_id = {esc(user['id'])})"
            if user['role'] in ('admin', 'manager'):
                where = "d.doc_status != 'deleted'"
            if status_f:
                where += f" AND d.status = {esc(status_f)}"
            if doc_type_f:
                where += f" AND d.doc_type = {esc(doc_type_f)}"
            if search_f:
                s = esc(f'%{search_f}%')
                where += f" AND (d.title ILIKE {s} OR d.doc_number ILIKE {s} OR d.from_org ILIKE {s} OR d.to_org ILIKE {s})"

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT d.id, d.title, d.doc_number, d.doc_type, d.status, "
                    f"d.from_org, d.to_org, d.due_date, d.created_at, d.file_name, "
                    f"ua.full_name, ux.full_name, d.doc_status "
                    f"FROM documents d "
                    f"LEFT JOIN users ua ON ua.id = d.user_id "
                    f"LEFT JOIN users ux ON ux.id = d.assignee_id "
                    f"WHERE {where} ORDER BY d.created_at DESC LIMIT {limit} OFFSET {offset}"
                )
                rows = cur.fetchall()
                cur.execute(f"SELECT COUNT(*) FROM documents d WHERE {where}")
                total = cur.fetchone()[0]

            docs = [{
                'id': r[0], 'title': r[1], 'doc_number': r[2],
                'doc_type': r[3], 'doc_type_label': DOC_TYPE_LABELS.get(r[3], r[3]),
                'status': r[4], 'status_label': STATUS_LABELS.get(r[4], r[4]),
                'from_org': r[5], 'to_org': r[6],
                'due_date': str(r[7]) if r[7] else None,
                'created_at': str(r[8]), 'file_name': r[9],
                'author_name': r[10], 'assignee_name': r[11], 'doc_status': r[12],
            } for r in rows]
            return resp(200, {'docs': docs, 'total': total})

        # ── ОДИН ДОКУМЕНТ ──────────────────────────────────────────────
        if action == 'get' and method == 'GET':
            if not user: return resp(401, {'error': 'Не авторизован'})
            doc_id = int(qs.get('id', 0))
            doc = get_doc(conn, doc_id, user['id'])
            if user['role'] in ('admin', 'manager') and not doc:
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT d.id, d.title, d.doc_number, d.doc_type, d.status, d.content, "
                        f"d.file_url, d.file_name, d.file_size, d.from_org, d.to_org, "
                        f"d.due_date, d.created_at, d.updated_at, d.notes, d.doc_status, "
                        f"d.user_id, d.assignee_id, "
                        f"ua.full_name, ua.email, ua.avatar_url, "
                        f"ux.full_name, ux.email, ux.avatar_url "
                        f"FROM documents d "
                        f"LEFT JOIN users ua ON ua.id = d.user_id "
                        f"LEFT JOIN users ux ON ux.id = d.assignee_id "
                        f"WHERE d.id = {esc(doc_id)} AND d.doc_status != 'deleted' LIMIT 1"
                    )
                    row = cur.fetchone()
                if row:
                    doc = {
                        'id': row[0], 'title': row[1], 'doc_number': row[2], 'doc_type': row[3],
                        'doc_type_label': DOC_TYPE_LABELS.get(row[3], row[3]),
                        'status': row[4], 'status_label': STATUS_LABELS.get(row[4], row[4]),
                        'content': row[5], 'file_url': row[6], 'file_name': row[7], 'file_size': row[8],
                        'from_org': row[9], 'to_org': row[10],
                        'due_date': str(row[11]) if row[11] else None,
                        'created_at': str(row[12]), 'updated_at': str(row[13]), 'notes': row[14],
                        'doc_status': row[15],
                        'author': {'id': row[16], 'full_name': row[18], 'email': row[19], 'avatar_url': row[20]},
                        'assignee': {'id': row[17], 'full_name': row[21], 'email': row[22], 'avatar_url': row[23]} if row[17] else None,
                    }
            if not doc: return resp(404, {'error': 'Документ не найден'})
            routes = get_doc_routes(conn, doc_id)
            history = get_doc_history(conn, doc_id)
            return resp(200, {'doc': doc, 'routes': routes, 'history': history})

        # ── СОЗДАТЬ ДОКУМЕНТ ───────────────────────────────────────────
        if action == 'create' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            title = body.get('title', '').strip()
            if not title: return resp(400, {'error': 'Название обязательно'})
            doc_type = body.get('doc_type', 'internal')
            content = body.get('content', '')
            from_org = body.get('from_org', '')
            to_org = body.get('to_org', '')
            due_date = body.get('due_date') or None
            assignee_id = body.get('assignee_id') or None
            notes = body.get('notes', '')

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(COALESCE(doc_number,'0'), '[^0-9]', '0', 'g') AS INTEGER)), 0) + 1 FROM documents"
                )
                num = cur.fetchone()[0]
                doc_number = f"ДОК-{str(num).zfill(4)}"
                cur.execute(
                    f"INSERT INTO documents (user_id, title, doc_number, doc_type, status, content, "
                    f"from_org, to_org, due_date, assignee_id, notes, doc_status) "
                    f"VALUES ({esc(user['id'])}, {esc(title)}, {esc(doc_number)}, {esc(doc_type)}, "
                    f"'draft', {esc(content)}, {esc(from_org)}, {esc(to_org)}, "
                    f"{esc(due_date)}, {esc(assignee_id)}, {esc(notes)}, 'active') "
                    f"RETURNING id"
                )
                doc_id = cur.fetchone()[0]
            add_history(conn, doc_id, user['id'], 'Документ создан', '', 'draft')
            conn.commit()
            return resp(201, {'id': doc_id, 'doc_number': doc_number})

        # ── ОБНОВИТЬ ДОКУМЕНТ ──────────────────────────────────────────
        if action == 'update' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            doc_id = int(body.get('id', 0))
            doc = get_doc(conn, doc_id, user['id'])
            if not doc and user['role'] not in ('admin', 'manager'):
                return resp(404, {'error': 'Документ не найден'})

            fields = []
            if 'title' in body: fields.append(f"title = {esc(body['title'])}")
            if 'doc_type' in body: fields.append(f"doc_type = {esc(body['doc_type'])}")
            if 'content' in body: fields.append(f"content = {esc(body['content'])}")
            if 'from_org' in body: fields.append(f"from_org = {esc(body['from_org'])}")
            if 'to_org' in body: fields.append(f"to_org = {esc(body['to_org'])}")
            if 'due_date' in body: fields.append(f"due_date = {esc(body['due_date'] or None)}")
            if 'assignee_id' in body: fields.append(f"assignee_id = {esc(body['assignee_id'] or None)}")
            if 'notes' in body: fields.append(f"notes = {esc(body['notes'])}")
            fields.append("updated_at = NOW()")
            with conn.cursor() as cur:
                cur.execute(f"UPDATE documents SET {', '.join(fields)} WHERE id = {esc(doc_id)}")
            add_history(conn, doc_id, user['id'], 'Документ обновлён')
            conn.commit()
            return resp(200, {'ok': True})

        # ── ИЗМЕНИТЬ СТАТУС ────────────────────────────────────────────
        if action == 'status' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            doc_id = int(body.get('id', 0))
            new_status = body.get('status', '')
            comment = body.get('comment', '')
            valid = ['draft', 'pending', 'review', 'approved', 'rejected', 'archive']
            if new_status not in valid:
                return resp(400, {'error': 'Недопустимый статус'})
            with conn.cursor() as cur:
                cur.execute(f"SELECT status FROM documents WHERE id = {esc(doc_id)}")
                row = cur.fetchone()
                if not row: return resp(404, {'error': 'Не найдено'})
                old_status = row[0]
                cur.execute(f"UPDATE documents SET status = {esc(new_status)}, updated_at = NOW() WHERE id = {esc(doc_id)}")
            add_history(conn, doc_id, user['id'], f"Статус изменён: {STATUS_LABELS.get(old_status,old_status)} → {STATUS_LABELS.get(new_status,new_status)}", old_status, new_status, comment)
            conn.commit()
            return resp(200, {'ok': True})

        # ── УДАЛИТЬ (мягко) ────────────────────────────────────────────
        if action == 'delete' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            doc_id = int(body.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(f"UPDATE documents SET doc_status = 'deleted', updated_at = NOW() WHERE id = {esc(doc_id)}")
            add_history(conn, doc_id, user['id'], 'Документ удалён')
            conn.commit()
            return resp(200, {'ok': True})

        # ── ВОССТАНОВИТЬ ───────────────────────────────────────────────
        if action == 'restore' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            doc_id = int(body.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(f"UPDATE documents SET doc_status = 'active', updated_at = NOW() WHERE id = {esc(doc_id)}")
            add_history(conn, doc_id, user['id'], 'Документ восстановлен')
            conn.commit()
            return resp(200, {'ok': True})

        # ── ЗАГРУЗИТЬ ФАЙЛ ─────────────────────────────────────────────
        if action == 'upload' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            doc_id = int(body.get('doc_id', 0))
            file_b64 = body.get('file', '')
            file_name = body.get('file_name', 'file')
            file_data = base64.b64decode(file_b64)
            file_size = len(file_data)
            ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else ''
            content_type = mimetypes.guess_type(file_name)[0] or 'application/octet-stream'
            key = f"edo/{doc_id}/{secrets.token_hex(8)}_{file_name}"
            s3 = s3_client()
            s3.put_object(Bucket='files', Key=key, Body=file_data, ContentType=content_type)
            file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE documents SET file_url = {esc(file_url)}, file_name = {esc(file_name)}, "
                    f"file_size = {esc(file_size)}, updated_at = NOW() WHERE id = {esc(doc_id)}"
                )
            add_history(conn, doc_id, user['id'], f"Файл загружен: {file_name}")
            conn.commit()
            return resp(200, {'file_url': file_url, 'file_name': file_name, 'file_size': file_size})

        # ── МАРШРУТ СОГЛАСОВАНИЯ ───────────────────────────────────────
        if action == 'route-add' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            doc_id = int(body.get('doc_id', 0))
            approver_id = int(body.get('approver_id', 0))
            with conn.cursor() as cur:
                cur.execute(f"SELECT COALESCE(MAX(step_order), 0) + 1 FROM edo_routes WHERE document_id = {esc(doc_id)}")
                step = cur.fetchone()[0]
                cur.execute(
                    f"INSERT INTO edo_routes (document_id, step_order, approver_id, status) "
                    f"VALUES ({esc(doc_id)}, {esc(step)}, {esc(approver_id)}, 'pending')"
                )
            add_history(conn, doc_id, user['id'], 'Добавлен согласующий')
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'route-act' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            route_id = int(body.get('route_id', 0))
            act = body.get('status', '')
            comment = body.get('comment', '')
            if act not in ('approved', 'rejected'): return resp(400, {'error': 'Недопустимое действие'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE edo_routes SET status = {esc(act)}, comment = {esc(comment)}, acted_at = NOW() "
                    f"WHERE id = {esc(route_id)} AND approver_id = {esc(user['id'])}"
                )
                cur.execute(f"SELECT document_id FROM edo_routes WHERE id = {esc(route_id)}")
                row = cur.fetchone()
                if row:
                    add_history(conn, row[0], user['id'],
                        f"{'Согласовано' if act == 'approved' else 'Отклонено'}", '', act, comment)
            conn.commit()
            return resp(200, {'ok': True})

        # ── СПИСОК ПОЛЬЗОВАТЕЛЕЙ (для назначения) ─────────────────────
        if action == 'users' and method == 'GET':
            if not user: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, full_name, email, position, role, avatar_url "
                    "FROM users WHERE is_active = TRUE ORDER BY full_name"
                )
                rows = cur.fetchall()
            return resp(200, {'users': [
                {'id': r[0], 'full_name': r[1], 'email': r[2],
                 'position': r[3], 'role': r[4], 'avatar_url': r[5]}
                for r in rows
            ]})

        # ── ОРГАНИЗАЦИИ ────────────────────────────────────────────────
        if action == 'orgs' and method == 'GET':
            if not user: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, inn, email, phone FROM edo_organizations WHERE is_active = 'yes' ORDER BY name")
                rows = cur.fetchall()
            return resp(200, {'orgs': [
                {'id': r[0], 'name': r[1], 'inn': r[2], 'email': r[3], 'phone': r[4]}
                for r in rows
            ]})

        if action == 'org-create' and method == 'POST':
            if not user: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            name = body.get('name', '').strip()
            if not name: return resp(400, {'error': 'Название обязательно'})
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO edo_organizations (name, inn, kpp, address, email, phone) "
                    f"VALUES ({esc(name)}, {esc(body.get('inn',''))}, {esc(body.get('kpp',''))}, "
                    f"{esc(body.get('address',''))}, {esc(body.get('email',''))}, {esc(body.get('phone',''))}) RETURNING id"
                )
                org_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': org_id})

        # ── СТАТИСТИКА ─────────────────────────────────────────────────
        if action == 'stats' and method == 'GET':
            if not user: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute("SELECT status, COUNT(*) FROM documents WHERE doc_status != 'deleted' GROUP BY status")
                by_status = {r[0]: r[1] for r in cur.fetchall()}
                cur.execute("SELECT doc_type, COUNT(*) FROM documents WHERE doc_status != 'deleted' GROUP BY doc_type")
                by_type = {r[0]: r[1] for r in cur.fetchall()}
                cur.execute("SELECT COUNT(*) FROM documents WHERE doc_status = 'deleted'")
                deleted = cur.fetchone()[0]
            return resp(200, {'by_status': by_status, 'by_type': by_type, 'deleted': deleted})

        # ── АРХИВ (удалённые) ──────────────────────────────────────────
        if action == 'trash' and method == 'GET':
            if not user: return resp(401, {'error': 'Не авторизован'})
            if user['role'] not in ('admin', 'manager'): return resp(403, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT d.id, d.title, d.doc_number, d.doc_type, d.status, d.created_at, ua.full_name "
                    "FROM documents d LEFT JOIN users ua ON ua.id = d.user_id "
                    "WHERE d.doc_status = 'deleted' ORDER BY d.updated_at DESC LIMIT 100"
                )
                rows = cur.fetchall()
            return resp(200, {'docs': [{
                'id': r[0], 'title': r[1], 'doc_number': r[2],
                'doc_type': r[3], 'doc_type_label': DOC_TYPE_LABELS.get(r[3], r[3]),
                'status': r[4], 'status_label': STATUS_LABELS.get(r[4], r[4]),
                'created_at': str(r[5]), 'author_name': r[6],
            } for r in rows]})

        return resp(404, {'error': 'Неизвестное действие'})

    except Exception as e:
        conn.rollback()
        return resp(500, {'error': str(e)})
    finally:
        conn.close()
