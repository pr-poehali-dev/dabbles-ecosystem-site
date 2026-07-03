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

const TYPE_LABELS: Record<string, string> = {
  banner: "Баннер-обложка",
  quick: "Быстрые иконки",
  finance: "Вкладка «Сервисы»",
  life: "Вкладка «Для жизни»",
};

const GRADIENTS = [
  "from-[#0077FF] to-[#56CCF2]",
  "from-[#FD4160] to-[#0077FF]",
  "from-[#0077FF] to-[#C1F089]",
  "from-[#1a0a6e] to-[#7c3aed]",
  "from-[#7c3aed] to-[#4f46e5]",
  "from-[#1a0a6e] to-[#0077FF]",
  "from-[#FD4160] to-[#FF8A5B]",
  "from-[#222] to-[#444]",
];

const ICONS = ["Sparkles", "CheckSquare", "FileText", "Compass", "CalendarDays", "FileSignature", "Briefcase", "Building2", "Gift", "Rocket", "Star", "Heart"];

function newCard(type: string): Card {
  return {
    card_type: type,
    title: type === "quick" ? "Новый\nсервис" : "Новая карточка",
    subtitle: "",
    icon: "Sparkles",
    image_url: "",
    gradient: "from-[#1a0a6e] to-[#0077FF]",
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
      setItems(items);
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
    if (!it.id || !confirm("Скрыть карточку?")) return;
    await request("content", { method: "DELETE", query: { kind: "home", id: it.id } });
    load();
  };

  const groups = ["banner", "quick", "finance", "life"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-black mb-1">Главная страница</h1>
        <p className="text-black/50">Обложка-баннер и карточки сервисов на главной</p>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        groups.map((g) => {
          const list = items.filter((i) => i.card_type === g).sort((a, b) => a.sort_order - b.sort_order);
          return (
            <div key={g} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-black text-lg">{TYPE_LABELS[g] || g}</h2>
                <button
                  onClick={() => setEditing(newCard(g))}
                  className="px-4 py-2 rounded-xl bg-[#FD4160] text-white font-semibold text-sm hover:bg-[#e0324f] flex items-center gap-1.5"
                >
                  <Icon name="Plus" size={15} /> Добавить
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((it) => (
                  <div key={it.id} className="bg-white rounded-2xl overflow-hidden border border-black/6">
                    <div className="h-20 relative bg-[#f0f0f5]">
                      {it.image_url ? (
                        <img src={it.image_url} alt="" className="w-full h-full object-cover" />
                      ) : it.card_type === "quick" || it.is_feature ? (
                        <div className={`w-full h-full bg-gradient-to-br ${it.gradient || "from-[#1a0a6e] to-[#0077FF]"} flex items-center justify-center`}>
                          <Icon name={it.icon || "Sparkles"} size={26} className="text-white" />
                        </div>
                      ) : null}
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-medium text-black text-sm mb-2 line-clamp-2 whitespace-pre-line">{it.title}</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(it)}
                          className="flex-1 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black/70 text-xs font-semibold">
                          Редактировать
                        </button>
                        <button onClick={() => remove(it)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Скрыть">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                      {it.is_active === false && <div className="mt-2 text-[11px] text-black/40">⊘ Скрыто</div>}
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div className="text-black/30 text-sm py-2">Нет карточек</div>}
              </div>
            </div>
          );
        })
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

  const isQuick = item.card_type === "quick";
  const isBanner = item.card_type === "banner";

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
          {item.id ? "Редактирование" : "Создание"} · {TYPE_LABELS[item.card_type]}
        </h2>

        <div className="space-y-4">
          {/* Заголовок */}
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">
              Заголовок {isQuick && "(перенос строки — Enter)"}
            </label>
            <textarea
              value={item.title}
              onChange={(e) => set("title", e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20 resize-none"
            />
          </div>

          {/* Подзаголовок (баннер) */}
          {isBanner && (
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Подзаголовок</label>
              <input value={item.subtitle} onChange={(e) => set("subtitle", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
            </div>
          )}

          {/* Ссылка (не для баннера — у баннера свои 2 кнопки) */}
          {!isBanner && (
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Ссылка (URL или /путь, пусто = неактивна)</label>
              <input value={item.href} onChange={(e) => set("href", e.target.value)}
                placeholder="/about или https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20" />
            </div>
          )}

          {/* Кнопки баннера (если пусто — кнопка не показывается на сайте) */}
          {isBanner && (
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
          )}

          {/* Иконка + градиент для quick / feature */}
          {(isQuick || item.is_feature) && (
            <>
              <div>
                <label className="text-xs text-black/40 font-semibold block mb-2">Иконка</label>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((ic) => (
                    <button key={ic} onClick={() => set("icon", ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        item.icon === ic ? "bg-[#0077FF] text-white scale-105" : "bg-[#f5f5f7] text-black/50 hover:bg-black/10"
                      }`}>
                      <Icon name={ic} size={18} />
                    </button>
                  ))}
                </div>
              </div>
              {isQuick && (
                <div>
                  <label className="text-xs text-black/40 font-semibold block mb-2">Цвет фона</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map((g) => (
                      <button key={g} onClick={() => set("gradient", g)}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${
                          item.gradient === g ? "ring-2 ring-[#1a0a6e] ring-offset-2 scale-105" : "hover:scale-105"
                        }`} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Картинка для карточек finance/life/banner */}
          {!isQuick && (
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
          )}

          {/* Флаги для finance/life */}
          {(item.card_type === "finance" || item.card_type === "life") && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-black/70 cursor-pointer">
                <input type="checkbox" checked={item.is_feature} onChange={(e) => set("is_feature", e.target.checked)} />
                Акцентная (синяя)
              </label>
              <label className="flex items-center gap-2 text-sm text-black/70 cursor-pointer">
                <input type="checkbox" checked={item.is_light} onChange={(e) => set("is_light", e.target.checked)} />
                Тёмная
              </label>
            </div>
          )}

          {/* Порядок */}
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Порядок (меньше = выше)</label>
            <input type="number" value={item.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-24 px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
          </div>
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