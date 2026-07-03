import { useEffect, useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { campApi } from "@/lib/camp-api";

type Program = {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  duration_label: string;
  level: string;
  sort_order: number;
  is_active?: boolean;
};

const LEVELS = ["Начальный", "Средний", "Продвинутый"];

function newProgram(): Program {
  return { title: "Новая программа", description: "", image_url: "", duration_label: "", level: "Начальный", sort_order: 99, is_active: true };
}

export default function AdminCampPrograms({ onEdit }: { onEdit: (id: number) => void }) {
  const [items, setItems] = useState<Program[]>([]);
  const [editing, setEditing] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { programs } = await campApi.adminPrograms();
      setItems(programs);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await campApi.adminProgramSave(editing as unknown as Record<string, unknown>);
    setEditing(null);
    load();
  };

  const remove = async (p: Program) => {
    if (!p.id || !confirm("Скрыть программу?")) return;
    await campApi.adminProgramDelete(p.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-black text-lg">Программы обучения</h2>
        <button onClick={() => setEditing(newProgram())}
          className="px-4 py-2 rounded-xl text-black font-semibold text-sm flex items-center gap-1.5"
          style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
          <Icon name="Plus" size={15} /> Добавить программу
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-black/6">
              <div className="h-24 relative bg-[#f0f0f5]">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
                    <Icon name="BookOpen" size={24} className="text-black/70" />
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-medium text-black text-sm mb-1 line-clamp-2">{p.title}</h3>
                <p className="text-[11px] text-black/35 mb-2">{p.level} · {p.duration_label || "—"}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => p.id && onEdit(p.id)}
                    className="flex-1 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-black/80">
                    Модули и тесты
                  </button>
                  <button onClick={() => setEditing(p)}
                    className="p-2 rounded-lg hover:bg-black/5 text-black/50" title="Редактировать">
                    <Icon name="Pencil" size={14} />
                  </button>
                  <button onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Скрыть">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
                {p.is_active === false && <div className="mt-2 text-[11px] text-black/40">⊘ Скрыто</div>}
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-black/30 text-sm py-2">Нет программ</div>}
        </div>
      )}

      {editing && <ProgramModal item={editing} onChange={setEditing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProgramModal({ item, onChange, onSave, onClose }: {
  item: Program; onChange: (p: Program) => void; onSave: () => void; onClose: () => void;
}) {
  const set = (k: keyof Program, v: unknown) => onChange({ ...item, [k]: v });
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
      const res = await campApi.upload(b64, ext);
      set("image_url", res.url);
    } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 md:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">
          {item.id ? "Редактирование" : "Создание"} программы
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Название</label>
            <input value={item.title} onChange={(e) => set("title", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Описание</label>
            <textarea value={item.description} onChange={(e) => set("description", e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Уровень</label>
              <select value={item.level} onChange={(e) => set("level", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Длительность</label>
              <input value={item.duration_label} onChange={(e) => set("duration_label", e.target.value)}
                placeholder="2 часа"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Картинка</label>
            {item.image_url && (
              <div className="h-28 rounded-xl overflow-hidden mb-2 bg-[#f0f0f5]">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-black/12 rounded-xl py-3 flex items-center justify-center gap-2 text-black/50 hover:border-[#DAB332]/50 hover:text-[#DAB332] transition-colors text-sm font-semibold">
              {uploading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Upload" size={16} />}
              {uploading ? "Загрузка..." : item.image_url ? "Заменить картинку" : "Загрузить картинку"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Порядок (меньше = выше)</label>
            <input type="number" value={item.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-24 px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onSave} className="flex-1 py-3 rounded-xl text-black font-semibold"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
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
