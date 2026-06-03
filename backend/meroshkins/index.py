import json, os, secrets
import psycopg2
from datetime import datetime, timezone

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token',
}

def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def esc(v):
    if v is None: return 'NULL'
    if isinstance(v, bool): return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def resp(status, body):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'isBase64Encoded': False, 'body': json.dumps(body, ensure_ascii=False, default=str)}

def get_user(conn, event):
    headers = event.get('headers') or {}
    raw = (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()
    token = raw
    if not token: return None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.id, u.email, u.full_name, u.role FROM sessions s "
            "JOIN users u ON u.id = s.user_id "
            f"WHERE s.token = {esc(token)} AND s.expires_at > NOW() AND u.is_active = TRUE LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    return {'id': row[0], 'email': row[1], 'full_name': row[2], 'role': row[3]}

def handler(event: dict, context) -> dict:
    """Мерошкинс: управление мероприятиями, залами и площадками."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    conn = db()

    try:
        # === PUBLIC: share link ===
        if action == 'share-view' and method == 'GET':
            token = qs.get('token', '')
            if not token: return resp(400, {'error': 'token required'})
            with conn.cursor() as cur:
                cur.execute(f"SELECT user_id, date_from, date_to FROM m_event_shares WHERE token = {esc(token)} LIMIT 1")
                share = cur.fetchone()
            if not share: return resp(404, {'error': 'Ссылка недействительна'})
            uid, df, dt = share
            where = f"user_id = {uid}"
            if df: where += f" AND starts_at::date >= '{df}'"
            if dt: where += f" AND starts_at::date <= '{dt}'"
            with conn.cursor() as cur:
                cur.execute(f"SELECT id,title,event_type,status,starts_at,ends_at,room_id,responsible,description,info_reason,color FROM m_events WHERE {where} ORDER BY starts_at")
                rows = cur.fetchall()
            return resp(200, {'events': [_ev(r) for r in rows], 'readonly': True})

        user = get_user(conn, event)
        if not user: return resp(403, {'error': 'Необходима авторизация'})
        uid = user['id']
        body = json.loads(event.get('body') or '{}') if method in ('POST', 'PUT') else {}

        # === VENUES ===
        if action == 'venues':
            if method == 'GET':
                with conn.cursor() as cur:
                    cur.execute(f"SELECT id,name,address,description,is_active FROM m_venues WHERE user_id={uid} ORDER BY name")
                    rows = cur.fetchall()
                return resp(200, {'venues': [{'id':r[0],'name':r[1],'address':r[2],'description':r[3],'is_active':r[4]} for r in rows]})
            if method == 'POST':
                name = (body.get('name') or '').strip()
                if not name: return resp(400, {'error': 'Название обязательно'})
                with conn.cursor() as cur:
                    cur.execute(f"INSERT INTO m_venues (user_id,name,address,description) VALUES ({uid},{esc(name)},{esc(body.get('address',''))},{esc(body.get('description',''))}) RETURNING id")
                    vid = cur.fetchone()[0]
                conn.commit()
                return resp(200, {'id': vid})
            if method == 'PUT':
                vid = int(body.get('id') or 0)
                if not vid: return resp(400, {'error': 'id обязателен'})
                sets = []
                for f in ('name','address','description'):
                    if f in body: sets.append(f"{f}={esc(body[f])}")
                if 'is_active' in body: sets.append(f"is_active={esc(bool(body['is_active']))}")
                if sets:
                    with conn.cursor() as cur:
                        cur.execute(f"UPDATE m_venues SET {','.join(sets)} WHERE id={vid} AND user_id={uid}")
                    conn.commit()
                return resp(200, {'ok': True})

        # === ROOMS ===
        if action == 'rooms':
            if method == 'GET':
                venue_id = qs.get('venue_id')
                w = f"user_id={uid}"
                if venue_id: w += f" AND venue_id={esc(int(venue_id))}"
                with conn.cursor() as cur:
                    cur.execute(f"SELECT r.id,r.name,r.capacity,r.features,r.is_active,r.venue_id,v.name FROM m_rooms r JOIN m_venues v ON v.id=r.venue_id WHERE r.{w} ORDER BY v.name,r.name")
                    rows = cur.fetchall()
                return resp(200, {'rooms': [{'id':r[0],'name':r[1],'capacity':r[2],'features':r[3],'is_active':r[4],'venue_id':r[5],'venue_name':r[6]} for r in rows]})
            if method == 'POST':
                name = (body.get('name') or '').strip()
                venue_id = int(body.get('venue_id') or 0)
                if not name or not venue_id: return resp(400, {'error': 'name и venue_id обязательны'})
                with conn.cursor() as cur:
                    cur.execute(f"INSERT INTO m_rooms (venue_id,user_id,name,capacity,features) VALUES ({venue_id},{uid},{esc(name)},{esc(int(body.get('capacity') or 0))},{esc(body.get('features',''))}) RETURNING id")
                    rid = cur.fetchone()[0]
                conn.commit()
                return resp(200, {'id': rid})
            if method == 'PUT':
                rid = int(body.get('id') or 0)
                if not rid: return resp(400, {'error': 'id обязателен'})
                sets = []
                for f in ('name','features'):
                    if f in body: sets.append(f"{f}={esc(body[f])}")
                if 'capacity' in body: sets.append(f"capacity={esc(int(body['capacity']))}")
                if 'is_active' in body: sets.append(f"is_active={esc(bool(body['is_active']))}")
                if sets:
                    with conn.cursor() as cur:
                        cur.execute(f"UPDATE m_rooms SET {','.join(sets)} WHERE id={rid} AND user_id={uid}")
                    conn.commit()
                return resp(200, {'ok': True})

        # === EVENTS ===
        if action == 'events':
            if method == 'GET':
                year = qs.get('year'); month = qs.get('month')
                filters = [f"e.user_id={uid}"]
                if year and month:
                    filters.append(f"EXTRACT(YEAR FROM e.starts_at)={year} AND EXTRACT(MONTH FROM e.starts_at)={month}")
                if qs.get('room_id'): filters.append(f"e.room_id={esc(int(qs['room_id']))}")
                if qs.get('event_type'): filters.append(f"e.event_type={esc(qs['event_type'])}")
                if qs.get('status'): filters.append(f"e.status={esc(qs['status'])}")
                if qs.get('q'): filters.append(f"e.title ILIKE {esc('%'+qs['q']+'%')}")
                w = ' AND '.join(filters)
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT e.id,e.title,e.event_type,e.status,e.starts_at,e.ends_at,e.room_id,e.responsible,e.description,e.info_reason,e.color,"
                        f"r.name,v.name FROM m_events e LEFT JOIN m_rooms r ON r.id=e.room_id LEFT JOIN m_venues v ON v.id=r.venue_id "
                        f"WHERE {w} ORDER BY e.starts_at"
                    )
                    rows = cur.fetchall()
                return resp(200, {'events': [_ev_full(r) for r in rows]})

            if method == 'POST':
                title = (body.get('title') or '').strip()
                if not title: return resp(400, {'error': 'Название обязательно'})
                starts = body.get('starts_at'); ends = body.get('ends_at')
                if not starts or not ends: return resp(400, {'error': 'Даты обязательны'})
                room_id = body.get('room_id')
                room_sql = esc(int(room_id)) if room_id else 'NULL'
                with conn.cursor() as cur:
                    cur.execute(
                        f"INSERT INTO m_events (user_id,title,event_type,status,starts_at,ends_at,room_id,responsible,description,info_reason,press_release,color) "
                        f"VALUES ({uid},{esc(title)},{esc(body.get('event_type','other'))},{esc(body.get('status','planned'))},"
                        f"{esc(starts)},{esc(ends)},{room_sql},{esc(body.get('responsible',''))},{esc(body.get('description',''))},"
                        f"{esc(body.get('info_reason',''))},{esc(body.get('press_release',''))},{esc(body.get('color','#7c3aed'))}) RETURNING id"
                    )
                    eid = cur.fetchone()[0]
                conn.commit()
                return resp(200, {'id': eid})

            if method == 'PUT':
                eid = int(body.get('id') or 0)
                if not eid: return resp(400, {'error': 'id обязателен'})
                sets = []
                for f in ('title','event_type','status','starts_at','ends_at','responsible','description','info_reason','press_release','color'):
                    if f in body: sets.append(f"{f}={esc(body[f])}")
                if 'room_id' in body:
                    sets.append(f"room_id={'NULL' if not body['room_id'] else esc(int(body['room_id']))}")
                sets.append(f"updated_at=NOW()")
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE m_events SET {','.join(sets)} WHERE id={eid} AND user_id={uid}")
                conn.commit()
                return resp(200, {'ok': True})

        # === EVENT DELETE ===
        if action == 'event-delete' and method == 'PUT':
            eid = int(body.get('id') or 0)
            if not eid: return resp(400, {'error': 'id обязателен'})
            with conn.cursor() as cur:
                cur.execute(f"UPDATE m_events SET status='deleted' WHERE id={eid} AND user_id={uid}")
            conn.commit()
            return resp(200, {'ok': True})

        # === SHARE ===
        if action == 'share-create' and method == 'POST':
            token = secrets.token_urlsafe(24)
            df = body.get('date_from'); dt = body.get('date_to')
            with conn.cursor() as cur:
                cur.execute(f"INSERT INTO m_event_shares (user_id,token,date_from,date_to) VALUES ({uid},{esc(token)},{esc(df) if df else 'NULL'},{esc(dt) if dt else 'NULL'}) RETURNING id")
            conn.commit()
            return resp(200, {'token': token})

        return resp(404, {'error': 'Не найдено'})
    finally:
        conn.close()

def _ev(r):
    return {'id':r[0],'title':r[1],'event_type':r[2],'status':r[3],
            'starts_at':str(r[4]),'ends_at':str(r[5]),'room_id':r[6],
            'responsible':r[7],'description':r[8],'info_reason':r[9],'color':r[10]}

def _ev_full(r):
    return {**_ev(r[:11]), 'room_name': r[11], 'venue_name': r[12]}