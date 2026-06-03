import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MEvent, EVENT_TYPES, EVENT_STATUSES } from "@/lib/meroshkins";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fmt(iso: string, time = true) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (!time) return date;
  const t = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${t}`;
}

export function exportEventsPdf(
  events: MEvent[],
  year: number,
  month: number,
  period: "month" | "week",
  weekStart?: Date,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Заголовок
  const title =
    period === "month"
      ? `Мероприятия — ${MONTHS[month]} ${year}`
      : `Мероприятия — неделя ${weekStart ? fmt(weekStart.toISOString(), false) : ""}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(26, 10, 110);
  doc.text("Даббл.Мерошкинс", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, 24);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Сформировано: ${new Date().toLocaleString("ru-RU")}`, 14, 30);

  // Фильтруем по периоду
  let filtered = events;
  if (period === "month") {
    filtered = events.filter(e => {
      const d = new Date(e.starts_at);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  } else if (period === "week" && weekStart) {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    filtered = events.filter(e => {
      const d = new Date(e.starts_at);
      return d >= weekStart && d < end;
    });
  }

  filtered = [...filtered].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  if (filtered.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 180);
    doc.text("Нет мероприятий за выбранный период", 14, 44);
    doc.save(`meroshkins-${period}-${year}-${month + 1}.pdf`);
    return;
  }

  autoTable(doc, {
    startY: 36,
    head: [["Название", "Тип", "Статус", "Начало", "Конец", "Зал / Площадка", "Ответственный"]],
    body: filtered.map(e => [
      e.title,
      EVENT_TYPES[e.event_type]?.label || e.event_type,
      EVENT_STATUSES[e.status]?.label || e.status,
      fmt(e.starts_at),
      fmt(e.ends_at),
      [e.venue_name, e.room_name].filter(Boolean).join(", ") || "—",
      e.responsible || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
    headStyles: {
      fillColor: [26, 10, 110],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28 },
      3: { cellWidth: 36 },
      4: { cellWidth: 36 },
      5: { cellWidth: 50 },
      6: { cellWidth: 40 },
    },
    didDrawCell: (data) => {
      // Цветная точка для типа мероприятия
      if (data.section === "body" && data.column.index === 1) {
        const ev = filtered[data.row.index];
        if (ev) {
          const [r, g, b] = hexToRgb(ev.color);
          doc.setFillColor(r, g, b);
          doc.circle(data.cell.x + 2.5, data.cell.y + data.cell.height / 2, 1.5, "F");
        }
      }
    },
  });

  // Итого
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 10, 110);
  doc.text(`Итого: ${filtered.length} мероприятий`, 14, finalY + 8);

  doc.save(`meroshkins-${period === "month" ? `${MONTHS[month]}-${year}` : `week-${weekStart?.toISOString().slice(0, 10)}`}.pdf`);
}
