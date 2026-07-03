import { useEffect, useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Card = {
  id?: number;
  card_type: string;
  title: string;
  subtitle: string;
  icon: string;
  image_url: string;
  gradient: string;
  href: string;
  is_light: boolean;
  is_feature: boolean;
  sort_order: number;
  is_active?: boolean;
  button1_text: string;
  button1_href: string;
  button2_text: string;
  button2_href: string;
};

function newCard(): Card {
  return {
    card_type: "banner",
    title: "Новая обложка",
    subtitle: "",
    icon: "",
    image_url: "",
    gradient: "",
    href: "",
    is_light: false,
    is_feature: false,
    sort_order: 99,
    is_active: true,
    button1_text: "",
    button1_href: "",
    button2_text: "",
    button2_href: "",
  };
}

export default function AdminHome() {
  const [items, setItems] = useState<Card[]>([]);
  const [editing, setEditing] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await request<{ items: Card[] }>("content", { query: { kind: "home", all: 1 } });
      setItems(items.filter((i) => i.card_type === "banner").sort((a, b) => a.sort_order - b.sort_order));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (editing.id) await request("content", { method: "PUT", query: { kind: "home" }, body: editing });
    else await request("content", { method: "POST", query: { kind: "home" }, body: editing });
    setEditing(null);
    load();
  };

  const remove = async (it: Card) => {
    if (!it.id || !confirm("Удалить обложку без возможности восстановления?")) return;
    await request("content", { method: "DELETE", query: { kind: "home", id: it.id } });
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-black mb-1">Главная страница</h1>
        <p className="text-black/50">Обложки-баннеры на главной (карусель, если их несколько)</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-black text-lg">Обложки</h2>
        <button
          onClick={() => setEditing(newCard())}
          className="px-4 py-2 rounded-xl bg-[#FD4160] text-white font-semibold text-sm hover:bg-[#e0324f] flex items-center gap-1.5"
        >
          <Icon name="Plus" size={15} /> Добавить обложку
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it) => (
            <div key={it.id} className="bg-white rounded-2xl overflow-hidden border border-black/6">
              <div className="h-24 relative bg-[#f0f0f5]">
                {it.image_url ? (
                  <img src={it.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#9FC96D] to-[#C1F089] flex items-center justify-center">
                    <Icon name="Image" size={24} className="text-white/80" />
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-medium text-black text-sm mb-2 line-clamp-2 whitespace-pre-line">{it.title}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(it)}
                    className="flex-1 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black/70 text-xs font-semibold">
                    Редактировать
                  </button>
                  <button onClick={() => remove(it)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Удалить">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
                {it.is_active === false && <div className="mt-2 text-[11px] text-black/40">⊘ Скрыто</div>}
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-black/30 text-sm py-2">Нет обложек</div>}
        </div>
      )}

      {editing && <CardModal item={editing} onChange={setEditing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CardModal({ item, onChange, onSave, onClose }: {
  item: Card; onChange: (c: Card) => void; onSave: () => void; onClose: () => void;
}) {
  const set = (k: keyof Card, v: unknown) => onChange({ ...item, [k]: v });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const res = await request<{ url: string }>("content", {
        method: "POST", query: { action: "upload" },
        body: { file: b64, ext, folder: "home" },
      });
      set("image_url", res.url);
    } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 md:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">
          {item.id ? "Редактирование" : "Создание"} обложки
        </h2>

        <div className="space-y-4">
          {/* Заголовок */}
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Заголовок</label>
            <textarea
              value={item.title}
              onChange={(e) => set("title", e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20 resize-none"
            />
          </div>

          {/* Подзаголовок */}
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Подзаголовок</label>
            <input value={item.subtitle} onChange={(e) => set("subtitle", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
          </div>

          {/* Кнопки обложки */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[#f9f9fb] border border-black/6">
            <div className="text-xs text-black/40 font-semibold">Кнопки обложки (оставьте пустыми, чтобы не показывать)</div>
            <div className="grid grid-cols-2 gap-2">
              <input value={item.button1_text} onChange={(e) => set("button1_text", e.target.value)}
                placeholder="Текст кнопки 1"
                className="px-3 py-2 rounded-lg bg-white border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
              <input value={item.button1_href} onChange={(e) => set("button1_href", e.target.value)}
                placeholder="Ссылка 1"
                className="px-3 py-2 rounded-lg bg-white border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={item.button2_text} onChange={(e) => set("button2_text", e.target.value)}
                placeholder="Текст кнопки 2"
                className="px-3 py-2 rounded-lg bg-white border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
              <input value={item.button2_href} onChange={(e) => set("button2_href", e.target.value)}
                placeholder="Ссылка 2"
                className="px-3 py-2 rounded-lg bg-white border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
            </div>
          </div>

          {/* Картинка */}
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Картинка</label>
            {item.image_url && (
              <div className="h-28 rounded-xl overflow-hidden mb-2 bg-[#f0f0f5]">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-black/12 rounded-xl py-3 flex items-center justify-center gap-2 text-black/50 hover:border-[#0077FF]/30 hover:text-[#0077FF] transition-colors text-sm font-semibold">
              {uploading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Upload" size={16} />}
              {uploading ? "Загрузка..." : item.image_url ? "Заменить картинку" : "Загрузить картинку"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
          </div>

          {/* Порядок */}
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Порядок (меньше = выше)</label>
            <input type="number" value={item.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-24 px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
          </div>

          {/* Активность */}
          <label className="flex items-center gap-2 text-sm text-black/70 cursor-pointer">
            <input type="checkbox" checked={item.is_active !== false} onChange={(e) => set("is_active", e.target.checked)} />
            Показывать на сайте
          </label>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onSave} className="flex-1 py-3 rounded-xl bg-[#1a0a6e] text-white font-semibold hover:bg-[#0a0535]">
            Сохранить
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl bg-black/5 text-black/60 font-semibold hover:bg-black/10">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
