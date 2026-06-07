import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Kind = "hero" | "news" | "blog";
type Item = Record<string, unknown> & { id?: number };

const TITLES: Record<Kind, { h1: string; sub: string; addLabel: string }> = {
  hero: { h1: "Обложка (слайды)", sub: "Слайды на главной странице", addLabel: "Добавить слайд" },
  news: { h1: "Что нового", sub: "Карточки в блоке «Что нового»", addLabel: "Добавить карточку" },
  blog: { h1: "Статьи блога", sub: "Записи в разделе «Блог»", addLabel: "Добавить статью" },
};

const NEW_DEFAULTS: Record<Kind, Item> = {
  hero: { title: "Новый слайд", subtitle: "", image_url: "", bg_gradient: "linear-gradient(135deg,#0a0535 0%,#1a0a6e 45%,#2d0060 100%)", accent_color: "#FD4160", sort_order: 99, is_active: true },
  news: { title: "Новая карточка", tag: "Новости", tag_icon: "Sparkles", image_url: "", image_position: "top", bg_color: "#FFFFFF", is_light: false, sort_order: 99, is_active: true },
  blog: { title: "Новая статья", excerpt: "Краткое описание", body: "", tag: "Новости", color: "from-[#FD4160] to-[#0077FF]", is_published: true, sort_order: 99 },
};

// Готовые градиенты для обложки
const PRESET_GRADIENTS = [
  { label: "Фиолетовая ночь", value: "linear-gradient(135deg,#0a0535 0%,#1a0a6e 45%,#2d0060 100%)" },
  { label: "Синий океан", value: "linear-gradient(135deg,#001a3a 0%,#003080 45%,#0a1a50 100%)" },
  { label: "Тёмная роза", value: "linear-gradient(135deg,#1a0010 0%,#4a0020 45%,#2a0040 100%)" },
  { label: "Зелёный лес", value: "linear-gradient(135deg,#002010 0%,#004a20 45%,#003015 100%)" },
  { label: "Закат", value: "linear-gradient(135deg,#3a0a00 0%,#8a2000 45%,#5a1000 100%)" },
  { label: "Золото", value: "linear-gradient(135deg,#1a1000 0%,#4a3000 45%,#2a1a00 100%)" },
  { label: "Арктика", value: "linear-gradient(135deg,#001525 0%,#003050 45%,#002040 100%)" },
  { label: "Пурпур", value: "linear-gradient(135deg,#200040 0%,#500090 45%,#300060 100%)" },
  { label: "Уголь", value: "linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 45%,#0f0f1a 100%)" },
  { label: "Рассвет", value: "linear-gradient(135deg,#1a0a20 0%,#4a1060 45%,#200a30 100%)" },
];

// Готовые цвета акцент-кнопки
const PRESET_ACCENTS = [
  { label: "Красный", value: "#FD4160" },
  { label: "Синий", value: "#0077FF" },
  { label: "Зелёный", value: "#C1F089" },
  { label: "Белый", value: "#FFFFFF" },
  { label: "Фиолетовый", value: "#7c3aed" },
  { label: "Жёлтый", value: "#FFD600" },
  { label: "Оранжевый", value: "#FF6B2B" },
  { label: "Розовый", value: "#FF4FD8" },
];

export default function AdminContent({ kind }: { kind: Kind }) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await request<{ items: Item[] }>("content", { query: { kind, all: 1 } });
      setItems(items);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [kind]);

  const save = async () => {
    if (!editing) return;
    if (editing.id) {
      await request("content", { method: "PUT", query: { kind }, body: editing });
    } else {
      await request("content", { method: "POST", query: { kind }, body: editing });
    }
    setEditing(null);
    load();
  };

  const remove = async (it: Item) => {
    if (!it.id || !confirm("Скрыть эту запись?")) return;
    await request("content", { method: "DELETE", query: { kind, id: it.id } });
    load();
  };

  const t = TITLES[kind];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-black mb-1">{t.h1}</h1>
          <p className="text-black/50">{t.sub}</p>
        </div>
        <button onClick={() => setEditing({ ...NEW_DEFAULTS[kind] })}
          className="px-5 py-2.5 rounded-xl bg-[#FD4160] text-white font-semibold text-sm hover:bg-[#e0324f] flex items-center gap-2">
          <Icon name="Plus" size={16} /> {t.addLabel}
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={String(it.id)} className="bg-white rounded-2xl overflow-hidden border border-black/6">
              {kind === "hero" && (
                <div className="h-24 relative" style={{ background: String(it.bg_gradient || "#eee") }}>
                  {it.image_url && <img src={String(it.image_url)} alt="" className="w-full h-full object-cover opacity-40 absolute inset-0" />}
                  <div className="absolute bottom-2 left-3">
                    <span className="inline-block w-5 h-5 rounded-full border-2 border-white/50" style={{ background: String(it.accent_color || "#FD4160") }} />
                  </div>
                </div>
              )}
              {Boolean(it.image_url) && kind !== "hero" && (
                <div className="h-32 bg-black/5 overflow-hidden">
                  <img src={String(it.image_url)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-black/40 font-semibold mb-1">{String(it.tag || "")}</div>
                <h3 className="font-medium text-black text-sm mb-2 line-clamp-2">{String(it.title)}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(it)}
                    className="flex-1 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black/70 text-xs font-semibold">
                    Редактировать
                  </button>
                  <button onClick={() => remove(it)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Скрыть">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
                {(it.is_active === false || it.is_published === false) && (
                  <div className="mt-2 text-[11px] text-black/40">⊘ Скрыто</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal item={editing} kind={kind} onChange={setEditing} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function GradientPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/40 font-semibold block mb-2">Фон обложки</label>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {PRESET_GRADIENTS.map(g => (
          <button key={g.value} title={g.label} onClick={() => onChange(g.value)}
            className={`h-10 rounded-xl transition-all ${value === g.value ? "ring-2 ring-[#1a0a6e] ring-offset-2 scale-105" : "hover:scale-105"}`}
            style={{ background: g.value }} />
        ))}
      </div>
      <div className="text-[11px] text-black/35 mt-1 truncate">{value}</div>
    </div>
  );
}

function AccentPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/40 font-semibold block mb-2">Цвет кнопки</label>
      <div className="flex flex-wrap gap-2">
        {PRESET_ACCENTS.map(a => (
          <button key={a.value} title={a.label} onClick={() => onChange(a.value)}
            className={`w-8 h-8 rounded-xl border-2 transition-all ${value === a.value ? "border-[#1a0a6e] scale-110" : "border-transparent hover:scale-105"}`}
            style={{ background: a.value }} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-6 h-6 rounded-lg border border-black/10" style={{ background: value }} />
        <span className="text-[11px] text-black/40 font-mono">{value}</span>
      </div>
    </div>
  );
}

function Modal({ item, kind, onChange, onSave, onClose }: {
  item: Item; kind: Kind; onChange: (i: Item) => void; onSave: () => void; onClose: () => void;
}) {
  const set = (k: string, v: unknown) => onChange({ ...item, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">{item.id ? "Редактирование" : "Создание"}</h2>
        <div className="space-y-4">
          <Field label="Заголовок" value={String(item.title || "")} onChange={(v) => set("title", v)} multiline />
          {kind === "hero" && (
            <>
              <Field label="Подзаголовок" value={String(item.subtitle || "")} onChange={(v) => set("subtitle", v)} multiline />
              <Field label="Картинка (URL)" value={String(item.image_url || "")} onChange={(v) => set("image_url", v)} />
              <GradientPicker value={String(item.bg_gradient || "")} onChange={(v) => set("bg_gradient", v)} />
              <AccentPicker value={String(item.accent_color || "#FD4160")} onChange={(v) => set("accent_color", v)} />
            </>
          )}
          {kind === "news" && (
            <>
              <Field label="Тег" value={String(item.tag || "")} onChange={(v) => set("tag", v)} />
              <Field label="Иконка тега" value={String(item.tag_icon || "")} onChange={(v) => set("tag_icon", v)} />
              <Field label="Картинка (URL)" value={String(item.image_url || "")} onChange={(v) => set("image_url", v)} />
              <Select label="Позиция картинки" value={String(item.image_position || "top")} options={[
                { v: "top", l: "Сверху" }, { v: "center", l: "По центру (фон)" }, { v: "none", l: "Без картинки" },
              ]} onChange={(v) => set("image_position", v)} />
              <Field label="Цвет фона (HEX)" value={String(item.bg_color || "")} onChange={(v) => set("bg_color", v)} />
              <Check label="Светлый текст" value={Boolean(item.is_light)} onChange={(v) => set("is_light", v)} />
            </>
          )}
          {kind === "blog" && (
            <>
              <Field label="Краткое описание" value={String(item.excerpt || "")} onChange={(v) => set("excerpt", v)} multiline />
              <Field label="Полный текст" value={String(item.body || "")} onChange={(v) => set("body", v)} multiline rows={5} />
              <Field label="Тег" value={String(item.tag || "")} onChange={(v) => set("tag", v)} />
              <Field label="Дата (YYYY-MM-DD)" value={String(item.published_at || "").substring(0, 10)} onChange={(v) => set("published_at", v)} />
              <Field label="Цвет (Tailwind)" value={String(item.color || "")} onChange={(v) => set("color", v)} />
              <Check label="Опубликовано" value={Boolean(item.is_published)} onChange={(v) => set("is_published", v)} />
            </>
          )}
          <Field label="Порядок" value={String(item.sort_order ?? 0)} onChange={(v) => set("sort_order", Number(v) || 0)} />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/70 font-semibold">Отмена</button>
          <button onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-black text-white font-semibold">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, rows }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number }) {
  return (
    <div>
      <label className="text-xs text-black/40 font-semibold block mb-1.5">{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows ?? 2} className="w-full px-3 py-2 rounded-xl bg-black/4 border border-black/8 text-black text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/20" />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/4 border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/20" />
      }
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<{ v: string; l: string }>; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/40 font-semibold block mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/4 border border-black/8 text-black text-sm focus:outline-none">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors ${value ? "bg-[#1a0a6e]" : "bg-black/15"} relative`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-1"}`} />
      </div>
      <span className="text-sm text-black/70 font-medium">{label}</span>
    </label>
  );
}
