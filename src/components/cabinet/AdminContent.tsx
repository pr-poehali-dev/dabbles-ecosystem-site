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
  hero: {
    title: "Новый слайд",
    subtitle: "",
    image_url: "",
    bg_gradient: "linear-gradient(135deg,#0a0535 0%,#1a0a6e 45%,#2d0060 100%)",
    accent_color: "#FD4160",
    sort_order: 99,
    is_active: true,
  },
  news: {
    title: "Новая карточка",
    tag: "Новости",
    tag_icon: "Sparkles",
    image_url: "",
    image_position: "top",
    bg_color: "#FFFFFF",
    is_light: false,
    sort_order: 99,
    is_active: true,
  },
  blog: {
    title: "Новая статья",
    excerpt: "Краткое описание",
    body: "",
    tag: "Новости",
    color: "from-[#FD4160] to-[#0077FF]",
    is_published: true,
    sort_order: 99,
  },
};

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
        <button
          onClick={() => setEditing({ ...NEW_DEFAULTS[kind] })}
          className="px-5 py-2.5 rounded-xl bg-[#FD4160] text-white font-semibold text-sm hover:bg-[#e0324f] flex items-center gap-2"
        >
          <Icon name="Plus" size={16} /> {t.addLabel}
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={String(it.id)} className="bg-white rounded-2xl overflow-hidden">
              {Boolean(it.image_url) && (
                <div className="h-32 bg-black/5 overflow-hidden">
                  <img src={String(it.image_url)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-black/40 font-semibold mb-1">
                  {String(it.tag || "")}
                </div>
                <h3 className="font-medium text-black text-sm mb-2 line-clamp-2">{String(it.title)}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(it)}
                    className="flex-1 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black/70 text-xs font-semibold"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => remove(it)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    title="Скрыть"
                  >
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

function Modal({
  item, kind, onChange, onSave, onClose,
}: {
  item: Item; kind: Kind; onChange: (i: Item) => void; onSave: () => void; onClose: () => void;
}) {
  const set = (k: string, v: unknown) => onChange({ ...item, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">
          {item.id ? "Редактирование" : "Создание"}
        </h2>
        <div className="space-y-3">
          <Field label="Заголовок" value={String(item.title || "")} onChange={(v) => set("title", v)} multiline />
          {kind === "hero" && (
            <>
              <Field label="Подзаголовок" value={String(item.subtitle || "")} onChange={(v) => set("subtitle", v)} multiline />
              <Field label="Картинка (URL)" value={String(item.image_url || "")} onChange={(v) => set("image_url", v)} />
              <Field label="Фон-градиент" value={String(item.bg_gradient || "")} onChange={(v) => set("bg_gradient", v)} />
              <Field label="Цвет кнопки (HEX)" value={String(item.accent_color || "")} onChange={(v) => set("accent_color", v)} />
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
      <label className="text-xs text-black/50 mb-1.5 block">{label}</label>
      {multiline ? (
        <textarea
          rows={rows || 2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
        />
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-black/10 outline-none text-black"
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      <span className="text-sm text-black/70">{label}</span>
    </label>
  );
}
