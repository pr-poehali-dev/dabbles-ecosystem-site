"""
Минимальный PDF-генератор на чистом Python.
Поддерживает: кириллицу через встроенный CP1251/Latin1 хак,
параграфы, таблицы, базовое форматирование.
"""
import struct
import zlib

# A4 в points (1 pt = 1/72 дюйма)
PAGE_W = 595
PAGE_H = 842
MARGIN = 56  # ~2 cm


def encode_text(text: str) -> bytes:
    """Кодирует текст в PDFDocEncoding (latin-1 + замена кириллицы транслитом)."""
    TRANSLIT = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
        'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
        'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
        'щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z',
        'И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R',
        'С':'S','Т':'T','У':'U','Ф':'F','Х':'Kh','Ц':'Ts','Ч':'Ch','Ш':'Sh',
        'Щ':'Sch','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya',
        '\u00a0':' ',
    }
    result = []
    for ch in text:
        if ch in TRANSLIT:
            result.append(TRANSLIT[ch])
        else:
            result.append(ch)
    return ''.join(result).encode('latin-1', errors='replace')


def pdf_str(text: str) -> bytes:
    """Превращает строку в PDF-строку (latin-1)."""
    encoded = encode_text(text)
    escaped = encoded.replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')
    return b'(' + escaped + b')'


class PDF:
    def __init__(self):
        self.objects = []
        self.pages = []
        self._buf = []

    def _new_obj(self, content: bytes) -> int:
        idx = len(self.objects) + 1
        self.objects.append(content)
        return idx

    def build(self, pages_content: list) -> bytes:
        """
        pages_content: list of page dicts:
          {'stream': bytes, 'width': int, 'height': int}
        """
        out = bytearray()
        out += b'%PDF-1.4\n'

        offsets = []
        obj_id = 0

        def write_obj(obj_id: int, content: bytes):
            offsets.append(len(out))
            out.extend(f'{obj_id} 0 obj\n'.encode())
            out.extend(content)
            out.extend(b'\nendobj\n')

        # Объект 1 — каталог (заполним позже после pages)
        # Объект 2 — pages (заполним позже)
        # Объект 3 — шрифт Helvetica
        # Объект 4 — шрифт Helvetica-Bold
        # Объекты 5+ — страницы

        font_reg_id = 3
        font_bold_id = 4
        pages_id = 2
        catalog_id = 1

        # Считаем ID страниц
        page_ids = list(range(5, 5 + len(pages_content)))
        stream_ids = list(range(5 + len(pages_content), 5 + 2 * len(pages_content)))

        total_objs = 4 + len(pages_content) * 2

        # Placeholder offsets
        offsets = [0] * (total_objs + 1)

        out2 = bytearray()
        out2 += b'%PDF-1.4\n'
        obj_offsets = {}

        def wo(oid, content):
            obj_offsets[oid] = len(out2)
            out2.extend(f'{oid} 0 obj\n'.encode())
            out2.extend(content)
            out2.extend(b'\nendobj\n')

        # Шрифт Regular
        wo(font_reg_id, (
            b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica '
            b'/Encoding /WinAnsiEncoding >>'
        ))
        # Шрифт Bold
        wo(font_bold_id, (
            b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold '
            b'/Encoding /WinAnsiEncoding >>'
        ))

        # Стримы страниц
        for i, pg in enumerate(pages_content):
            stream = pg['stream']
            compressed = zlib.compress(stream)
            wo(stream_ids[i], (
                f'<< /Length {len(compressed)} /Filter /FlateDecode >>\nstream\n'.encode()
                + compressed + b'\nendstream'
            ))

        # Объекты страниц
        for i, pg in enumerate(pages_content):
            wo(page_ids[i], (
                f'<< /Type /Page /Parent {pages_id} 0 R '
                f'/MediaBox [0 0 {pg.get("width",PAGE_W)} {pg.get("height",PAGE_H)}] '
                f'/Contents {stream_ids[i]} 0 R '
                f'/Resources << /Font << /F1 {font_reg_id} 0 R /F2 {font_bold_id} 0 R >> >> >>'
            ).encode())

        # Pages
        kids = ' '.join(f'{pid} 0 R' for pid in page_ids)
        wo(pages_id, f'<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>'.encode())

        # Catalog
        wo(catalog_id, f'<< /Type /Catalog /Pages {pages_id} 0 R >>'.encode())

        # xref
        xref_offset = len(out2)
        out2 += b'xref\n'
        out2 += f'0 {max(obj_offsets)+2}\n'.encode()
        out2 += b'0000000000 65535 f \n'
        for oid in range(1, max(obj_offsets)+1):
            if oid in obj_offsets:
                out2 += f'{obj_offsets[oid]:010d} 00000 n \n'.encode()
            else:
                out2 += b'0000000000 65535 f \n'

        out2 += b'trailer\n'
        out2 += f'<< /Size {max(obj_offsets)+1} /Root {catalog_id} 0 R >>\n'.encode()
        out2 += b'startxref\n'
        out2 += f'{xref_offset}\n'.encode()
        out2 += b'%%EOF\n'

        return bytes(out2)


