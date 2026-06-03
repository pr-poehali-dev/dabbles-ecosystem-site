import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  MEvent, MRoom, MVenue, mApi, EVENT_TYPES, EVENT_STATUSES,
  daysInMonth, firstWeekday, formatTime, isoDate,
} from "@/lib/meroshkins";
import { exportEventsPdf } from "@/lib/exportPdf";
import EventModal from "./EventModal";

type ViewMode = "month" | "week" | "day";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<ViewMode>("month");
  const [events, setEvents] = useState<MEvent[]>([]);
  const [rooms, setRooms] = useState<MRoom[]>([]);
  const [venues, setVenues] = useState<MVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState<MEvent | null | undefined>(undefined); // undefined=closed, null=new
  const [newDate, setNewDate] = useState<string>("");
  const [tooltip, setTooltip] = useState<{ event: MEvent; x: number; y: number } | null>(null);

  // Filters
  const [fRoom, setFRoom] = useState("");
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSearch, setFSearch] = useState("");
  const [shareModal, setShareModal] = useState(false);
  const [shareToken, setShareToken] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfPeriod, setPdfPeriod] = useState<"month" | "week">("month");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (fRoom) filters.room_id = fRoom;
      if (fType) filters.event_type = fType;
      if (fStatus) filters.status = fStatus;
      if (fSearch) filters.q = fSearch;
      const [ev, rm, vn] = await Promise.all([
        mApi.events(year, month + 1, filters),
        rooms.length ? Promise.resolve({ rooms }) : mApi.rooms(),
        venues.length ? Promise.resolve({ venues }) : mApi.venues(),
      ]);
      setEvents(ev.events.filter(e => e.status !== "deleted"));
      if (!rooms.length) setRooms(rm.rooms);
      if (!venues.length) setVenues(vn.venues);
    } finally { setLoading(false); }
  }, [year, month, fRoom, fType, fStatus, fSearch]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const eventsOn = (d: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter(e => e.starts_at.startsWith(prefix));
  };

  const createShare = async () => {
    const { token } = await mApi.shareCreate();
    setShareToken(token);
  };
  const copyShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meroshkins/share?token=${shareToken}`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const days = daysInMonth(year, month);
  const startWd = firstWeekday(year, month);
  const cells = Array.from({ length: Math.ceil((days + startWd) / 7) * 7 }, (_, i) => {
    const d = i - startWd + 1;
    return d >= 1 && d <= days ? d : null;
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* TOP BAR */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Nav */}
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-black/8 px-1 py-1">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-black/5 text-black/50"><Icon name="ChevronLeft" size={16} /></button>
          <span className="font-display font-black text-black text-sm px-2 min-w-[130px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-black/5 text-black/50"><Icon name="ChevronRight" size={16} /></button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            className="px-3 py-1.5 text-xs font-semibold text-[#7c3aed] hover:bg-[#7c3aed]/5 rounded-xl">
            Сегодня
          </button>
        </div>

        {/* View toggle */}
        <div className="flex bg-white rounded-2xl border border-black/8 overflow-hidden">
          {(["month","week","day"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${view === v ? "bg-[#7c3aed] text-white" : "text-black/40 hover:text-black"}`}>
              {v === "month" ? "Месяц" : v === "week" ? "Неделя" : "День"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-black/8 px-3 py-2 flex-1 min-w-[160px] max-w-xs">
          <Icon name="Search" size={14} className="text-black/30 shrink-0" />
          <input value={fSearch} onChange={e => setFSearch(e.target.value)} placeholder="Поиск..." className="text-sm outline-none bg-transparent flex-1 text-black placeholder-black/30" />
        </div>

        {/* Filters */}
        <select value={fType} onChange={e => setFType(e.target.value)} className="filter-sel">
          <option value="">Все типы</option>
          {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="filter-sel">
          <option value="">Все статусы</option>
          {Object.entries(EVENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fRoom} onChange={e => setFRoom(e.target.value)} className="filter-sel">
          <option value="">Все залы</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.venue_name} — {r.name}</option>)}
        </select>

        <div className="ml-auto flex gap-2">
          <button onClick={() => setPdfModal(true)}
            className="px-3 py-2 rounded-xl bg-white border border-black/8 text-black/60 hover:text-black text-xs font-semibold flex items-center gap-1.5">
            <Icon name="FileDown" size={14} /> PDF
          </button>
          <button onClick={() => setShareModal(true)}
            className="px-3 py-2 rounded-xl bg-white border border-black/8 text-black/60 hover:text-black text-xs font-semibold flex items-center gap-1.5">
            <Icon name="Share2" size={14} /> Поделиться
          </button>
          <button onClick={() => { setNewDate(isoDate(new Date(year, month, 1))); setModalEvent(null); }}
            className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#6d28d9]">
            <Icon name="Plus" size={14} /> Добавить
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Icon name="Loader" size={28} className="animate-spin text-[#7c3aed]/50" /></div>
      ) : view === "month" ? (
        <div className="flex-1 overflow-y-auto">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-black/30 py-2">{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayEvents = d ? eventsOn(d) : [];
              return (
                <div
                  key={i}
                  className={`min-h-[90px] rounded-2xl p-2 cursor-pointer transition-colors ${
                    d ? "bg-white hover:bg-[#f5f3ff] border border-black/5" : "bg-transparent"
                  }`}
                  onClick={() => {
                    if (!d) return;
                    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    setNewDate(ds);
                    setModalEvent(null);
                  }}
                >
                  {d && (
                    <>
                      <div className={`text-xs font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? "bg-[#7c3aed] text-white" : "text-black/50"
                      }`}>{d}</div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate text-white cursor-pointer hover:opacity-80"
                            style={{ background: ev.color }}
                            onClick={e => { e.stopPropagation(); setModalEvent(ev); }}
                            onMouseEnter={e => setTooltip({ event: ev, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            {formatTime(ev.starts_at)} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-black/35 pl-1.5">+{dayEvents.length - 3}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-black/30 text-sm">
          <div className="text-center">
            <Icon name="CalendarDays" size={32} className="mx-auto mb-3 opacity-40" />
            <p>Недельный и дневной вид — скоро</p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Icon name="CalendarOff" size={36} className="mx-auto mb-3 text-black/20" />
            <p className="text-black/30 text-sm">Нет мероприятий</p>
            <p className="text-black/20 text-xs">Нажмите на день или «+ Добавить»</p>
          </div>
        </div>
      )}

      {/* TOOLTIP */}
      {tooltip && (
        <div className="fixed z-50 bg-[#1a1a2e] text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none"
          style={{ top: tooltip.y - 60, left: tooltip.x + 8, maxWidth: 220 }}>
          <div className="font-bold mb-0.5">{tooltip.event.title}</div>
          <div className="text-white/60">{formatTime(tooltip.event.starts_at)} — {formatTime(tooltip.event.ends_at)}</div>
          {tooltip.event.room_name && <div className="text-white/50">{tooltip.event.venue_name}, {tooltip.event.room_name}</div>}
        </div>
      )}

      {/* PDF MODAL */}
      {pdfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPdfModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-black text-xl text-black mb-2">Выгрузка в PDF</h3>
            <p className="text-black/45 text-sm mb-6">Выберите период для выгрузки мероприятий</p>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPdfPeriod("month")}
                className={`flex-1 py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${pdfPeriod === "month" ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]" : "border-black/10 text-black/50"}`}
              >
                <Icon name="Calendar" size={16} className="mx-auto mb-1" />
                {MONTHS[month]} {year}
              </button>
              <button
                onClick={() => setPdfPeriod("week")}
                className={`flex-1 py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${pdfPeriod === "week" ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]" : "border-black/10 text-black/50"}`}
              >
                <Icon name="CalendarDays" size={16} className="mx-auto mb-1" />
                Текущая неделя
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPdfModal(false)} className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/60 font-semibold text-sm">
                Отмена
              </button>
              <button
                onClick={() => {
                  const weekStart = new Date(today);
                  const wd = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1;
                  weekStart.setDate(weekStart.getDate() - wd);
                  weekStart.setHours(0, 0, 0, 0);
                  exportEventsPdf(events, year, month, pdfPeriod, weekStart);
                  setPdfModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] text-white font-semibold text-sm hover:bg-[#6d28d9] flex items-center justify-center gap-2"
              >
                <Icon name="Download" size={15} />
                Скачать PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShareModal(false); setShareToken(""); }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-black text-xl text-black mb-2">Поделиться календарём</h3>
            <p className="text-black/45 text-sm mb-6">Получатель сможет только просматривать мероприятия, без возможности изменений.</p>
            {!shareToken ? (
              <button onClick={createShare}
                className="w-full py-3 rounded-2xl bg-[#7c3aed] text-white font-semibold hover:bg-[#6d28d9]">
                Создать ссылку
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#f5f5f7] rounded-xl px-4 py-3 text-sm text-black/60 break-all">
                  {window.location.origin}/meroshkins/share?token={shareToken}
                </div>
                <button onClick={copyShare}
                  className="w-full py-3 rounded-2xl bg-[#7c3aed] text-white font-semibold hover:bg-[#6d28d9] flex items-center justify-center gap-2">
                  <Icon name={shareCopied ? "Check" : "Copy"} size={16} />
                  {shareCopied ? "Скопировано!" : "Скопировать ссылку"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {modalEvent !== undefined && (
        <EventModal
          event={modalEvent}
          defaultDate={newDate}
          rooms={rooms}
          onClose={() => setModalEvent(undefined)}
          onSaved={() => { setModalEvent(undefined); load(); }}
        />
      )}

      <style>{`.filter-sel{padding:8px 12px;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:#fff;font-size:12px;color:rgba(0,0,0,.6);outline:none;cursor:pointer}`}</style>
    </div>
  );
}