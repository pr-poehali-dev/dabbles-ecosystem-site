"""
Наложение динамических полей (ФИО, дата, номер) на готовый PDF-шаблон сертификата.
Используется PyMuPDF (fitz) для рендеринга превью и вставки текста с поддержкой кириллицы.
"""
import os
import fitz  # PyMuPDF

FONT_CANDIDATES = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
]


def _resolve_font():
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return path
    return None


def _hex_to_rgb01(hex_color):
    hex_color = (hex_color or '#000000').lstrip('#')
    if len(hex_color) != 6:
        hex_color = '000000'
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    return (r, g, b)


def render_template_preview(pdf_bytes: bytes, scale: float = 1.6):
    """Открывает PDF-шаблон, рендерит первую страницу в PNG для превью в админке.
    Возвращает (png_bytes, page_width_pt, page_height_pt)."""
    doc = fitz.open(stream=pdf_bytes, filetype='pdf')
    page = doc[0]
    rect = page.rect
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale))
    png_bytes = pix.tobytes('png')
    doc.close()
    return png_bytes, rect.width, rect.height


def _draw_field(page, font_path, text, x_frac, y_frac, size, color_hex, align):
    rect = page.rect
    x = x_frac * rect.width
    y = y_frac * rect.height
    color = _hex_to_rgb01(color_hex)

    if font_path:
        font = fitz.Font(fontfile=font_path)
        text_width = font.text_length(text, fontsize=size)
    else:
        text_width = len(text) * size * 0.5

    if align == 'center':
        x -= text_width / 2
    elif align == 'right':
        x -= text_width

    kwargs = {'fontsize': size, 'color': color}
    if font_path:
        kwargs['fontfile'] = font_path
        kwargs['fontname'] = 'CertBody'
    page.insert_text(fitz.Point(x, y), text, **kwargs)


def build_certificate_from_template(
    template_bytes: bytes,
    config: dict,
    full_name: str,
    cert_number: str,
    date_str: str,
    course_title: str = '',
) -> bytes:
    """Накладывает ФИО, дату, номер и название курса на PDF-шаблон по координатам из конфига (доли 0..1 от размера страницы)."""
    font_path = _resolve_font()
    doc = fitz.open(stream=template_bytes, filetype='pdf')
    page = doc[0]

    _draw_field(page, font_path, full_name, config['name_x'], config['name_y'],
                config['name_size'], config['name_color'], config['name_align'])
    _draw_field(page, font_path, date_str, config['date_x'], config['date_y'],
                config['date_size'], config['date_color'], config['date_align'])
    _draw_field(page, font_path, cert_number, config['number_x'], config['number_y'],
                config['number_size'], config['number_color'], config['number_align'])
    if course_title and 'course_x' in config:
        _draw_field(page, font_path, course_title, config['course_x'], config['course_y'],
                    config['course_size'], config['course_color'], config['course_align'])

    out = doc.tobytes()
    doc.close()
    return out