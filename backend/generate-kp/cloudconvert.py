"""
Конвертация .docx → PDF через CloudConvert API (sync jobs).
Качество 1-в-1 с исходным Word-документом.
"""
import os
import json
import time
import base64
import urllib.request
import urllib.error

API_BASE = 'https://api.cloudconvert.com/v2'


def _post(path, payload, token):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        API_BASE + path, data=data, method='POST',
        headers={
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        })
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def _get(url, token):
    req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + token})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def _upload_file(form, file_bytes, filename):
    """Загружает файл по multipart на presigned URL из задачи import/upload."""
    url = form['url']
    params = form['parameters']
    boundary = '----CloudConvertBoundary7d91b2a4'
    body = bytearray()

    def add_field(name, value):
        body.extend(f'--{boundary}\r\n'.encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.extend(f'{value}\r\n'.encode())

    for k, v in params.items():
        add_field(k, v)

    body.extend(f'--{boundary}\r\n'.encode())
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode())
    body.extend(b'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n')
    body.extend(file_bytes)
    body.extend(f'\r\n--{boundary}--\r\n'.encode())

    req = urllib.request.Request(
        url, data=bytes(body), method='POST',
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.status


def docx_to_pdf(docx_bytes, filename='document.docx'):
    """
    Конвертирует .docx в PDF. Возвращает bytes PDF.
    Бросает RuntimeError при ошибке (вызывающий код использует fallback).
    """
    token = os.environ.get('CLOUDCONVERT_API_KEY', '').strip()
    if not token:
        raise RuntimeError('CLOUDCONVERT_API_KEY не задан')

    # Создаём job: import → convert → export
    job_payload = {
        'tasks': {
            'import-file': {'operation': 'import/upload'},
            'convert-file': {
                'operation': 'convert',
                'input': 'import-file',
                'output_format': 'pdf',
                'engine': 'libreoffice',
            },
            'export-file': {'operation': 'export/url', 'input': 'convert-file'},
        }
    }
    job = _post('/jobs', job_payload, token)['data']
    job_id = job['id']

    # Находим задачу загрузки и грузим файл
    upload_task = next(t for t in job['tasks'] if t['name'] == 'import-file')
    # Задача может быть ещё без формы — дождёмся
    form = upload_task.get('result', {}).get('form')
    if not form:
        for _ in range(10):
            time.sleep(1)
            t = _get(f'{API_BASE}/tasks/{upload_task["id"]}', token)['data']
            form = (t.get('result') or {}).get('form')
            if form:
                break
        if not form:
            raise RuntimeError('CloudConvert: не получена форма загрузки')

    _upload_file(form, docx_bytes, filename)

    # Ждём завершения job (polling)
    export_url = None
    for _ in range(40):  # до ~80 секунд
        time.sleep(2)
        st = _get(f'{API_BASE}/jobs/{job_id}', token)['data']
        status = st.get('status')
        if status == 'finished':
            exp = next(t for t in st['tasks'] if t['name'] == 'export-file')
            files = (exp.get('result') or {}).get('files') or []
            if files:
                export_url = files[0]['url']
            break
        if status == 'error':
            raise RuntimeError('CloudConvert: ошибка конвертации')

    if not export_url:
        raise RuntimeError('CloudConvert: PDF не готов (таймаут)')

    # Скачиваем PDF
    req = urllib.request.Request(export_url)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()
