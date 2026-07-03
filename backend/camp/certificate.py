"""
Генерация PDF-сертификата Кэмпа на базе fpdf2.
Полная поддержка кириллицы через встраивание TrueType-шрифта.
Цвета бренда: DAB332 (тёмно-жёлтый), EBD047 (жёлтый), белый, чёрный.
"""
import os
from datetime import datetime
from fpdf import FPDF

FONT_CANDIDATES = [
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
     '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/dejavu/DejaVuSans.ttf',
     '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
     '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/freefont/FreeSans.ttf',
     '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'),
]

DARK_YELLOW = (218, 179, 50)   # #DAB332
YELLOW = (235, 208, 71)        # #EBD047
BLACK = (20, 20, 20)
GREY = (110, 110, 110)


def _resolve_fonts():
    for reg, bold in FONT_CANDIDATES:
        if os.path.exists(reg):
            bold_path = bold if os.path.exists(bold) else reg
            return reg, bold_path
    return None, None


class CertPDF(FPDF):
    def __init__(self, has_cyrillic):
        super().__init__(format='A4', orientation='L', unit='mm')
        self.has_cyrillic = has_cyrillic
        self.set_margins(0, 0, 0)
        self.set_auto_page_break(False)

    def f(self, bold=False, size=12):
        if self.has_cyrillic:
            self.set_font('Body', 'B' if bold else '', size)
        else:
            self.set_font('Helvetica', 'B' if bold else '', size)

    def t(self, s):
        s = str(s)
        if self.has_cyrillic:
            return s
        return s.encode('latin-1', 'replace').decode('latin-1')


def build_certificate_pdf(full_name: str, program_title: str, cert_number: str, issued_at: str) -> bytes:
    reg_path, bold_path = _resolve_fonts()
    has_cyrillic = reg_path is not None

    pdf = CertPDF(has_cyrillic=has_cyrillic)
    if has_cyrillic:
        pdf.add_font('Body', '', reg_path, uni=True)
        pdf.add_font('Body', 'B', bold_path, uni=True)
    pdf.add_page()

    W, H = 297, 210

    # Рамка бренда
    pdf.set_fill_color(*YELLOW)
    pdf.rect(0, 0, W, H, 'F')
    pdf.set_fill_color(255, 255, 255)
    pdf.rect(8, 8, W - 16, H - 16, 'F')
    pdf.set_fill_color(*DARK_YELLOW)
    pdf.rect(8, 8, W - 16, 4, 'F')
    pdf.rect(8, H - 12, W - 16, 4, 'F')

    # Заголовок
    pdf.set_xy(0, 28)
    pdf.f(True, 34)
    pdf.set_text_color(*BLACK)
    pdf.cell(W, 14, pdf.t('СЕРТИФИКАТ'), align='C')

    pdf.set_xy(0, 44)
    pdf.f(False, 13)
    pdf.set_text_color(*GREY)
    pdf.cell(W, 8, pdf.t('КЭМП ОТ ДАББЛ.ОБРАЗОВАНИЯ'), align='C')

    # Разделитель
    pdf.set_draw_color(*DARK_YELLOW)
    pdf.set_line_width(0.8)
    pdf.line(W / 2 - 30, 58, W / 2 + 30, 58)

    # Текст "настоящим удостоверяется, что"
    pdf.set_xy(0, 72)
    pdf.f(False, 12)
    pdf.set_text_color(*GREY)
    pdf.cell(W, 8, pdf.t('настоящим удостоверяется, что'), align='C')

    # Имя
    pdf.set_xy(0, 84)
    pdf.f(True, 28)
    pdf.set_text_color(*BLACK)
    pdf.cell(W, 14, pdf.t(full_name), align='C')

    # Описание программы
    pdf.set_xy(30, 106)
    pdf.f(False, 13)
    pdf.set_text_color(*GREY)
    pdf.cell(W - 60, 8, pdf.t('успешно прошёл(а) программу обучения'), align='C')

    pdf.set_xy(30, 118)
    pdf.f(True, 18)
    pdf.set_text_color(*BLACK)
    pdf.multi_cell(W - 60, 9, pdf.t(program_title), align='C')

    # Дата и номер
    date_str = issued_at
    try:
        date_str = datetime.fromisoformat(issued_at.replace('Z', '')).strftime('%d.%m.%Y')
    except Exception:
        pass

    pdf.set_xy(30, H - 40)
    pdf.f(False, 10)
    pdf.set_text_color(*GREY)
    pdf.cell((W - 60) / 2, 6, pdf.t(f'Дата выдачи: {date_str}'), align='L')
    pdf.set_xy(30, H - 40)
    pdf.cell(W - 60, 6, pdf.t(f'№ {cert_number}'), align='R')

    # Подпись
    pdf.set_xy(30, H - 30)
    pdf.set_draw_color(*GREY)
    pdf.set_line_width(0.3)
    pdf.line(W - 100, H - 28, W - 40, H - 28)
    pdf.set_xy(W - 100, H - 26)
    pdf.f(False, 9)
    pdf.cell(60, 5, pdf.t('Даббл.Образование'), align='C')

    out = pdf.output(dest='S')
    if isinstance(out, str):
        out = out.encode('latin-1')
    return bytes(out)
