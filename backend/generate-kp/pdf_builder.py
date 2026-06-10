"""
PDF-генератор КП на базе fpdf2 с полной поддержкой кириллицы.
Использует системный TrueType-шрифт (DejaVu / Liberation / FreeSans),
встраивая его в PDF — поэтому кириллица отображается корректно.
"""
import os
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
    def __init__(self, has_cyrillic):
        super().__init__(format='A4', unit='mm')
        self.has_cyrillic = has_cyrillic
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(18, 18, 18)

    def use_font(self, bold=False, size=10):
        if self.has_cyrillic:
            self.set_font('Body', 'B' if bold else '', size)
        else:
            self.set_font('Helvetica', 'B' if bold else '', size)


def build_kp_pdf(blocks, items, total):
    reg_path, bold_path = _resolve_fonts()
    has_cyrillic = reg_path is not None

    pdf = KPDoc(has_cyrillic)
    if has_cyrillic:
        pdf.add_font('Body', '', reg_path, uni=True)
        pdf.add_font('Body', 'B', bold_path, uni=True)

    pdf.add_page()
    content_w = pdf.w - pdf.l_margin - pdf.r_margin

    def t(s):
        if has_cyrillic:
            return s
        return str(s).encode('latin-1', 'replace').decode('latin-1')

    def draw_para(s, bold=False, align='L', size=10):
        if not s.strip():
            pdf.ln(3)
            return
        pdf.use_font(bold, size)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(content_w, 6, t(s), align=align)

    def draw_items_table():
        col_w = [10, 74, 20, 18, 26, 26]
        scale = content_w / sum(col_w)
        col_w = [w * scale for w in col_w]
        headers = ['№', 'Наименование услуги', 'Ед.изм.', 'Кол-во', 'Цена, руб.', 'Сумма, руб.']
        row_h = 8

        pdf.use_font(True, 8)
        pdf.set_fill_color(26, 10, 110)
        pdf.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            pdf.cell(col_w[i], row_h, t(h), border=1, align='C', fill=True)
        pdf.ln()

        pdf.set_text_color(0, 0, 0)
        line_h = 4.5
        for idx, item in enumerate(items, 1):
            qty = item.get('qty', 1)
            price = item.get('price', 0)
            it_total = item.get('total', float(qty) * float(price))
            name = item.get('name', '')
            unit = item.get('unit', 'шт.')
            row = [str(idx), name, unit, str(qty), format_money(price), format_money(it_total)]
            fill = idx % 2 == 0
            pdf.use_font(False, 8)

            # Считаем высоту строки по длине наименования (колонка 1)
            try:
                lines = pdf.multi_cell(col_w[1], line_h, t(name), border=0, align='L',
                                       dry_run=True, output="LINES")
                name_lines = max(1, len(lines))
            except Exception:
                # фолбэк: оценка по средней ширине символа
                avg_char_mm = 1.6
                chars_per_line = max(1, int(col_w[1] / avg_char_mm))
                name_lines = max(1, -(-len(name) // chars_per_line))
            r_h = max(row_h, name_lines * line_h + 2)

            # Проверка переноса страницы
            if pdf.get_y() + r_h > pdf.h - pdf.b_margin:
                pdf.add_page()

            x0 = pdf.get_x()
            y0 = pdf.get_y()

            # Фон строки
            if fill:
                pdf.set_fill_color(240, 240, 245)
                pdf.rect(x0, y0, sum(col_w), r_h, style='F')

            cx = x0
            for i, val in enumerate(row):
                # Рамка ячейки на всю высоту строки
                pdf.rect(cx, y0, col_w[i], r_h)
                if i == 1:
                    pdf.set_xy(cx, y0 + 1)
                    pdf.multi_cell(col_w[i], line_h, t(str(val)), border=0, align='L')
                else:
                    pad = (r_h - line_h) / 2
                    pdf.set_xy(cx, y0 + pad)
                    pdf.cell(col_w[i], line_h, t(str(val)), border=0, align='C')
                cx += col_w[i]
            pdf.set_xy(x0, y0 + r_h)

        pdf.set_fill_color(232, 232, 239)
        pdf.use_font(True, 8)
        total_label_w = sum(col_w[:5])
        pdf.cell(total_label_w, row_h, t('ИТОГО:'), border=1, align='R', fill=True)
        pdf.cell(col_w[5], row_h, t(format_money(total) + ' руб.'), border=1, align='C', fill=True)
        pdf.ln()

    def draw_docx_table(rows):
        if not rows:
            return
        nc = max(len(r) for r in rows)
        cw = content_w / nc
        for ri, row in enumerate(rows):
            pdf.use_font(ri == 0, 8)
            for ci in range(nc):
                val = row[ci] if ci < len(row) else ''
                pdf.cell(cw, 7, t(str(val))[:60], border=1, align='L')
            pdf.ln()
        pdf.ln(2)

    if not any(b['type'] == 'table_marker' for b in blocks):
        blocks.append({'type': 'spacer'})
        blocks.append({'type': 'table_marker'})

    for block in blocks:
        bt = block['type']
        if bt == 'para':
            align_val = block.get('align', 0)
            align = 'C' if align_val == 1 else ('R' if align_val == 2 else 'L')
            draw_para(block.get('text', ''), block.get('bold', False), align)
        elif bt == 'table_marker':
            pdf.ln(3)
            draw_items_table()
            pdf.ln(3)
        elif bt == 'spacer':
            pdf.ln(4)
        elif bt == 'docx_table':
            draw_docx_table(block.get('rows', []))

    out = pdf.output()
    return bytes(out)