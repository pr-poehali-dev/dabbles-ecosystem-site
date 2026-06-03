import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { MEvent, EVENT_TYPES, daysInMonth, firstWeekday, formatTime, mApi } from "@/lib/meroshkins";
import { request } from "@/lib/api";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export default function MeroshkinsShare() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [events, setEvents] = useState<MEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MEvent | null>(null);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    if (!token) { setError("Ссылка недействительна"); setLoading(false); return; }
    request<{ events: MEvent[]; readonly: boolean }>("meroshkins", {
      query: { action: "share-view", token }, auth: false,
    }).then(d => setEvents(d.events.filter(e => e.status !== "deleted")))
      .catch(() => setError("Ссылка недействительна или истекла"))
      .finally(() => setLoading(false));
  }, [token]);

  const days = daysInMonth(year, month);
  const startWd = firstWeekday(year, month);
  const cells = Array.from({ length: Math.ceil((days + startWd) / 7) * 7 }, (_, i) => {
    const d = i - startWd + 1;
    return d >= 1 && d <= days ? d : null;
  });

  const eventsOn = (d: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter(e => e.starts_at.startsWith(prefix));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center">
      <Icon name="Loader" size={28} className="animate-spin text-[#7c3aed]/50" />
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

  return (
    <div className="min-h-screen bg-[#f5f3ff] font-body">
      <nav className="h-[60px] bg-white border-b border-black/8 flex items-center px-6 gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
          <Icon name="CalendarDays" size={14} className="text-white" />
        </div>
        <span className="font-display font-black text-black text-sm">
          Даббл.<span className="text-[#7c3aed]">Мерошкинс</span>
        </span>
        <div className="ml-auto flex items-center gap-2 text-xs text-black/40 bg-[#f5f3ff] px-3 py-1.5 rounded-full">
          <Icon name="Eye" size={13} />
          Только просмотр
        </div>
      </nav>

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
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-bold text-black/30 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayEvents = d ? eventsOn(d) : [];
            return (
              <div key={i} className={`min-h-[80px] rounded-2xl p-2 ${d ? "bg-white border border-black/5" : ""}`}>
                {d && (
                  <>
                    <div className={`text-xs font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[#7c3aed] text-white" : "text-black/50"}`}>{d}</div>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate text-white cursor-pointer hover:opacity-80 mb-0.5"
                        style={{ background: ev.color }}
                        onClick={() => setSelected(ev)}>
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

      {/* Event detail (readonly) */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
              <div className="text-xs font-bold text-black/40">{EVENT_TYPES[selected.event_type]?.label}</div>
            </div>
            <h2 className="font-display font-black text-2xl text-black mb-3">{selected.title}</h2>
            <div className="text-black/50 text-sm space-y-1 mb-4">
              <div className="flex items-center gap-2"><Icon name="Clock" size={14} />{formatTime(selected.starts_at)} — {formatTime(selected.ends_at)}</div>
              {selected.room_name && <div className="flex items-center gap-2"><Icon name="MapPin" size={14} />{selected.venue_name}, {selected.room_name}</div>}
              {selected.responsible && <div className="flex items-center gap-2"><Icon name="User" size={14} />{selected.responsible}</div>}
            </div>
            {selected.description && <p className="text-black/60 text-sm leading-relaxed">{selected.description}</p>}
            <button onClick={() => setSelected(null)} className="mt-6 w-full py-2.5 rounded-xl bg-black/5 text-black/60 font-semibold text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
