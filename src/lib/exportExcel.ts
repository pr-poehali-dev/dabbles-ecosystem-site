import * as XLSX from "xlsx";
import { MEvent, EVENT_TYPES, EVENT_STATUSES } from "@/lib/meroshkins";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function fmtDatetime(iso: string) {
  return `${fmtDate(iso)} ${fmtTime(iso)}`;
}

export function exportEventsExcel(
  events: MEvent[],
  year: number,
  month: number,
  period: "month" | "week" | "all",
  weekStart?: Date,
) {
  // Фильтрация по периоду
  let filtered = events.filter(e => e.status !== "deleted");

  if (period === "month") {
    filtered = filtered.filter(e => {
      const d = new Date(e.starts_at);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  } else if (period === "week" && weekStart) {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    filtered = filtered.filter(e => {
      const d = new Date(e.starts_at);
      return d >= weekStart && d < end;
    });
  }

  filtered = [...filtered].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  // Название файла и листа
  let sheetTitle = "Мероприятия";
  let fileName = "meroshkins-export";
  if (period === "month") {
    sheetTitle = `${MONTHS[month]} ${year}`;
    fileName = `Мерошкинс_${MONTHS[month]}_${year}`;
  } else if (period === "week" && weekStart) {
    const ws = fmtDate(weekStart.toISOString());
    sheetTitle = `Неделя ${ws}`;
    fileName = `Мерошкинс_неделя_${weekStart.toISOString().slice(0, 10)}`;
  } else {
    fileName = `Мерошкинс_все_${year}`;
  }

  const wb = XLSX.utils.book_new();

  // ── Лист 1: Мероприятия ──
  const headers = [
    "№", "Название", "Тип", "Статус",
    "Дата начала", "Время начала", "Дата конца", "Время конца",
    "Площадка", "Зал", "Ответственный", "Инфоповод", "Описание",
  ];

  const rows = filtered.map((e, i) => [
    i + 1,
    e.title,
    EVENT_TYPES[e.event_type]?.label || e.event_type,
    EVENT_STATUSES[e.status]?.label || e.status,
    fmtDate(e.starts_at),
    fmtTime(e.starts_at),
    fmtDate(e.ends_at),
    fmtTime(e.ends_at),
    e.venue_name || "",
    e.room_name || "",
    e.responsible || "",
    e.info_reason || "",
    e.description || "",
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Ширина столбцов
  ws1["!cols"] = [
    { wch: 4 },   // №
    { wch: 40 },  // Название
    { wch: 18 },  // Тип
    { wch: 18 },  // Статус
    { wch: 14 },  // Дата начала
    { wch: 10 },  // Время начала
    { wch: 14 },  // Дата конца
    { wch: 10 },  // Время конца
    { wch: 25 },  // Площадка
    { wch: 20 },  // Зал
    { wch: 22 },  // Ответственный
    { wch: 35 },  // Инфоповод
    { wch: 45 },  // Описание
  ];

  XLSX.utils.book_append_sheet(wb, ws1, sheetTitle.slice(0, 31));

  // ── Лист 2: Сводная по типам ──
  const byType: Record<string, number> = {};
  filtered.forEach(e => {
    const label = EVENT_TYPES[e.event_type]?.label || e.event_type;
    byType[label] = (byType[label] || 0) + 1;
  });

  const summaryRows = [
    ["Тип мероприятия", "Количество"],
    ...Object.entries(byType).sort((a, b) => b[1] - a[1]),
    [],
    ["Итого", filtered.length],
    [],
    ["Сформировано", fmtDatetime(new Date().toISOString())],
    ["Период", sheetTitle],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws2["!cols"] = [{ wch: 28 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Сводная");

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
