import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { MEvent, MRoom, EVENT_TYPES, EventType, EventStatus, mApi, formatTime } from "@/lib/meroshkins";

interface Props {
  event?: MEvent | null;
  defaultDate?: string;
  rooms: MRoom[];
  onClose: () => void;
  onSaved: () => void;
}

const TYPE_OPTS = Object.entries(EVENT_TYPES).map(([k, v]) => ({ value: k as EventType, label: v.label, color: v.color }));
const STATUS_OPTS: { value: EventStatus; label: string }[] = [
  { value: "planned",   label: "Запланировано" },
  { value: "ongoing",   label: "Идёт сейчас"   },
  { value: "done",      label: "Завершено"      },
  { value: "cancelled", label: "Отменено"       },
];

function toLocal(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("sv-SE", { hour12: false }).slice(0, 16).replace(" ", "T");
}
function fromLocal(s: string) {
  return s ? new Date(s).toISOString() : "";
}

const SF: React.CSSProperties = { fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif" };

export default function EventModal({ event, defaultDate, rooms, onClose, onSaved }: Props) {
  const isNew = !event;
  const defStart = defaultDate ? `${defaultDate}T10:00` : toLocal(new Date().toISOString());

  const [form, setForm] = useState({
    title:       event?.title        ?? "",
    event_type:  event?.event_type   ?? "other" as EventType,
    status:      event?.status       ?? "planned" as EventStatus,
    starts_at:   toLocal(event?.starts_at) || defStart,
    ends_at:     toLocal(event?.ends_at)   || defStart.slice(0, 11) + "12:00",
    room_id:     event?.room_id ? String(event.room_id) : "",
    responsible: event?.responsible  ?? "",
    description: event?.description  ?? "",
    info_reason: event?.info_reason  ?? "",
    press_release: event?.press_release ?? "",
    color:       event?.color        ?? EVENT_TYPES["other"].color,
  });

  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [tab,      setTab]      = useState<"main" | "text">("main");

  useEffect(() => {
    if (!event) {
      const c = EVENT_TYPES[form.event_type as EventType]?.color;
      if (c) setForm(f => ({ ...f, color: c }));
    }
  }, [form.event_type]);

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const data = { ...form, starts_at: fromLocal(form.starts_at), ends_at: fromLocal(form.ends_at), room_id: form.room_id ? Number(form.room_id) : null };
      if (isNew) await mApi.createEvent(data);
      else await mApi.updateEvent({ ...data, id: event!.id });
      onSaved();
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!event || !confirm("Удалить мероприятие?")) return;
    setDeleting(true);
    try { await mApi.deleteEvent(event.id); onSaved(); }
    finally { setDeleting(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meroshkins?event=${event?.id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-[440px] flex flex-col shadow-2xl max-h-[90dvh] sm:max-h-none sm:h-full rounded-t-[22px] sm:rounded-tr-none sm:rounded-l-[20px]"
        style={SF}
        onClick={e => e.stopPropagation()}
      >
        {/* Полоска-хваталка для мобилки */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        {/* HEADER */}
        <div className="flex items-center gap-3 px-5 py-3 sm:py-4 border-b border-black/6 shrink-0">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: form.color }} />
          <span className="font-semibold text-[15px] text-black tracking-[-0.2px] flex-1 truncate">
            {isNew ? "Новое мероприятие" : (form.title || "Мероприятие")}
          </span>
          <div className="flex items-center gap-1">
            {!isNew && (
              <button onClick={copyLink}
                className="p-2 rounded-xl hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"
                title="Скопировать ссылку">
                <Icon name={copied ? "Check" : "Link"} size={15} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors">
              <Icon name="X" size={17} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-0 px-5 pt-3 shrink-0 border-b border-black/5">
          {([["main","Основное"],["text","Текст"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                tab === k ? "border-[#7c3aed] text-[#7c3aed]" : "border-transparent text-black/35 hover:text-black"
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === "main" && (
            <>
              <F label="Название *">
                <input value={form.title} onChange={e => set("title")(e.target.value)}
                  placeholder="Название мероприятия" className="inp" autoFocus={isNew} />
              </F>

              <div className="grid grid-cols-2 gap-3">
                <F label="Тип">
                  <select value={form.event_type} onChange={e => set("event_type")(e.target.value)} className="inp">
                    {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </F>
                <F label="Статус">
                  <select value={form.status} onChange={e => set("status")(e.target.value)} className="inp">
                    {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </F>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <F label="Начало">
                  <input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at")(e.target.value)} className="inp" />
                </F>
                <F label="Конец">
                  <input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at")(e.target.value)} className="inp" />
                </F>
              </div>

              <F label="Площадка / зал">
                <select value={form.room_id} onChange={e => set("room_id")(e.target.value)} className="inp">
                  <option value="">— Не указано —</option>
                  {rooms.filter(r => r.is_active).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.venue_name} — {r.name}{r.capacity ? ` (${r.capacity} чел.)` : ""}
                    </option>
                  ))}
                </select>
              </F>

              <F label="Ответственный">
                <input value={form.responsible} onChange={e => set("responsible")(e.target.value)}
                  placeholder="Имя сотрудника" className="inp" />
              </F>

              <F label="Цвет события">
                <div className="flex items-center gap-2.5">
                  <input type="color" value={form.color} onChange={e => set("color")(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-black/10 cursor-pointer bg-transparent p-0.5" />
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.values(EVENT_TYPES).map(t => (
                      <button key={t.color} onClick={() => set("color")(t.color)}
                        className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                        style={{ background: t.color, borderColor: form.color === t.color ? "#000" : "transparent" }}
                      />
                    ))}
                  </div>
                </div>
              </F>
            </>
          )}

          {tab === "text" && (
            <>
              <F label="Инфоповод">
                <input value={form.info_reason} onChange={e => set("info_reason")(e.target.value)}
                  placeholder="Напр.: Ежегодная конференция партнёров" className="inp" />
              </F>
              <F label="Описание">
                <textarea value={form.description} onChange={e => set("description")(e.target.value)}
                  rows={4} placeholder="Подробное описание…" className="inp resize-none" />
              </F>
              <F label="Пост / пресс-релиз">
                <textarea value={form.press_release} onChange={e => set("press_release")(e.target.value)}
                  rows={6} placeholder="Текст для публикации или рассылки…" className="inp resize-none" />
                {form.description && form.info_reason && !form.press_release && (
                  <button
                    onClick={() => set("press_release")(
                      `${form.info_reason}\n\n${form.title}\n\n${form.description}\n\nПодробности — по запросу.`
                    )}
                    className="mt-2 text-[12px] text-[#7c3aed] hover:underline flex items-center gap-1"
                  >
                    <Icon name="Sparkles" size={12} /> Сгенерировать из описания
                  </button>
                )}
              </F>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 border-t border-black/6 flex gap-2 shrink-0">
          {!isNew && (
            <button onClick={del} disabled={deleting}
              className="px-4 py-2.5 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 text-[13px] font-semibold transition-colors disabled:opacity-40">
              {deleting ? <Icon name="Loader" size={13} className="animate-spin" /> : "Удалить"}
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-black/5 text-black/50 text-[13px] font-semibold ml-auto">
            Отмена
          </button>
          <button onClick={save} disabled={saving || !form.title.trim()}
            className="px-5 py-2.5 rounded-2xl bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-40 flex items-center gap-1.5">
            {saving && <Icon name="Loader" size={13} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      </div>

      <style>{`
        .inp {
          width: 100%;
          padding: 9px 13px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          background: #fff;
          font-size: 14px;
          color: #000;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          font-family: -apple-system,'SF Pro Display','Helvetica Neue',sans-serif;
        }
        .inp:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
      `}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] text-black/40 font-medium mb-1.5 block uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}