class PageWriter:
    """Пишет контент одной страницы."""

    def __init__(self, w=PAGE_W, h=PAGE_H, margin=MARGIN):
        self.w = w
        self.h = h
        self.m = margin
        self.content_w = w - 2 * margin
        self.x = margin
        self.y = h - margin
        self.ops = []
        self.font = 'F1'
        self.font_size = 10
        self.pages = []  # завершённые страницы
        self._start_page()

    def _start_page(self):
        self.y = self.h - self.m
        self.ops = []

    def _finish_page(self):
        self.pages.append({'stream': '\n'.join(self.ops).encode(), 'width': self.w, 'height': self.h})

    def _ensure_space(self, needed):
        if self.y - needed < self.m:
            self._finish_page()
            self._start_page()

    def set_font(self, bold=False, size=10):
        self.font = 'F2' if bold else 'F1'
        self.font_size = size
        self.ops.append(f'/{self.font} {size} Tf')

    def _char_width(self, ch):
        # Приблизительная ширина символа Helvetica в units/1000
        return 556  # среднее для Helvetica

    def text_width(self, text):
        return len(text) * self.font_size * 0.55

    def wrap_text(self, text, max_w):
        """Разбивает текст на строки шириной max_w."""
        if not text.strip():
            return ['']
        words = text.split(' ')
        lines = []
        current = ''
        for word in words:
            test = (current + ' ' + word).strip()
            if self.text_width(test) <= max_w:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines if lines else ['']

    def draw_text_line(self, text, x=None, bold=False, size=None, align='left', max_w=None):
        if x is None:
            x = self.m
        if size is None:
            size = self.font_size
        font = 'F2' if bold else 'F1'
        if max_w is None:
            max_w = self.content_w

        self.ops.append(f'/{font} {size} Tf')
        line_h = size * 1.4

        lines = self.wrap_text(text, max_w)
        for line in lines:
            self._ensure_space(line_h + 2)
            enc = encode_text(line)
            escaped = enc.replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')
            tw = self.text_width(line)
            if align == 'center':
                lx = x + (max_w - tw) / 2
            elif align == 'right':
                lx = x + max_w - tw
            else:
                lx = x
            py = self.y - line_h
            self.ops.append('BT')
            self.ops.append(f'{lx:.2f} {py:.2f} Td')
            self.ops.append(f'({escaped.decode("latin-1")}) Tj')
            self.ops.append('ET')
            self.y -= line_h

    def draw_para(self, text, bold=False, size=10, align='left', space_after=4):
        if not text.strip():
            self.y -= size * 0.6
            return
        self._ensure_space(size * 1.4)
        self.draw_text_line(text, bold=bold, size=size, align=align)
        self.y -= space_after

    def draw_hline(self, color=(0.8, 0.8, 0.8), width=0.5):
        self._ensure_space(4)
        r, g, b = color
        self.ops.append(f'{r:.2f} {g:.2f} {b:.2f} RG')
        self.ops.append(f'{width:.1f} w')
        self.ops.append(f'{self.m:.2f} {self.y:.2f} m {self.w - self.m:.2f} {self.y:.2f} l S')
        self.y -= 4

    def draw_rect_filled(self, x, y, w, h, r=0.9, g=0.9, b=0.9):
        self.ops.append(f'{r:.3f} {g:.3f} {b:.3f} rg')
        self.ops.append(f'{x:.2f} {y:.2f} {w:.2f} {h:.2f} re f')
        self.ops.append('0 0 0 rg')

    def draw_table(self, rows, col_widths, header_bg=(0.1, 0.04, 0.43), row_alt=(0.94, 0.94, 0.96)):
        """Рисует таблицу. rows[0] — заголовок."""
        row_h = 18
        total_w = sum(col_widths)
        font_size = 8

        for ri, row in enumerate(rows):
            self._ensure_space(row_h + 2)
            ry = self.y - row_h

            # Фон строки
            if ri == 0:
                r, g, b = header_bg
                self.ops.append(f'{r:.3f} {g:.3f} {b:.3f} rg')
                self.ops.append(f'{self.m:.2f} {ry:.2f} {total_w:.2f} {row_h:.2f} re f')
                text_color = '1 1 1'
                font = 'F2'
            elif ri == len(rows) - 1:  # итог
                self.ops.append(f'0.91 0.91 0.94 rg')
                self.ops.append(f'{self.m:.2f} {ry:.2f} {total_w:.2f} {row_h:.2f} re f')
                text_color = '0 0 0'
                font = 'F2'
            else:
                if ri % 2 == 0:
                    ra, ga, ba = row_alt
                    self.ops.append(f'{ra:.3f} {ga:.3f} {ba:.3f} rg')
                    self.ops.append(f'{self.m:.2f} {ry:.2f} {total_w:.2f} {row_h:.2f} re f')
                text_color = '0 0 0'
                font = 'F1'

            self.ops.append('0 0 0 rg')

            # Сетка
            self.ops.append('0.75 0.75 0.75 RG')
            self.ops.append('0.4 w')
            cx = self.m
            for cw in col_widths:
                self.ops.append(f'{cx:.2f} {ry:.2f} {cw:.2f} {row_h:.2f} re S')
                cx += cw

            # Текст ячеек
            cx = self.m
            for ci, cell in enumerate(row):
                cell_text = str(cell)
                enc = encode_text(cell_text)
                escaped = enc.replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')
                tw = len(cell_text) * font_size * 0.55
                cw = col_widths[ci]
                # Выравнивание: 0 и 1 столбцы - по левому, остальные - по центру
                if ci <= 1:
                    tx = cx + 3
                else:
                    tx = cx + max(0, (cw - tw) / 2)
                ty = ry + 5

                self.ops.append(f'{text_color} rg')
                self.ops.append('BT')
                self.ops.append(f'/{font} {font_size} Tf')
                self.ops.append(f'{tx:.2f} {ty:.2f} Td')
                self.ops.append(f'({escaped.decode("latin-1")}) Tj')
                self.ops.append('ET')
                cx += cw

            self.y -= row_h

    def finish(self):
        self._finish_page()
        return self.pages


