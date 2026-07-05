import json, os, secrets, hashlib, random
from datetime import datetime, timezone, timedelta
import psycopg2
import boto3
import urllib.request
from certificate import build_certificate_pdf
from cert_template import build_certificate_from_template, render_template_preview

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


def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


def get_token(event):
    headers = event.get('headers') or {}
    return (headers.get('X-Auth-Token') or headers.get('X-Authorization') or '').replace('Bearer ', '').strip()


def get_student(conn, event):
    token = get_token(event)
    if not token: return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT s.id, s.email, s.full_name, s.phone, s.avatar_url "
            f"FROM camp_sessions cs JOIN camp_students s ON s.id = cs.student_id "
            f"WHERE cs.token = {esc(token)} AND cs.expires_at > NOW() AND s.is_active = TRUE LIMIT 1"
        )
        row = cur.fetchone()
    if not row: return None
    return {'id': row[0], 'email': row[1], 'full_name': row[2], 'phone': row[3], 'avatar_url': row[4]}


def get_admin(conn, event):
    token = get_token(event)
    if not token: return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.role FROM sessions s JOIN users u ON u.id = s.user_id "
            f"WHERE s.token = {esc(token)} AND s.expires_at > NOW() AND u.is_active = TRUE LIMIT 1"
        )
        row = cur.fetchone()
    if not row or row[1] not in ('admin', 'manager'): return None
    return {'id': row[0]}


def s3_client():
    return boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def gen_cert_number():
    return f"CAMP-{datetime.now().year}-{random.randint(100000, 999999)}"


