import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { MEvent, MRoom, EVENT_TYPES, EventType, EventStatus, mApi, formatDate, formatTime } from "@/lib/meroshkins";

interface Props {
  event?: MEvent | null;
  defaultDate?: string;
  rooms: MRoom[];
  onClose: () => void;
  onSaved: () => void;
}

const TYPE_OPTS = Object.entries(EVENT_TYPES).map(([k, v]) => ({ value: k as EventType, label: v.label, color: v.color }));
const STATUS_OPTS: { value: EventStatus; label: string }[] = [
  { value: "planned", label: "Запланировано" },
  { value: "ongoing", label: "Идёт сейчас" },
  { value: "done", label: "Завершено" },
  { value: "cancelled", label: "Отменено" },
];

function toInputDatetime(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function fromInputDatetime(s: string) {
  return s ? new Date(s).toISOString() : "";
}

export default function EventModal({ event, defaultDate, rooms, onClose, onSaved }: Props) {
  const isNew = !event;
  const defStart = defaultDate ? `${defaultDate}T10:00` : toInputDatetime(new Date().toISOString());

  const [form, setForm] = useState({
    title: event?.title ?? "",
    event_type: event?.event_type ?? "other" as EventType,
    status: event?.status ?? "planned" as EventStatus,
    starts_at: toInputDatetime(event?.starts_at) || defStart,
    ends_at: toInputDatetime(event?.ends_at) || defStart.slice(0, 11) + "12:00",
    room_id: event?.room_id ? String(event.room_id) : "",
    responsible: event?.responsible ?? "",
    description: event?.description ?? "",
    info_reason: event?.info_reason ?? "",
    press_release: event?.press_release ?? "",
    color: event?.color ?? EVENT_TYPES["other"].color,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"main" | "text">("main");

  useEffect(() => {
    const et = form.event_type as EventType;
    if (!event) setForm(f => ({ ...f, color: EVENT_TYPES[et]?.color ?? f.color }));
  }, [form.event_type]);

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        starts_at: fromInputDatetime(form.starts_at),
        ends_at: fromInputDatetime(form.ends_at),
        room_id: form.room_id ? Number(form.room_id) : null,
      };
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
    const url = `${window.location.origin}/meroshkins?event=${event?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ borderRadius: "0 0 0 0" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: form.color }} />
            <span className="font-display font-black text-black text-base">
              {isNew ? "Новое мероприятие" : form.title || "Мероприятие"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!isNew && (
              <button onClick={copyLink} className="p-2 rounded-xl hover:bg-black/5 text-black/40 hover:text-black transition-colors" title="Скопировать ссылку">
                <Icon name={copied ? "Check" : "Link"} size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 text-black/40">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-0 px-6 pt-3 shrink-0">
          {[{ k: "main", l: "Основное" }, { k: "text", l: "Текст и пресс-релиз" }].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as "main" | "text")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === t.k ? "border-[#7c3aed] text-[#7c3aed]" : "border-transparent text-black/40 hover:text-black"}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {tab === "main" && (
            <>
              <Field label="Название *">
                <input value={form.title} onChange={e => set("title")(e.target.value)} placeholder="Название мероприятия"
                  className="input-m" required />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Тип">
                  <select value={form.event_type} onChange={e => set("event_type")(e.target.value)} className="input-m">
                    {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Статус">
                  <select value={form.status} onChange={e => set("status")(e.target.value)} className="input-m">
                    {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Начало">
                  <input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at")(e.target.value)} className="input-m" />
                </Field>
                <Field label="Конец">
                  <input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at")(e.target.value)} className="input-m" />
                </Field>
              </div>

              <Field label="Площадка / зал">
                <select value={form.room_id} onChange={e => set("room_id")(e.target.value)} className="input-m">
                  <option value="">— Не указано —</option>
                  {rooms.filter(r => r.is_active).map(r => (
                    <option key={r.id} value={r.id}>{r.venue_name} — {r.name}{r.capacity ? ` (${r.capacity} чел.)` : ""}</option>
                  ))}
                </select>
              </Field>

              <Field label="Ответственный">
                <input value={form.responsible} onChange={e => set("responsible")(e.target.value)} placeholder="Имя сотрудника" className="input-m" />
              </Field>

              <Field label="Цвет">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => set("color")(e.target.value)} className="w-10 h-10 rounded-xl border border-black/10 cursor-pointer" />
                  <span className="text-xs text-black/40">{form.color}</span>
                  <div className="flex gap-1 ml-2">
                    {Object.values(EVENT_TYPES).map(t => (
                      <button key={t.color} onClick={() => set("color")(t.color)}
                        className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                        style={{ background: t.color, borderColor: form.color === t.color ? "#000" : "transparent" }} />
                    ))}
                  </div>
                </div>
              </Field>
            </>
          )}

          {tab === "text" && (
            <>
              <Field label="Инфоповод">
                <input value={form.info_reason} onChange={e => set("info_reason")(e.target.value)}
                  placeholder="Например: Ежегодная конференция партнёров" className="input-m" />
              </Field>
              <Field label="Описание">
                <textarea value={form.description} onChange={e => set("description")(e.target.value)}
                  rows={4} placeholder="Подробное описание мероприятия..." className="input-m resize-none" />
              </Field>
              <Field label="Пост / пресс-релиз">
                <textarea value={form.press_release} onChange={e => set("press_release")(e.target.value)}
                  rows={6} placeholder="Текст для публикации или рассылки..." className="input-m resize-none" />
                {form.description && form.info_reason && !form.press_release && (
                  <button
                    onClick={() => set("press_release")(
                      `🎯 ${form.info_reason}\n\n📅 ${form.title}\n\n${form.description}\n\nПодробности — по запросу.`
                    )}
                    className="mt-2 text-xs text-[#7c3aed] hover:underline flex items-center gap-1"
                  >
                    <Icon name="Sparkles" size={12} />
                    Сгенерировать из описания
                  </button>
                )}
              </Field>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-black/8 flex gap-2 shrink-0">
          {!isNew && (
            <button onClick={del} disabled={deleting}
              className="px-4 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-semibold text-sm transition-colors disabled:opacity-50">
              {deleting ? <Icon name="Loader" size={14} className="animate-spin" /> : "Удалить"}
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-black/5 text-black/60 font-semibold text-sm ml-auto">
            Отмена
          </button>
          <button onClick={save} disabled={saving || !form.title.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white font-semibold text-sm hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <Icon name="Loader" size={14} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      </div>

      <style>{`.input-m { width:100%; padding:10px 14px; border-radius:12px; border:1px solid rgba(0,0,0,.1); background:#fff; font-size:14px; color:#000; outline:none; transition:border-color .2s; }
        .input-m:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.08); }`}
      </style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-black/50 font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
