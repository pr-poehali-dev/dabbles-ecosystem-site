"""
PDF-генератор коммерческого предложения на базе fpdf2.
Формирует аккуратный документ с фирменной шапкой, реквизитами,
таблицей позиций и итогами. Полная поддержка кириллицы за счёт
встраивания TrueType-шрифта (DejaVu / Liberation).
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
    ('/usr/share/fonts/gnu-free/FreeSans.ttf',
     '/usr/share/fonts/gnu-free/FreeSansBold.ttf'),
]

LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_FONTS = [
    (os.path.join(LOCAL_DIR, 'DejaVuSans.ttf'),
     os.path.join(LOCAL_DIR, 'DejaVuSans-Bold.ttf')),
]

# Фирменные цвета Даббл
NAVY = (26, 10, 110)       # #1a0a6e
BLUE = (0, 119, 255)       # #0077FF
LIGHT = (240, 240, 245)    # #f0f0f5
GREY = (120, 120, 130)
DARK = (20, 20, 25)


def _resolve_fonts():
    for reg, bold in LOCAL_FONTS + FONT_CANDIDATES:
        if os.path.exists(reg):
            bold_path = bold if os.path.exists(bold) else reg
            return reg, bold_path
    return None, None


def format_money(val):
    try:
        f = float(val)
        return '{:,.2f}'.format(f).replace(',', '\u00a0').replace('.', ',')
    except Exception:
        return str(val)


class KPDoc(FPDF):
    def __init__(self, has_cyrillic, doc_number):
        super().__init__(format='A4', unit='mm')
        self.has_cyrillic = has_cyrillic
        self.doc_number = doc_number
        self.set_auto_page_break(auto=True, margin=22)
        self.set_margins(16, 16, 16)

    def f(self, bold=False, size=10):
        if self.has_cyrillic:
            self.set_font('Body', 'B' if bold else '', size)
        else:
            self.set_font('Helvetica', 'B' if bold else '', size)

    def footer(self):
        self.set_y(-16)
        self.f(False, 7)
        self.set_text_color(*GREY)
        self.cell(0, 5, self._t('ООО «ДАББЛ РУС»  ·  ИНН 8905069677  ·  ОГРН 1258900000050'),
                  align='C')
        self.set_y(-11)
        self.cell(0, 5, self._t(f'Документ № {self.doc_number}  ·  стр. {self.page_no()}'),
                  align='C')

    def _t(self, s):
        if self.has_cyrillic:
            return s
        return str(s).encode('latin-1', 'replace').decode('latin-1')


def build_kp_pdf(blocks, items, total, organization='', director_name='', doc_number=''):
    reg_path, bold_path = _resolve_fonts()
    has_cyrillic = reg_path is not None

    pdf = KPDoc(has_cyrillic, doc_number or '—')
    if has_cyrillic:
        pdf.add_font('Body', '', reg_path, uni=True)
        pdf.add_font('Body', 'B', bold_path, uni=True)

    pdf.add_page()
    content_w = pdf.w - pdf.l_margin - pdf.r_margin

    def t(s):
        return pdf._t(s)

    # ─────────── ШАПКА ───────────
    def draw_header():
        x0, y0 = pdf.get_x(), pdf.get_y()
        # Фон-плашка
        pdf.set_fill_color(*NAVY)
        pdf.rect(x0, y0, content_w, 26, style='F')
        # Название компании
        pdf.set_xy(x0 + 6, y0 + 5)
        pdf.f(True, 17)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 8, t('ДАББЛ'), align='L')
        pdf.set_xy(x0 + 6, y0 + 14)
        pdf.f(False, 8)
        pdf.set_text_color(200, 205, 230)
        pdf.cell(0, 5, t('Корпорация · экосистема сервисов для бизнеса'), align='L')
        # Номер и дата справа
        pdf.set_xy(x0, y0 + 5)
        pdf.f(True, 9)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(content_w - 6, 5, t(f'КП № {doc_number}'), align='R')
        pdf.set_xy(x0, y0 + 11)
        pdf.f(False, 8)
        pdf.set_text_color(200, 205, 230)
        pdf.cell(content_w - 6, 5, t('от ' + datetime.now().strftime('%d.%m.%Y')), align='R')
        pdf.set_xy(x0, y0 + 32)

    # ─────────── ЗАГОЛОВОК ДОКУМЕНТА ───────────
    def draw_title():
        pdf.f(True, 15)
        pdf.set_text_color(*DARK)
        pdf.cell(0, 9, t('Коммерческое предложение'), align='L')
        pdf.ln(11)

    # ─────────── РЕКВИЗИТЫ ПОЛУЧАТЕЛЯ ───────────
    def draw_recipient():
        x0, y0 = pdf.get_x(), pdf.get_y()
        pdf.set_fill_color(*LIGHT)
        box_h = 22
        pdf.rect(x0, y0, content_w, box_h, style='F')
        pdf.set_draw_color(*BLUE)
        pdf.set_line_width(0.8)
        pdf.line(x0, y0, x0, y0 + box_h)
        pdf.set_line_width(0.2)

        pdf.set_xy(x0 + 6, y0 + 4)
        pdf.f(False, 8)
        pdf.set_text_color(*GREY)
        pdf.cell(0, 4, t('КОМУ'), align='L')

        pdf.set_xy(x0 + 6, y0 + 9)
        pdf.f(True, 11)
        pdf.set_text_color(*DARK)
        pdf.cell(0, 5, t(organization or '—'), align='L')

        if director_name:
            pdf.set_xy(x0 + 6, y0 + 15)
            pdf.f(False, 9)
            pdf.set_text_color(80, 80, 90)
            pdf.cell(0, 4, t('Руководителю: ' + director_name), align='L')

        pdf.set_xy(x0, y0 + box_h + 6)

    # ─────────── ВВОДНЫЙ ТЕКСТ ───────────
    def draw_intro():
        pdf.f(False, 10)
        pdf.set_text_color(60, 60, 70)
        intro = ('Благодарим за интерес к услугам нашей компании. '
                 'Направляем вам коммерческое предложение со стоимостью '
                 'запрошенных позиций.')
        pdf.multi_cell(content_w, 5.5, t(intro), align='L')
        pdf.ln(4)

    # ─────────── ТАБЛИЦА ПОЗИЦИЙ ───────────
    def draw_items_table():
        col_w = [11, 78, 19, 17, 27, 27]
        scale = content_w / sum(col_w)
        col_w = [w * scale for w in col_w]
        headers = ['№', 'Наименование услуги', 'Ед.изм.', 'Кол-во', 'Цена, ₽', 'Сумма, ₽']
        head_h = 9

        # Заголовок
        pdf.f(True, 8)
        pdf.set_fill_color(*NAVY)
        pdf.set_text_color(255, 255, 255)
        pdf.set_draw_color(*NAVY)
        for i, h in enumerate(headers):
            a = 'L' if i == 1 else 'C'
            pdf.cell(col_w[i], head_h, t(h), border=0, align=a, fill=True)
        pdf.ln()

        pdf.set_draw_color(220, 220, 228)
        pdf.set_line_width(0.2)
        line_h = 5
        for idx, item in enumerate(items, 1):
            qty = item.get('qty', 1)
            price = item.get('price', 0)
            it_total = item.get('total', float(qty) * float(price))
            name = item.get('name', '')
            unit = item.get('unit', 'шт.')
            row = [str(idx), name, unit, str(qty), format_money(price), format_money(it_total)]
            fill = idx % 2 == 0
            pdf.f(False, 9)

            # высота строки по наименованию
            try:
                lines = pdf.multi_cell(col_w[1], line_h, t(name), border=0, align='L',
                                       dry_run=True, output="LINES")
                name_lines = max(1, len(lines))
            except Exception:
                chars_per_line = max(1, int(col_w[1] / 1.7))
                name_lines = max(1, -(-len(name) // chars_per_line))
            r_h = max(line_h + 4, name_lines * line_h + 3)

            if pdf.get_y() + r_h > pdf.h - pdf.b_margin:
                pdf.add_page()

            x0 = pdf.get_x()
            y0 = pdf.get_y()

            if fill:
                pdf.set_fill_color(247, 247, 250)
                pdf.rect(x0, y0, sum(col_w), r_h, style='F')

            cx = x0
            for i, val in enumerate(row):
                pdf.rect(cx, y0, col_w[i], r_h)
                if i == 1:
                    pdf.set_xy(cx + 2, y0 + 1.5)
                    pdf.set_text_color(*DARK)
                    pdf.multi_cell(col_w[i] - 4, line_h, t(str(val)), border=0, align='L')
                else:
                    pad = (r_h - line_h) / 2
                    pdf.set_xy(cx, y0 + pad)
                    pdf.set_text_color(50, 50, 60)
                    pdf.cell(col_w[i], line_h, t(str(val)), border=0, align='C')
                cx += col_w[i]
            pdf.set_xy(x0, y0 + r_h)

    # ─────────── ИТОГО ───────────
    def draw_total():
        pdf.ln(2)
        x0 = pdf.get_x()
        y0 = pdf.get_y()
        box_w = content_w * 0.42
        bx = x0 + content_w - box_w
        pdf.set_fill_color(*NAVY)
        pdf.rect(bx, y0, box_w, 13, style='F')
        pdf.set_xy(bx + 5, y0 + 4)
        pdf.f(True, 10)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(box_w * 0.4, 5, t('ИТОГО:'), align='L')
        pdf.f(True, 12)
        pdf.cell(box_w * 0.55 - 5, 5, t(format_money(total) + ' ₽'), align='R')
        pdf.set_xy(x0, y0 + 17)
        pdf.f(False, 8)
        pdf.set_text_color(*GREY)
        pdf.cell(0, 4, t('Цены указаны без учёта НДС, если иное не оговорено отдельно.'), align='L')
        pdf.ln(8)

    # ─────────── ПОДВАЛ-ПОДПИСЬ ───────────
    def draw_signature():
        pdf.ln(6)
        if pdf.get_y() > pdf.h - 50:
            pdf.add_page()
        pdf.f(False, 9)
        pdf.set_text_color(60, 60, 70)
        pdf.multi_cell(content_w, 5.5, t(
            'Предложение действительно в течение 14 календарных дней с даты формирования. '
            'Для уточнения деталей и оформления договора свяжитесь с нашим менеджером.'),
            align='L')
        pdf.ln(10)
        # Линия подписи
        x0 = pdf.get_x()
        y0 = pdf.get_y()
        pdf.set_draw_color(180, 180, 190)
        pdf.line(x0, y0, x0 + 70, y0)
        pdf.set_xy(x0, y0 + 2)
        pdf.f(False, 8)
        pdf.set_text_color(*GREY)
        pdf.cell(70, 4, t('Подпись уполномоченного лица'), align='C')

    # ─── Рендер ───
    draw_header()
    draw_title()
    draw_recipient()
    draw_intro()
    draw_items_table()
    draw_total()
    draw_signature()

    out = pdf.output()
    return bytes(out)