def get_cert_template(conn):
    """Возвращает настройки шаблона сертификата, если он загружен, иначе None."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT template_url, name_x, name_y, name_size, name_color, name_align, "
            "date_x, date_y, date_size, date_color, date_align, "
            "number_x, number_y, number_size, number_color, number_align "
            "FROM camp_certificate_template WHERE id = 1 LIMIT 1"
        )
        row = cur.fetchone()
    if not row or not row[0]:
        return None
    return {
        'template_url': row[0],
        'name_x': row[1], 'name_y': row[2], 'name_size': row[3], 'name_color': row[4], 'name_align': row[5],
        'date_x': row[6], 'date_y': row[7], 'date_size': row[8], 'date_color': row[9], 'date_align': row[10],
        'number_x': row[11], 'number_y': row[12], 'number_size': row[13], 'number_color': row[14], 'number_align': row[15],
    }


def issue_certificate(conn, student_id, program_id, full_name, program_title):
    """Создаёт запись сертификата и генерирует PDF, кладёт в S3.
    Если в camp_certificate_template загружен PDF-шаблон — накладывает поля на него,
    иначе используется встроенная генерация через fpdf2."""
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT id, cert_number, pdf_url FROM camp_certificates "
            f"WHERE student_id = {esc(student_id)} AND program_id = {esc(program_id)} LIMIT 1"
        )
        existing = cur.fetchone()
    if existing:
        return {'id': existing[0], 'cert_number': existing[1], 'pdf_url': existing[2]}

    cert_number = gen_cert_number()
    issued_at = datetime.now(timezone.utc).isoformat()
    date_str = datetime.now(timezone.utc).strftime('%d.%m.%Y')

    template = get_cert_template(conn)
    if template:
        with urllib.request.urlopen(template['template_url']) as f:
            template_bytes = f.read()
        pdf_bytes = build_certificate_from_template(template_bytes, template, full_name, cert_number, date_str)
    else:
        pdf_bytes = build_certificate_pdf(full_name, program_title, cert_number, issued_at)

    key = f"camp/certificates/{cert_number}.pdf"
    s3 = s3_client()
    s3.put_object(Bucket='files', Key=key, Body=pdf_bytes, ContentType='application/pdf')
    pdf_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO camp_certificates (student_id, program_id, cert_number, pdf_url) "
            f"VALUES ({esc(student_id)}, {esc(program_id)}, {esc(cert_number)}, {esc(pdf_url)}) RETURNING id"
        )
        cert_id = cur.fetchone()[0]
    conn.commit()
    return {'id': cert_id, 'cert_number': cert_number, 'pdf_url': pdf_url}


def row_dict(cur, row):
    cols = [c.name for c in cur.description]
    return {col: val for col, val in zip(cols, row)}


def handler(event: dict, context) -> dict:
    """Кэмп от Даббл.Образования: регистрация студентов, программы обучения, лекции, тесты, сертификаты, админка."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    conn = db()

    try:
        # ══════════════════════════════════════════════════════
        # СТУДЕНТ: АВТОРИЗАЦИЯ
        # ══════════════════════════════════════════════════════

        if action == 'register' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            full_name = (body.get('full_name') or '').strip()
            if not email or not password or not full_name:
                return resp(400, {'error': 'Заполните все поля'})
            if len(password) < 6:
                return resp(400, {'error': 'Пароль должен быть не короче 6 символов'})
            if len(full_name.split()) < 2:
                return resp(400, {'error': 'Укажите полное ФИО — оно будет напечатано на сертификате'})
            with conn.cursor() as cur:
                cur.execute(f"SELECT id FROM camp_students WHERE email = {esc(email)} LIMIT 1")
                if cur.fetchone():
                    return resp(409, {'error': 'Такой email уже зарегистрирован'})
                cur.execute(
                    f"INSERT INTO camp_students (email, password_hash, full_name) "
                    f"VALUES ({esc(email)}, {esc(hash_pw(password))}, {esc(full_name)}) RETURNING id"
                )
                student_id = cur.fetchone()[0]
                token = secrets.token_hex(32)
                expires = (datetime.now(timezone.utc) + timedelta(days=60)).isoformat()
                cur.execute(
                    f"INSERT INTO camp_sessions (student_id, token, expires_at) "
                    f"VALUES ({esc(student_id)}, {esc(token)}, {esc(expires)})"
                )
            conn.commit()
            return resp(201, {'token': token, 'student': {'id': student_id, 'email': email, 'full_name': full_name}})

        if action == 'login' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, email, full_name, password_hash, is_active FROM camp_students "
                    f"WHERE email = {esc(email)} LIMIT 1"
                )
                row = cur.fetchone()
            if not row or row[3] != hash_pw(password):
                return resp(401, {'error': 'Неверный email или пароль'})
            if not row[4]:
                return resp(403, {'error': 'Аккаунт заблокирован'})
            token = secrets.token_hex(32)
            expires = (datetime.now(timezone.utc) + timedelta(days=60)).isoformat()
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO camp_sessions (student_id, token, expires_at) "
                    f"VALUES ({esc(row[0])}, {esc(token)}, {esc(expires)})"
                )
            conn.commit()
            return resp(200, {'token': token, 'student': {'id': row[0], 'email': row[1], 'full_name': row[2]}})

        if action == 'logout' and method == 'POST':
            token = get_token(event)
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM camp_sessions WHERE token = {esc(token)}")
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'me' and method == 'GET':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            return resp(200, {'student': student})

        if action == 'profile-update' and method == 'POST':
            """Студент может поправить своё ФИО и телефон — ФИО используется при печати сертификата."""
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            full_name = (body.get('full_name') or '').strip()
            phone = (body.get('phone') or '').strip()
            if not full_name or len(full_name.split()) < 2:
                return resp(400, {'error': 'Укажите полное ФИО — оно будет напечатано на сертификате'})
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE camp_students SET full_name = {esc(full_name)}, phone = {esc(phone)} "
                    f"WHERE id = {esc(student['id'])}"
                )
            conn.commit()
            return resp(200, {'student': {**student, 'full_name': full_name, 'phone': phone}})

        # ══════════════════════════════════════════════════════
        # ПУБЛИЧНО: СПИСОК ПРОГРАММ
        # ══════════════════════════════════════════════════════

        if action == 'programs' and method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, title, description, image_url, duration_label, level "
                    "FROM camp_programs WHERE is_active = TRUE ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'programs': [{
                'id': r[0], 'title': r[1], 'description': r[2], 'image_url': r[3],
                'duration_label': r[4], 'level': r[5],
            } for r in rows]})

        if action == 'program' and method == 'GET':
            program_id = int(qs.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, description, image_url, duration_label, level "
                    f"FROM camp_programs WHERE id = {esc(program_id)} AND is_active = TRUE LIMIT 1"
                )
                row = cur.fetchone()
            if not row: return resp(404, {'error': 'Программа не найдена'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title FROM camp_modules WHERE program_id = {esc(program_id)} "
                    f"AND is_active = TRUE ORDER BY sort_order, id"
                )
                modules = cur.fetchall()
            module_list = []
            for m in modules:
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT id, title FROM camp_lectures WHERE module_id = {esc(m[0])} "
                        f"AND is_active = TRUE ORDER BY sort_order, id"
                    )
                    lectures = [{'id': l[0], 'title': l[1]} for l in cur.fetchall()]
                module_list.append({'id': m[0], 'title': m[1], 'lectures': lectures})
            return resp(200, {'program': {
                'id': row[0], 'title': row[1], 'description': row[2], 'image_url': row[3],
                'duration_label': row[4], 'level': row[5], 'modules': module_list,
            }})

        # ══════════════════════════════════════════════════════
        # СТУДЕНТ: КАБИНЕТ
        # ══════════════════════════════════════════════════════

        if action == 'enroll' and method == 'POST':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            program_id = int(body.get('program_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id FROM camp_enrollments WHERE student_id = {esc(student['id'])} "
                    f"AND program_id = {esc(program_id)} LIMIT 1"
                )
                if not cur.fetchone():
                    cur.execute(
                        f"INSERT INTO camp_enrollments (student_id, program_id) "
                        f"VALUES ({esc(student['id'])}, {esc(program_id)})"
                    )
            conn.commit()
            return resp(201, {'ok': True})

        if action == 'my-programs' and method == 'GET':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT p.id, p.title, p.description, p.image_url, p.duration_label, p.level, "
                    f"e.status, e.enrolled_at, e.completed_at "
                    f"FROM camp_enrollments e JOIN camp_programs p ON p.id = e.program_id "
                    f"WHERE e.student_id = {esc(student['id'])} ORDER BY e.enrolled_at DESC"
                )
                rows = cur.fetchall()
            result = []
            for r in rows:
                program_id = r[0]
                with conn.cursor() as cur:
                    cur.execute(f"SELECT COUNT(*) FROM camp_lectures l JOIN camp_modules m ON m.id = l.module_id WHERE m.program_id = {esc(program_id)} AND l.is_active = TRUE")
                    total_lectures = cur.fetchone()[0]
                    cur.execute(
                        f"SELECT COUNT(*) FROM camp_lecture_progress lp "
                        f"JOIN camp_lectures l ON l.id = lp.lecture_id JOIN camp_modules m ON m.id = l.module_id "
                        f"WHERE m.program_id = {esc(program_id)} AND lp.student_id = {esc(student['id'])}"
                    )
                    done_lectures = cur.fetchone()[0]
                result.append({
                    'id': r[0], 'title': r[1], 'description': r[2], 'image_url': r[3],
                    'duration_label': r[4], 'level': r[5], 'status': r[6],
                    'enrolled_at': str(r[7]), 'completed_at': str(r[8]) if r[8] else None,
                    'total_lectures': total_lectures, 'done_lectures': done_lectures,
                })
            return resp(200, {'programs': result})

        if action == 'learn' and method == 'GET':
            """Полная структура программы с прогрессом студента: модули, лекции, тесты, статусы прохождения."""
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            program_id = int(qs.get('program_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, description FROM camp_programs WHERE id = {esc(program_id)} LIMIT 1"
                )
                prog = cur.fetchone()
            if not prog: return resp(404, {'error': 'Программа не найдена'})

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title FROM camp_modules WHERE program_id = {esc(program_id)} "
                    f"AND is_active = TRUE ORDER BY sort_order, id"
                )
                modules = cur.fetchall()

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT lecture_id FROM camp_lecture_progress WHERE student_id = {esc(student['id'])}"
                )
                done_lecture_ids = {r[0] for r in cur.fetchall()}

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT test_id, passed, score FROM camp_test_attempts WHERE student_id = {esc(student['id'])} "
                    f"AND test_id IN (SELECT id FROM camp_tests WHERE program_id = {esc(program_id)}) "
                    f"ORDER BY created_at DESC"
                )
                test_results = {}
                for r in cur.fetchall():
                    if r[0] not in test_results:
                        test_results[r[0]] = {'passed': r[1], 'score': r[2]}

            module_list = []
            for m in modules:
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT id, title, content, video_url, file_url FROM camp_lectures "
                        f"WHERE module_id = {esc(m[0])} AND is_active = TRUE ORDER BY sort_order, id"
                    )
                    lectures = [{
                        'id': l[0], 'title': l[1], 'content': l[2], 'video_url': l[3], 'file_url': l[4],
                        'done': l[0] in done_lecture_ids,
                    } for l in cur.fetchall()]
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT id, title, passing_score FROM camp_tests "
                        f"WHERE module_id = {esc(m[0])} AND is_final = FALSE LIMIT 1"
                    )
                    test_row = cur.fetchone()
                test = None
                if test_row:
                    tr = test_results.get(test_row[0])
                    test = {'id': test_row[0], 'title': test_row[1], 'passing_score': test_row[2],
                            'passed': tr['passed'] if tr else False, 'score': tr['score'] if tr else None}
                module_list.append({'id': m[0], 'title': m[1], 'lectures': lectures, 'test': test})

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, passing_score FROM camp_tests "
                    f"WHERE program_id = {esc(program_id)} AND is_final = TRUE LIMIT 1"
                )
                final_row = cur.fetchone()
            final_test = None
            if final_row:
                tr = test_results.get(final_row[0])
                final_test = {'id': final_row[0], 'title': final_row[1], 'passing_score': final_row[2],
                              'passed': tr['passed'] if tr else False, 'score': tr['score'] if tr else None}

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT cert_number, pdf_url FROM camp_certificates "
                    f"WHERE student_id = {esc(student['id'])} AND program_id = {esc(program_id)} LIMIT 1"
                )
                cert_row = cur.fetchone()
            certificate = {'cert_number': cert_row[0], 'pdf_url': cert_row[1]} if cert_row else None

            return resp(200, {
                'program': {'id': prog[0], 'title': prog[1], 'description': prog[2]},
                'modules': module_list, 'final_test': final_test, 'certificate': certificate,
            })

        if action == 'lecture-complete' and method == 'POST':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            lecture_id = int(body.get('lecture_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO camp_lecture_progress (student_id, lecture_id) "
                    f"VALUES ({esc(student['id'])}, {esc(lecture_id)}) "
                    f"ON CONFLICT (student_id, lecture_id) DO NOTHING"
                )
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # СТУДЕНТ: ТЕСТЫ
        # ══════════════════════════════════════════════════════

        if action == 'test' and method == 'GET':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            test_id = int(qs.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, passing_score, program_id FROM camp_tests WHERE id = {esc(test_id)} LIMIT 1"
                )
                test_row = cur.fetchone()
            if not test_row: return resp(404, {'error': 'Тест не найден'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, question FROM camp_questions WHERE test_id = {esc(test_id)} ORDER BY sort_order, id"
                )
                questions = cur.fetchall()
            q_list = []
            for q in questions:
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT id, answer_text FROM camp_answers WHERE question_id = {esc(q[0])} ORDER BY sort_order, id"
                    )
                    answers = [{'id': a[0], 'answer_text': a[1]} for a in cur.fetchall()]
                q_list.append({'id': q[0], 'question': q[1], 'answers': answers})
            return resp(200, {'test': {
                'id': test_row[0], 'title': test_row[1], 'passing_score': test_row[2],
                'questions': q_list,
            }})

        if action == 'test-submit' and method == 'POST':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            body = json.loads(event.get('body') or '{}')
            test_id = int(body.get('test_id', 0))
            given = body.get('answers') or {}  # {question_id: answer_id}

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, passing_score, program_id, is_final FROM camp_tests WHERE id = {esc(test_id)} LIMIT 1"
                )
                test_row = cur.fetchone()
            if not test_row: return resp(404, {'error': 'Тест не найден'})
            _, test_title, passing_score, program_id, is_final = test_row

            with conn.cursor() as cur:
                cur.execute(f"SELECT id FROM camp_questions WHERE test_id = {esc(test_id)}")
                q_ids = [r[0] for r in cur.fetchall()]

            correct_count = 0
            for qid in q_ids:
                answer_id = given.get(str(qid)) or given.get(qid)
                if not answer_id: continue
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT is_correct FROM camp_answers WHERE id = {esc(int(answer_id))} AND question_id = {esc(qid)} LIMIT 1"
                    )
                    r = cur.fetchone()
                if r and r[0]:
                    correct_count += 1

            score = round((correct_count / len(q_ids)) * 100) if q_ids else 0
            passed = score >= passing_score

            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO camp_test_attempts (student_id, test_id, score, passed) "
                    f"VALUES ({esc(student['id'])}, {esc(test_id)}, {esc(score)}, {esc(passed)})"
                )
            conn.commit()

            certificate = None
            if passed and is_final:
                with conn.cursor() as cur:
                    cur.execute(f"SELECT title FROM camp_programs WHERE id = {esc(program_id)} LIMIT 1")
                    prog_title = cur.fetchone()[0]
                    cur.execute(
                        f"UPDATE camp_enrollments SET status = 'completed', completed_at = NOW() "
                        f"WHERE student_id = {esc(student['id'])} AND program_id = {esc(program_id)}"
                    )
                conn.commit()
                certificate = issue_certificate(conn, student['id'], program_id, student['full_name'], prog_title)

            return resp(200, {'score': score, 'passed': passed, 'certificate': certificate})

        # ══════════════════════════════════════════════════════
        # СТУДЕНТ: СЕРТИФИКАТЫ
        # ══════════════════════════════════════════════════════

        if action == 'my-certificates' and method == 'GET':
            student = get_student(conn, event)
            if not student: return resp(401, {'error': 'Не авторизован'})
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT c.id, c.cert_number, c.pdf_url, c.issued_at, p.title "
                    f"FROM camp_certificates c JOIN camp_programs p ON p.id = c.program_id "
                    f"WHERE c.student_id = {esc(student['id'])} ORDER BY c.issued_at DESC"
                )
                rows = cur.fetchall()
            return resp(200, {'certificates': [{
                'id': r[0], 'cert_number': r[1], 'pdf_url': r[2], 'issued_at': str(r[3]), 'program_title': r[4],
            } for r in rows]})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ПРОГРАММЫ
        # ══════════════════════════════════════════════════════

        if action == 'admin-programs' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, title, description, image_url, duration_label, level, sort_order, is_active "
                    "FROM camp_programs ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'programs': [{
                'id': r[0], 'title': r[1], 'description': r[2], 'image_url': r[3],
                'duration_label': r[4], 'level': r[5], 'sort_order': r[6], 'is_active': r[7],
            } for r in rows]})

        if action == 'admin-program-save' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            pid = body.get('id')
            fields = {
                'title': body.get('title', ''), 'description': body.get('description', ''),
                'image_url': body.get('image_url', ''), 'duration_label': body.get('duration_label', ''),
                'level': body.get('level', 'Начальный'), 'sort_order': int(body.get('sort_order', 0)),
                'is_active': bool(body.get('is_active', True)),
            }
            with conn.cursor() as cur:
                if pid:
                    sets = ', '.join(f"{k} = {esc(v)}" for k, v in fields.items())
                    cur.execute(f"UPDATE camp_programs SET {sets} WHERE id = {esc(int(pid))}")
                    new_id = int(pid)
                else:
                    cols = ', '.join(fields.keys())
                    vals = ', '.join(esc(v) for v in fields.values())
                    cur.execute(f"INSERT INTO camp_programs ({cols}) VALUES ({vals}) RETURNING id")
                    new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'admin-program-delete' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            pid = int(body.get('id', 0))
            with conn.cursor() as cur:
                cur.execute(f"UPDATE camp_programs SET is_active = FALSE WHERE id = {esc(pid)}")
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: МОДУЛИ
        # ══════════════════════════════════════════════════════

        if action == 'admin-modules' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            program_id = int(qs.get('program_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, sort_order, is_active FROM camp_modules "
                    f"WHERE program_id = {esc(program_id)} ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'modules': [{
                'id': r[0], 'title': r[1], 'sort_order': r[2], 'is_active': r[3],
            } for r in rows]})

        if action == 'admin-module-save' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            mid = body.get('id')
            with conn.cursor() as cur:
                if mid:
                    cur.execute(
                        f"UPDATE camp_modules SET title = {esc(body.get('title',''))}, "
                        f"sort_order = {esc(int(body.get('sort_order',0)))} WHERE id = {esc(int(mid))}"
                    )
                    new_id = int(mid)
                else:
                    cur.execute(
                        f"INSERT INTO camp_modules (program_id, title, sort_order) VALUES "
                        f"({esc(int(body.get('program_id',0)))}, {esc(body.get('title',''))}, {esc(int(body.get('sort_order',0)))}) RETURNING id"
                    )
                    new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'admin-module-delete' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(f"UPDATE camp_modules SET is_active = FALSE WHERE id = {esc(int(body.get('id',0)))}")
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ЛЕКЦИИ
        # ══════════════════════════════════════════════════════

        if action == 'admin-lectures' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            module_id = int(qs.get('module_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, title, content, video_url, file_url, sort_order, is_active "
                    f"FROM camp_lectures WHERE module_id = {esc(module_id)} ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'lectures': [{
                'id': r[0], 'title': r[1], 'content': r[2], 'video_url': r[3],
                'file_url': r[4], 'sort_order': r[5], 'is_active': r[6],
            } for r in rows]})

        if action == 'admin-lecture-save' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            lid = body.get('id')
            fields = {
                'title': body.get('title', ''), 'content': body.get('content', ''),
                'video_url': body.get('video_url', ''), 'file_url': body.get('file_url', ''),
                'sort_order': int(body.get('sort_order', 0)),
            }
            with conn.cursor() as cur:
                if lid:
                    sets = ', '.join(f"{k} = {esc(v)}" for k, v in fields.items())
                    cur.execute(f"UPDATE camp_lectures SET {sets} WHERE id = {esc(int(lid))}")
                    new_id = int(lid)
                else:
                    cols = ', '.join(['module_id'] + list(fields.keys()))
                    vals = ', '.join([esc(int(body.get('module_id', 0)))] + [esc(v) for v in fields.values()])
                    cur.execute(f"INSERT INTO camp_lectures ({cols}) VALUES ({vals}) RETURNING id")
                    new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'admin-lecture-delete' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(f"UPDATE camp_lectures SET is_active = FALSE WHERE id = {esc(int(body.get('id',0)))}")
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ТЕСТЫ И ВОПРОСЫ
        # ══════════════════════════════════════════════════════

        if action == 'admin-tests' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            program_id = int(qs.get('program_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, module_id, title, is_final, passing_score, sort_order "
                    f"FROM camp_tests WHERE program_id = {esc(program_id)} ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            return resp(200, {'tests': [{
                'id': r[0], 'module_id': r[1], 'title': r[2], 'is_final': r[3],
                'passing_score': r[4], 'sort_order': r[5],
            } for r in rows]})

        if action == 'admin-test-save' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            tid = body.get('id')
            fields = {
                'title': body.get('title', ''), 'is_final': bool(body.get('is_final', False)),
                'passing_score': int(body.get('passing_score', 70)), 'sort_order': int(body.get('sort_order', 0)),
                'module_id': body.get('module_id') or None,
            }
            with conn.cursor() as cur:
                if tid:
                    sets = ', '.join(f"{k} = {esc(v)}" for k, v in fields.items())
                    cur.execute(f"UPDATE camp_tests SET {sets} WHERE id = {esc(int(tid))}")
                    new_id = int(tid)
                else:
                    cols = ', '.join(['program_id'] + list(fields.keys()))
                    vals = ', '.join([esc(int(body.get('program_id', 0)))] + [esc(v) for v in fields.values()])
                    cur.execute(f"INSERT INTO camp_tests ({cols}) VALUES ({vals}) RETURNING id")
                    new_id = cur.fetchone()[0]
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'admin-test-delete' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM camp_tests WHERE id = {esc(int(body.get('id',0)))}")
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'admin-questions' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            test_id = int(qs.get('test_id', 0))
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, question, sort_order FROM camp_questions WHERE test_id = {esc(test_id)} ORDER BY sort_order, id"
                )
                questions = cur.fetchall()
            q_list = []
            for q in questions:
                with conn.cursor() as cur:
                    cur.execute(
                        f"SELECT id, answer_text, is_correct, sort_order FROM camp_answers "
                        f"WHERE question_id = {esc(q[0])} ORDER BY sort_order, id"
                    )
                    answers = [{'id': a[0], 'answer_text': a[1], 'is_correct': a[2], 'sort_order': a[3]} for a in cur.fetchall()]
                q_list.append({'id': q[0], 'question': q[1], 'sort_order': q[2], 'answers': answers})
            return resp(200, {'questions': q_list})

        if action == 'admin-question-save' and method == 'POST':
            """Сохраняет вопрос вместе с ответами (полная замена ответов)."""
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            qid = body.get('id')
            answers = body.get('answers') or []
            with conn.cursor() as cur:
                if qid:
                    cur.execute(
                        f"UPDATE camp_questions SET question = {esc(body.get('question',''))}, "
                        f"sort_order = {esc(int(body.get('sort_order',0)))} WHERE id = {esc(int(qid))}"
                    )
                    new_id = int(qid)
                    cur.execute(f"DELETE FROM camp_answers WHERE question_id = {esc(new_id)}")
                else:
                    cur.execute(
                        f"INSERT INTO camp_questions (test_id, question, sort_order) VALUES "
                        f"({esc(int(body.get('test_id',0)))}, {esc(body.get('question',''))}, {esc(int(body.get('sort_order',0)))}) RETURNING id"
                    )
                    new_id = cur.fetchone()[0]
                for i, a in enumerate(answers):
                    cur.execute(
                        f"INSERT INTO camp_answers (question_id, answer_text, is_correct, sort_order) "
                        f"VALUES ({esc(new_id)}, {esc(a.get('answer_text',''))}, {esc(bool(a.get('is_correct',False)))}, {esc(i)})"
                    )
            conn.commit()
            return resp(200, {'id': new_id})

        if action == 'admin-question-delete' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM camp_questions WHERE id = {esc(int(body.get('id',0)))}")
            conn.commit()
            return resp(200, {'ok': True})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: СТУДЕНТЫ
        # ══════════════════════════════════════════════════════

        if action == 'admin-students' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            search = qs.get('search', '').strip()
            where = ''
            if search:
                where = f"WHERE s.email ILIKE {esc('%'+search+'%')} OR s.full_name ILIKE {esc('%'+search+'%')}"
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT s.id, s.email, s.full_name, s.phone, s.is_active, s.created_at, "
                    f"COUNT(DISTINCT e.id) as enrollments, COUNT(DISTINCT c.id) as certs "
                    f"FROM camp_students s "
                    f"LEFT JOIN camp_enrollments e ON e.student_id = s.id "
                    f"LEFT JOIN camp_certificates c ON c.student_id = s.id "
                    f"{where} GROUP BY s.id ORDER BY s.created_at DESC LIMIT 200"
                )
                rows = cur.fetchall()
            return resp(200, {'students': [{
                'id': r[0], 'email': r[1], 'full_name': r[2], 'phone': r[3],
                'is_active': r[4], 'created_at': str(r[5]), 'enrollments': r[6], 'certificates': r[7],
            } for r in rows]})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ШАБЛОН СЕРТИФИКАТА
        # ══════════════════════════════════════════════════════

        if action == 'admin-cert-template' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT template_url, preview_url, page_width, page_height, "
                    "name_x, name_y, name_size, name_color, name_align, "
                    "date_x, date_y, date_size, date_color, date_align, "
                    "number_x, number_y, number_size, number_color, number_align "
                    "FROM camp_certificate_template WHERE id = 1 LIMIT 1"
                )
                r = cur.fetchone()
            if not r: return resp(200, {'template': None})
            return resp(200, {'template': {
                'template_url': r[0], 'preview_url': r[1], 'page_width': r[2], 'page_height': r[3],
                'name_x': r[4], 'name_y': r[5], 'name_size': r[6], 'name_color': r[7], 'name_align': r[8],
                'date_x': r[9], 'date_y': r[10], 'date_size': r[11], 'date_color': r[12], 'date_align': r[13],
                'number_x': r[14], 'number_y': r[15], 'number_size': r[16], 'number_color': r[17], 'number_align': r[18],
            }})

        if action == 'admin-cert-template-upload' and method == 'POST':
            """Загружает PDF-шаблон сертификата, кладёт в S3, рендерит превью-картинку и сохраняет размеры страницы."""
            admin = get_admin(conn, event)
            if not admin: return resp(403, {'error': 'Только для админа'})
            import base64, uuid
            data = json.loads(event.get('body') or '{}')
            file_b64 = data.get('file') or ''
            file_bytes = base64.b64decode(file_b64)

            png_bytes, page_w, page_h = render_template_preview(file_bytes)

            uid = uuid.uuid4()
            template_key = f"camp/cert-template/{uid}.pdf"
            preview_key = f"camp/cert-template/{uid}.png"
            s3 = s3_client()
            s3.put_object(Bucket='files', Key=template_key, Body=file_bytes, ContentType='application/pdf')
            s3.put_object(Bucket='files', Key=preview_key, Body=png_bytes, ContentType='image/png')
            base = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket"
            template_url = f"{base}/{template_key}"
            preview_url = f"{base}/{preview_key}"

            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE camp_certificate_template SET template_url = {esc(template_url)}, "
                    f"preview_url = {esc(preview_url)}, page_width = {esc(page_w)}, page_height = {esc(page_h)}, "
                    f"updated_at = NOW() WHERE id = 1"
                )
            conn.commit()
            return resp(200, {'template_url': template_url, 'preview_url': preview_url, 'page_width': page_w, 'page_height': page_h})

        if action == 'admin-cert-template-save' and method == 'POST':
            """Сохраняет координаты и стили полей ФИО/даты/номера на шаблоне."""
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            body = json.loads(event.get('body') or '{}')
            fields = {
                'name_x': float(body.get('name_x', 0.5)), 'name_y': float(body.get('name_y', 0.45)),
                'name_size': int(body.get('name_size', 28)), 'name_color': body.get('name_color', '#141414'),
                'name_align': body.get('name_align', 'center'),
                'date_x': float(body.get('date_x', 0.25)), 'date_y': float(body.get('date_y', 0.85)),
                'date_size': int(body.get('date_size', 12)), 'date_color': body.get('date_color', '#6e6e6e'),
                'date_align': body.get('date_align', 'left'),
                'number_x': float(body.get('number_x', 0.75)), 'number_y': float(body.get('number_y', 0.85)),
                'number_size': int(body.get('number_size', 12)), 'number_color': body.get('number_color', '#6e6e6e'),
                'number_align': body.get('number_align', 'right'),
            }
            sets = ', '.join(f"{k} = {esc(v)}" for k, v in fields.items())
            with conn.cursor() as cur:
                cur.execute(f"UPDATE camp_certificate_template SET {sets}, updated_at = NOW() WHERE id = 1")
            conn.commit()
            return resp(200, {'ok': True})

        if action == 'admin-cert-template-test' and method == 'POST':
            """Генерирует тестовый PDF с демо-данными для проверки расположения полей, не сохраняя в БД."""
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            template = get_cert_template(conn)
            if not template: return resp(400, {'error': 'Сначала загрузите шаблон'})
            with urllib.request.urlopen(template['template_url']) as f:
                template_bytes = f.read()
            pdf_bytes = build_certificate_from_template(
                template_bytes, template, 'Иван Иванов', 'CAMP-2026-000000', datetime.now().strftime('%d.%m.%Y')
            )
            import base64
            key = f"camp/cert-template/test-preview-{secrets.token_hex(6)}.pdf"
            s3 = s3_client()
            s3.put_object(Bucket='files', Key=key, Body=pdf_bytes, ContentType='application/pdf')
            url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            return resp(200, {'url': url})

        # ══════════════════════════════════════════════════════
        # АДМИНКА: ВЫДАННЫЕ СЕРТИФИКАТЫ
        # ══════════════════════════════════════════════════════

        if action == 'admin-certificates' and method == 'GET':
            admin = get_admin(conn, event)
            if not admin: return resp(401, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT c.id, c.cert_number, c.pdf_url, c.issued_at, s.full_name, s.email, p.title "
                    "FROM camp_certificates c "
                    "JOIN camp_students s ON s.id = c.student_id "
                    "JOIN camp_programs p ON p.id = c.program_id "
                    "ORDER BY c.issued_at DESC LIMIT 300"
                )
                rows = cur.fetchall()
            return resp(200, {'certificates': [{
                'id': r[0], 'cert_number': r[1], 'pdf_url': r[2], 'issued_at': str(r[3]),
                'student_name': r[4], 'student_email': r[5], 'program_title': r[6],
            } for r in rows]})

        # ══════════════════════════════════════════════════════
        # ЗАГРУЗКА ФАЙЛОВ (S3)
        # ══════════════════════════════════════════════════════

        if action == 'upload' and method == 'POST':
            admin = get_admin(conn, event)
            if not admin: return resp(403, {'error': 'Только для админа'})
            import base64, uuid
            data = json.loads(event.get('body') or '{}')
            file_b64 = data.get('file') or ''
            ext = (data.get('ext') or 'jpg').lower().strip('.')
            content_types = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
                              'webp': 'image/webp', 'pdf': 'application/pdf', 'mp4': 'video/mp4'}
            ct = content_types.get(ext, 'application/octet-stream')
            file_bytes = base64.b64decode(file_b64)
            key = f"camp/uploads/{uuid.uuid4()}.{ext}"
            s3 = s3_client()
            s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=ct)
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            return resp(200, {'url': cdn_url})

        return resp(404, {'error': 'Неизвестное действие'})
    finally:
        conn.close()