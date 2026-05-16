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

def get_user(conn, token):
    if not token:
        return None
    safe = token.replace("'", "''")
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.id, u.role, u.access_tasks, u.access_documents, u.access_crm "
            "FROM sessions s JOIN users u ON s.user_id = u.id "
            f"WHERE s.token = '{safe}' AND s.expires_at > NOW() AND u.is_active = TRUE"
        )
        row = cur.fetchone()
    if not row:
        return None
    return {'id': row[0], 'role': row[1], 'access_tasks': row[2], 'access_documents': row[3], 'access_crm': row[4]}

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

def row_dict(cur, row):
    cols = [c.name for c in cur.description]
    return {col: val for col, val in zip(cols, row)}

SCHEMAS = {
    'tasks': {
        'access': 'access_tasks',
        'table': 'tasks',
        'fields': ['title', 'description', 'status', 'priority'],
    },
    'documents': {
        'access': 'access_documents',
        'table': 'documents',
        'fields': ['title', 'file_url', 'status', 'notes'],
    },
    'crm': {
        'access': 'access_crm',
        'table': 'crm_clients',
        'fields': ['name', 'company', 'email', 'phone', 'stage', 'amount', 'notes'],
    },
}

def handler(event, context):
    """Рабочее пространство сотрудника: задачи, документы, CRM."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    qs = event.get('queryStringParameters') or {}
    kind = qs.get('kind', '')
    if kind not in SCHEMAS:
        return resp(400, {'error': 'kind должен быть tasks, documents или crm'})
    schema = SCHEMAS[kind]

    conn = db()
    try:
        user = get_user(conn, token)
        if not user:
            return resp(401, {'error': 'Не авторизован'})
        if not user.get(schema['access']):
            return resp(403, {'error': 'Раздел недоступен'})

        uid = user['id']
        table = schema['table']

        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM {table} WHERE user_id = {uid} ORDER BY id DESC")
                items = [row_dict(cur, r) for r in cur.fetchall()]
            return resp(200, {'items': items})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            cols, vals = ['user_id'], [str(uid)]
            for f in schema['fields']:
                if f in body:
                    cols.append(f)
                    vals.append(esc(body[f]))
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)}) RETURNING id"
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if method == 'PUT':
            iid = int(body.get('id') or 0)
            sets = []
            for f in schema['fields']:
                if f in body:
                    sets.append(f"{f} = {esc(body[f])}")
            sets.append("updated_at = NOW()")
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {table} SET {', '.join(sets)} WHERE id = {iid} AND user_id = {uid}"
                )
            conn.commit()
            return resp(200, {'ok': True})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()