def build_kp_pdf(blocks, items, total):
    """Генерирует PDF из блоков контента и таблицы позиций."""
    pw = PageWriter()

    def fmt(val):
        try:
            f = float(val)
            return '{:,.2f}'.format(f).replace(',', ' ')
        except Exception:
            return str(val)

    def draw_items_table():
        col_w = [26, 210, 55, 48, 72, 72]
        headers = ['No', 'Naimenovanie', 'Ed.izm.', 'Kol.', 'Tsena', 'Summa']
        # Используем транслит для заголовков уже в encode
        header_labels = ['#', 'Naimenovanie uslugi', 'Ed.izm.', 'Kol-vo', 'Tsena, rub.', 'Summa, rub.']
        rows = [header_labels]
        for idx, item in enumerate(items, 1):
            qty = item.get('qty', 1)
            price = item.get('price', 0)
            it_total = item.get('total', float(qty) * float(price))
            rows.append([
                str(idx),
                item.get('name', ''),
                item.get('unit', 'sht.'),
                str(qty),
                fmt(price),
                fmt(it_total),
            ])
        rows.append(['', '', '', '', 'ITOGO:', fmt(total) + ' rub.'])
        pw.draw_table(rows, col_w)

    has_marker = any(b['type'] == 'table_marker' for b in blocks)
    if not has_marker:
        blocks.append({'type': 'spacer'})
        blocks.append({'type': 'table_marker'})

    for block in blocks:
        t = block['type']
        if t == 'para':
            text = block.get('text', '')
            bold = block.get('bold', False)
            align_val = block.get('align', 0)
            if align_val == 1:  # TA_CENTER
                align = 'center'
            elif align_val == 2:  # TA_RIGHT
                align = 'right'
            else:
                align = 'left'
            pw.draw_para(text, bold=bold, align=align)
        elif t == 'table_marker':
            pw.y -= 6
            draw_items_table()
            pw.y -= 6
        elif t == 'spacer':
            pw.y -= 8
        elif t == 'docx_table':
            rows = block.get('rows', [])
            if rows:
                nc = max(len(r) for r in rows)
                cw_each = pw.content_w / nc if nc else pw.content_w
                pw.draw_table(rows, [cw_each] * nc)
                pw.y -= 4

    pages = pw.finish()

    pdf = PDF()
    return pdf.build(pages)