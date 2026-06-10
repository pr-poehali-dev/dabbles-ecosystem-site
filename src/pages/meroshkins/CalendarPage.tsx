import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  MEvent, MRoom, MVenue, mApi, EVENT_TYPES, EVENT_STATUSES,
  daysInMonth, firstWeekday, formatTime, isoDate,
} from "@/lib/meroshkins";
import { exportEventsExcel } from "@/lib/exportExcel";
import EventModal from "./EventModal";

type ViewMode = "month" | "week" | "day";

const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export default function CalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view,  setView]  = useState<ViewMode>("month");
  const [events,  setEvents]  = useState<MEvent[]>([]);
  const [rooms,   setRooms]   = useState<MRoom[]>([]);
  const [venues,  setVenues]  = useState<MVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState<MEvent | null | undefined>(undefined);
  const [newDate,    setNewDate]    = useState("");
  const [tooltip,    setTooltip]    = useState<{ event: MEvent; x: number; y: number } | null>(null);

  const [fRoom,   setFRoom]   = useState("");
  const [fType,   setFType]   = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSearch, setFSearch] = useState("");

  const [shareModal, setShareModal] = useState(false);
  const [shareToken, setShareToken] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("viewer");
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [pdfModal,  setPdfModal]  = useState(false);
  const [pdfPeriod, setPdfPeriod] = useState<"month" | "week" | "all">("month");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (fRoom)   filters.room_id    = fRoom;
      if (fType)   filters.event_type = fType;
      if (fStatus) filters.status     = fStatus;
      if (fSearch) filters.q          = fSearch;
      const [ev, rm, vn] = await Promise.all([
        mApi.events(year, month + 1, filters),
        rooms.length   ? Promise.resolve({ rooms })   : mApi.rooms(),
        venues.length  ? Promise.resolve({ venues })  : mApi.venues(),
      ]);
      setEvents(ev.events);
      if (!rooms.length)  setRooms(rm.rooms);
      if (!venues.length) setVenues(vn.venues);
    } finally { setLoading(false); }
  }, [year, month, fRoom, fType, fStatus, fSearch]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => month === 0 ? (setYear(y => y-1), setMonth(11)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setYear(y => y+1), setMonth(0))  : setMonth(m => m+1);

  const eventsOn = (d: number) => {
    const prefix = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return events.filter(e => e.starts_at.startsWith(prefix));
  };

  const createShare = async () => {
    setShareLoading(true);
    try {
      const { token } = await mApi.shareCreate(shareRole);
      setShareToken(token);
    } finally { setShareLoading(false); }
  };
  const copyShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meroshkins/share?token=${shareToken}`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };
  const resetShare = () => { setShareModal(false); setShareToken(""); setShareRole("viewer"); setShareCopied(false); };

  const days     = daysInMonth(year, month);
  const startWd  = firstWeekday(year, month);
  const cells    = Array.from({ length: Math.ceil((days + startWd) / 7) * 7 }, (_, i) => {
    const d = i - startWd + 1;
    return d >= 1 && d <= days ? d : null;
  });

  const SF: React.CSSProperties = { fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif" };

  return (
    <div className="flex flex-col gap-4" style={SF}>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Month nav */}
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-black/8 shadow-sm p-0.5">
          <button onClick={prevMonth} className="p-2 rounded-[10px] hover:bg-black/5 text-black/40 transition-colors">
            <Icon name="ChevronLeft" size={15} />
          </button>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            className="px-2 md:px-3 py-1.5 text-[13px] font-semibold text-black min-w-[110px] md:min-w-[140px] text-center hover:bg-black/3 rounded-[10px] transition-colors"
          >
            <span className="md:hidden">{MONTHS[month].slice(0,3)} {year}</span>
            <span className="hidden md:inline">{MONTHS[month]} {year}</span>
          </button>
          <button onClick={nextMonth} className="p-2 rounded-[10px] hover:bg-black/5 text-black/40 transition-colors">
            <Icon name="ChevronRight" size={15} />
          </button>
        </div>

        {/* View switcher */}
        <div className="flex bg-white rounded-xl border border-black/8 shadow-sm p-0.5">
          {(["month","week","day"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-[10px] transition-all ${
                view === v ? "bg-black text-white shadow-sm" : "text-black/40 hover:text-black"
              }`}>
              {v === "month" ? "Месяц" : v === "week" ? "Неделя" : "День"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-black/8 shadow-sm px-3 py-2 flex-1 min-w-[140px] max-w-[220px]">
          <Icon name="Search" size={13} className="text-black/25 shrink-0" />
          <input
            value={fSearch}
            onChange={e => setFSearch(e.target.value)}
            placeholder="Поиск…"
            className="text-[13px] outline-none bg-transparent flex-1 text-black placeholder-black/25"
          />
        </div>

        {/* Filters */}
        <select value={fType}   onChange={e => setFType(e.target.value)}   className="sel-apple hidden sm:block">
          <option value="">Все типы</option>
          {Object.entries(EVENT_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="sel-apple hidden sm:block">
          <option value="">Все статусы</option>
          {Object.entries(EVENT_STATUSES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fRoom}   onChange={e => setFRoom(e.target.value)}   className="sel-apple hidden md:block">
          <option value="">Все залы</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.venue_name} — {r.name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setPdfModal(true)}
            className="p-2 rounded-xl bg-white border border-black/8 shadow-sm text-black/40 hover:text-green-600 transition-colors"
            title="Выгрузка в Excel">
            <Icon name="Sheet" size={16} />
          </button>
          <button onClick={() => setShareModal(true)}
            className="p-2 rounded-xl bg-white border border-black/8 shadow-sm text-black/40 hover:text-black transition-colors"
            title="Поделиться">
            <Icon name="Share2" size={16} />
          </button>
          <button
            onClick={() => { setNewDate(isoDate(new Date(year, month, today.getDate()))); setModalEvent(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] transition-colors shadow-sm shadow-[#7c3aed]/20"
          >
            <Icon name="Plus" size={14} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* ── CALENDAR ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[#7c3aed]/25 border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : view === "month" ? (
        <div className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-black/6">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`text-center text-[11px] font-semibold py-2.5 ${i >= 5 ? "text-[#7c3aed]/50" : "text-black/30"}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-black/5">
            {cells.map((d, i) => {
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isWeekend = i % 7 >= 5;
              const dayEvents = d ? eventsOn(d) : [];
              return (
                <div
                  key={i}
                  className={`min-h-[88px] md:min-h-[120px] p-1 md:p-2 cursor-pointer transition-colors group ${
                    d ? (isWeekend ? "bg-black/[0.01] hover:bg-[#f5f3ff]/60" : "hover:bg-[#f5f3ff]/40") : "bg-black/[0.015]"
                  }`}
                  onClick={() => {
                    if (!d) return;
                    const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                    setNewDate(ds); setModalEvent(null);
                  }}
                >
                  {d && (
                    <>
                      <div className={`text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 transition-colors ${
                        isToday
                          ? "bg-[#7c3aed] text-white"
                          : isWeekend
                            ? "text-[#7c3aed]/60"
                            : "text-black/50 group-hover:text-black"
                      }`}>{d}</div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className="rounded-[6px] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                            style={{ background: ev.color + "18", borderLeft: `3px solid ${ev.color}` }}
                            onClick={e => { e.stopPropagation(); setModalEvent(ev); }}
                            onMouseEnter={e => setTooltip({ event: ev, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            {/* Мобиль — компактная плашка с читаемым заголовком */}
                            <div className="md:hidden px-1 py-0.5">
                              <span
                                className="text-[10px] font-semibold leading-tight line-clamp-2 break-words"
                                style={{ color: ev.color }}
                              >
                                {ev.title}
                              </span>
                            </div>
                            {/* Десктоп — полная карточка */}
                            <div className="hidden md:block px-1.5 py-1">
                              <div className="text-[10px] font-bold mb-0.5 opacity-70" style={{ color: ev.color }}>
                                {formatTime(ev.starts_at)}
                                {ev.ends_at && <span className="font-normal opacity-70"> — {formatTime(ev.ends_at)}</span>}
                              </div>
                              <div className="text-[11px] font-semibold text-black/80 leading-tight line-clamp-1">{ev.title}</div>
                              {ev.room_name && (
                                <div className="text-[10px] text-black/35 truncate mt-0.5 flex items-center gap-0.5">
                                  <span>📍</span>{ev.room_name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-black/30 pl-1.5 font-medium">+{dayEvents.length - 3} ещё</div>
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
        <div className="bg-white rounded-2xl border border-black/6 shadow-sm flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-black/4 flex items-center justify-center mx-auto mb-3">
              <Icon name="CalendarDays" size={20} className="text-black/25" />
            </div>
            <p className="text-[14px] font-medium text-black/35">Вид «{view === "week" ? "Неделя" : "День"}» — скоро</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && view === "month" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <p className="text-[13px] text-black/25">Нет мероприятий — нажмите на день</p>
          </div>
        </div>
      )}

      {/* ── TOOLTIP ── */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-xl px-3 py-2.5 text-white text-[12px] shadow-xl pointer-events-none"
          style={{
            top: tooltip.y - 70, left: tooltip.x + 10, maxWidth: 220,
            background: "rgba(20,20,30,0.92)", backdropFilter: "blur(12px)",
          }}
        >
          <div className="font-semibold mb-0.5">{tooltip.event.title}</div>
          <div className="text-white/55">{formatTime(tooltip.event.starts_at)} — {formatTime(tooltip.event.ends_at)}</div>
          {tooltip.event.room_name && <div className="text-white/40 text-[11px] mt-0.5">{tooltip.event.venue_name} · {tooltip.event.room_name}</div>}
        </div>
      )}

      {/* ── EXCEL MODAL ── */}
      {pdfModal && (
        <Modal onClose={() => setPdfModal(false)}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Icon name="Sheet" size={16} className="text-green-600" />
            </div>
            <h3 className="text-[17px] font-bold text-black tracking-[-0.3px]">Выгрузка в Excel</h3>
          </div>
          <p className="text-[13px] text-black/40 mb-5">Выберите период для выгрузки</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {([
              { value: "month", icon: "Calendar",     label: MONTHS[month], sub: String(year) },
              { value: "week",  icon: "CalendarDays", label: "Эта неделя",  sub: "7 дней" },
              { value: "all",   icon: "LayoutList",   label: "Все",          sub: "за все время" },
            ] as const).map(p => (
              <button key={p.value} onClick={() => setPdfPeriod(p.value as typeof pdfPeriod)}
                className={`flex flex-col items-center gap-1 py-3.5 rounded-xl border-2 transition-all ${
                  pdfPeriod === p.value ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]" : "border-black/8 text-black/45 hover:border-black/20"
                }`}>
                <Icon name={p.icon} size={16} className="mb-0.5" />
                <span className="text-[12px] font-semibold">{p.label}</span>
                <span className="text-[10px] opacity-60">{p.sub}</span>
              </button>
            ))}
          </div>

          <div className="bg-black/3 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
            <Icon name="Info" size={13} className="text-black/30 mt-0.5 shrink-0" />
            <p className="text-[11px] text-black/40 leading-relaxed">
              Файл содержит два листа: список мероприятий со всеми полями и сводную таблицу по типам
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setPdfModal(false)} className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/55 text-[13px] font-semibold">Отмена</button>
            <button
              onClick={() => {
                const ws = new Date(today);
                ws.setDate(ws.getDate() - (ws.getDay() === 0 ? 6 : ws.getDay() - 1));
                ws.setHours(0, 0, 0, 0);
                exportEventsExcel(events, year, month, pdfPeriod as "month" | "week" | "all", ws);
                setPdfModal(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-[13px] font-semibold hover:bg-green-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Icon name="Download" size={14} /> Скачать .xlsx
            </button>
          </div>
        </Modal>
      )}

      {/* ── SHARE MODAL ── */}
      {shareModal && (
        <Modal onClose={resetShare}>
          <h3 className="text-[17px] font-bold text-black tracking-[-0.3px] mb-1">Поделиться календарём</h3>
          <p className="text-[13px] text-black/40 mb-4">Создайте ссылку — любой с ней откроет ваш календарь</p>

          {!shareToken ? (
            <>
              {/* Выбор режима */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {([
                  { value: "viewer", icon: "Eye",    label: "Просмотр",      desc: "Только читать" },
                  { value: "editor", icon: "Pencil", label: "Редактирование", desc: "Добавлять и изменять" },
                ] as const).map(opt => (
                  <button key={opt.value} onClick={() => setShareRole(opt.value)}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all ${
                      shareRole === opt.value
                        ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]"
                        : "border-black/8 text-black/40 hover:border-black/20"
                    }`}>
                    <Icon name={opt.icon} size={20} />
                    <span className="text-[13px] font-semibold">{opt.label}</span>
                    <span className="text-[11px] opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <button onClick={createShare} disabled={shareLoading}
                className="w-full py-3 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {shareLoading && <Icon name="Loader" size={14} className="animate-spin" />}
                Создать ссылку
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg w-fit ${
                shareRole === "editor" ? "bg-amber-50 text-amber-600" : "bg-[#7c3aed]/8 text-[#7c3aed]"
              }`}>
                <Icon name={shareRole === "editor" ? "Pencil" : "Eye"} size={11} />
                {shareRole === "editor" ? "Редактирование" : "Только просмотр"}
              </div>
              <div className="bg-black/4 rounded-xl px-3 py-2.5 text-[11px] text-black/50 break-all leading-relaxed font-mono">
                {window.location.origin}/meroshkins/share?token={shareToken}
              </div>
              <button onClick={copyShare}
                className="w-full py-3 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] flex items-center justify-center gap-2 transition-colors">
                <Icon name={shareCopied ? "Check" : "Copy"} size={14} />
                {shareCopied ? "Скопировано!" : "Скопировать ссылку"}
              </button>
              <button onClick={() => { setShareToken(""); setShareRole("viewer"); }}
                className="w-full py-2 text-[12px] text-black/35 hover:text-black/60 transition-colors">
                Создать другую ссылку
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* ── EVENT MODAL ── */}
      {modalEvent !== undefined && (
        <EventModal
          event={modalEvent}
          defaultDate={newDate}
          rooms={rooms}
          onClose={() => setModalEvent(undefined)}
          onSaved={() => { setModalEvent(undefined); load(); }}
        />
      )}

      <style>{`
        .sel-apple {
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          font-size: 12px;
          color: rgba(0,0,0,0.6);
          outline: none;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-sm rounded-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}