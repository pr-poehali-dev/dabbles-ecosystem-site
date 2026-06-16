import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { MEvent, MRoom, MVenue, EVENT_TYPES, daysInMonth, firstWeekday, formatTime, mApi } from "@/lib/meroshkins";
import { request } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import EventModal from "@/pages/meroshkins/EventModal";
import MeroshkinsFooter from "@/components/MeroshkinsFooter";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

interface ShareData {
  events: MEvent[];
  role: string;
  readonly: boolean;
  owner_id: number;
  venues: MVenue[];
  rooms: MRoom[];
}

export default function MeroshkinsShare() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = params.get("token") || "";

  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [selected, setSelected] = useState<MEvent | null>(null);
  const [modalEvent, setModalEvent] = useState<MEvent | null | undefined>(undefined);
  const [newDate, setNewDate] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const loadShare = () => {
    if (!token) { setError("Ссылка недействительна"); setLoading(false); return; }
    request<ShareData>("meroshkins", {
      query: { action: "share-view", token }, auth: false,
    }).then(d => setData({ ...d, events: d.events.filter(e => e.status !== "deleted") }))
      .catch(() => setError("Ссылка недействительна или истекла"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadShare(); }, [token]);

  const days = daysInMonth(year, month);
  const startWd = firstWeekday(year, month);
  const cells = Array.from({ length: Math.ceil((days + startWd) / 7) * 7 }, (_, i) => {
    const d = i - startWd + 1;
    return d >= 1 && d <= days ? d : null;
  });

  const eventsOn = (d: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return (data?.events || []).filter(e => e.starts_at.startsWith(prefix));
  };

  const handleJoin = async () => {
    if (!user) {
      navigate(`/id/auth?client_id=meroshkins&redirect_uri=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setJoining(true);
    try {
      await mApi.shareJoin(token);
      setJoined(true);
    } catch {
      setError("Не удалось присоединиться");
    } finally { setJoining(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#7c3aed]/25 border-t-[#7c3aed] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center">
      <div className="text-center">
        <Icon name="CalendarX2" size={36} className="mx-auto mb-3 text-black/25" />
        <p className="font-display font-black text-xl text-black mb-2">Ссылка недействительна</p>
        <p className="text-black/40 text-sm mb-6">{error}</p>
        <Link to="/" className="text-[#7c3aed] text-sm font-semibold hover:underline">На главную</Link>
      </div>
    </div>
  );

  const isEditor = data?.role === "editor";

  return (
    <div className="min-h-screen bg-[#f5f3ff] font-body">
      <nav className="h-[60px] bg-white border-b border-black/8 flex items-center px-6 gap-3">
        <img src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/459fbb05-4d8d-4609-851d-04611bbbaadc.png" alt="Мерошкинс" className="h-7 w-auto" />
        <div className={`ml-auto flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
          isEditor ? "bg-amber-50 text-amber-600" : "bg-[#f5f3ff] text-black/40"
        }`}>
          <Icon name={isEditor ? "Pencil" : "Eye"} size={13} />
          {isEditor ? "Редактирование" : "Только просмотр"}
        </div>
      </nav>

      {/* Баннер для редактора — добавить в свой аккаунт */}
      {isEditor && !joined && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-3">
          <Icon name="Users" size={16} className="text-amber-500 shrink-0" />
          <p className="text-[13px] text-amber-700 flex-1">
            {user
              ? "Хочешь редактировать этот календарь в своём аккаунте?"
              : "Войдите в аккаунт, чтобы редактировать этот календарь"}
          </p>
          <button onClick={handleJoin} disabled={joining}
            className="shrink-0 px-4 py-1.5 rounded-full bg-amber-500 text-white text-[12px] font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1.5 disabled:opacity-60">
            {joining && <Icon name="Loader" size={12} className="animate-spin" />}
            {user ? "Присоединиться" : "Войти"}
          </button>
        </div>
      )}
      {isEditor && joined && (
        <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center gap-3">
          <Icon name="CheckCircle" size={16} className="text-green-500 shrink-0" />
          <p className="text-[13px] text-green-700 flex-1">Готово! Календарь добавлен в ваш аккаунт</p>
          <button onClick={() => navigate("/meroshkins")}
            className="shrink-0 px-4 py-1.5 rounded-full bg-green-500 text-white text-[12px] font-semibold hover:bg-green-600 transition-colors">
            Открыть
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }}
            className="p-2 rounded-xl bg-white border border-black/8 hover:bg-black/5 text-black/50">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <span className="font-display font-black text-black text-lg">{MONTHS[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }}
            className="p-2 rounded-xl bg-white border border-black/8 hover:bg-black/5 text-black/50">
            <Icon name="ChevronRight" size={16} />
          </button>
          {isEditor && (
            <button
              onClick={() => {
                const d = today;
                setNewDate(`${year}-${String(month+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
                setModalEvent(null);
              }}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] transition-colors shadow-sm"
            >
              <Icon name="Plus" size={14} />
              Добавить
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-bold text-black/30 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayEvents = d ? eventsOn(d) : [];
            return (
              <div key={i}
                className={`min-h-[80px] rounded-2xl p-2 ${d ? "bg-white border border-black/5" : ""} ${isEditor && d ? "cursor-pointer hover:border-[#7c3aed]/30 transition-colors" : ""}`}
                onClick={() => {
                  if (isEditor && d) {
                    setNewDate(`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
                    setModalEvent(null);
                  }
                }}
              >
                {d && (
                  <>
                    <div className={`text-xs font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[#7c3aed] text-white" : "text-black/50"}`}>{d}</div>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate text-white cursor-pointer hover:opacity-80 mb-0.5"
                        style={{ background: ev.color }}
                        onClick={e => { e.stopPropagation(); if (isEditor) setModalEvent(ev); else setSelected(ev); }}>
                        {formatTime(ev.starts_at)} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[10px] text-black/35 pl-1.5">+{dayEvents.length - 3}</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Просмотр события (readonly) */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md flex flex-col max-h-[90dvh] sm:max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Шапка с крестиком — всегда видна */}
            <div className="flex items-start gap-3 p-5 sm:p-6 pb-3 shrink-0 border-b border-black/5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: selected.color }} />
                  <div className="text-xs font-bold text-black/40">{EVENT_TYPES[selected.event_type]?.label}</div>
                </div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-black leading-tight break-words">{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 -mr-1 rounded-xl hover:bg-black/5 text-black/30 hover:text-black/60 transition-colors shrink-0"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Прокручиваемое тело */}
            <div className="overflow-y-auto px-5 sm:px-6 py-4 flex-1">
              <div className="text-black/50 text-sm space-y-1.5 mb-4">
                <div className="flex items-center gap-2"><Icon name="Clock" size={14} />{formatTime(selected.starts_at)} — {formatTime(selected.ends_at)}</div>
                {selected.room_name && <div className="flex items-center gap-2"><Icon name="MapPin" size={14} />{selected.venue_name}, {selected.room_name}</div>}
                {selected.responsible && <div className="flex items-center gap-2"><Icon name="User" size={14} />{selected.responsible}</div>}
              </div>
              {selected.description && <p className="text-black/60 text-sm leading-relaxed whitespace-pre-wrap break-words">{selected.description}</p>}
            </div>

            {/* Закреплённая кнопка закрытия */}
            <div className="p-4 sm:p-5 pt-3 shrink-0 border-t border-black/5">
              <button onClick={() => setSelected(null)} className="w-full py-3 rounded-xl bg-black/5 text-black/60 font-semibold text-sm hover:bg-black/10 transition-colors">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* Редактирование события (editor mode) */}
      {isEditor && modalEvent !== undefined && (
        <EventModal
          event={modalEvent}
          defaultDate={newDate}
          rooms={(data?.rooms || []) as MRoom[]}
          onClose={() => setModalEvent(undefined)}
          onSaved={() => { setModalEvent(undefined); loadShare(); }}
        />
      )}

      <MeroshkinsFooter />
    </div>
  );
}