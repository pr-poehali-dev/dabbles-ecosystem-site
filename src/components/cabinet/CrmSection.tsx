import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Client = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: string;
  amount: number;
  notes: string;
};

const STAGES = [
  { key: "lead", label: "Лид", color: "#94a3b8" },
  { key: "contact", label: "Контакт", color: "#0077FF" },
  { key: "deal", label: "Сделка", color: "#FD4160" },
  { key: "won", label: "Закрыта успешно", color: "#22c55e" },
  { key: "lost", label: "Отказ", color: "#64748b" },
];

const empty: Partial<Client> = { name: "", company: "", email: "", phone: "", stage: "lead", amount: 0, notes: "" };

export default function CrmSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Partial<Client> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await request<{ items: Client[] }>("workspace", { query: { kind: "crm" } });
      setClients(items);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name) return;
    if (editing.id) {
      await request("workspace", { method: "PUT", query: { kind: "crm" }, body: editing });
    } else {
      await request("workspace", { method: "POST", query: { kind: "crm" }, body: editing });
    }
    setEditing(null);
    load();
  };

  const totalByStage = (stage: string) =>
    clients.filter((c) => c.stage === stage).reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-black mb-1">CRM</h1>
          <p className="text-black/50">Клиенты и воронка сделок</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/85 flex items-center gap-2"
        >
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>

      {/* STAGES SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {STAGES.map((s) => (
          <div key={s.key} className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <div className="text-xs text-black/50">{s.label}</div>
            </div>
            <div className="font-display text-xl font-black text-black">
              {clients.filter((c) => c.stage === s.key).length}
            </div>
            <div className="text-[11px] text-black/40">{totalByStage(s.key).toLocaleString("ru-RU")} ₽</div>
          </div>
        ))}
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {clients.length === 0 && (
            <div className="p-10 text-center text-black/40 text-sm">Клиентов пока нет</div>
          )}
          {clients.map((c, i) => {
            const stage = STAGES.find((s) => s.key === c.stage);
            return (
              <button
                key={c.id}
                onClick={() => setEditing(c)}
                className={`w-full text-left p-4 flex items-center gap-4 hover:bg-black/3 transition-colors ${i > 0 ? "border-t border-black/5" : ""}`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: stage?.color }}
                >
                  {c.name.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-black truncate">{c.name}</div>
                  <div className="text-xs text-black/45">{c.company || c.email || c.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-black">{Number(c.amount).toLocaleString("ru-RU")} ₽</div>
                  <div className="text-[11px]" style={{ color: stage?.color }}>{stage?.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black text-black mb-4">
              {editing.id ? "Карточка клиента" : "Новый клиент"}
            </h2>
            <div className="space-y-3">
              <Field label="Имя" value={editing.name || ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Компания" value={editing.company || ""} onChange={(v) => setEditing({ ...editing, company: v })} />
              <Field label="Email" value={editing.email || ""} onChange={(v) => setEditing({ ...editing, email: v })} />
              <Field label="Телефон" value={editing.phone || ""} onChange={(v) => setEditing({ ...editing, phone: v })} />
              <div>
                <label className="text-xs text-black/50 mb-1.5 block">Стадия</label>
                <select
                  value={editing.stage || "lead"}
                  onChange={(e) => setEditing({ ...editing, stage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-black outline-none"
                >
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <Field
                label="Сумма (₽)"
                value={String(editing.amount ?? 0)}
                onChange={(v) => setEditing({ ...editing, amount: Number(v) || 0 })}
              />
              <div>
                <label className="text-xs text-black/50 mb-1.5 block">Заметки</label>
                <textarea
                  rows={3}
                  value={editing.notes || ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-black outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/70 font-semibold">
                  Отмена
                </button>
                <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-black text-white font-semibold">
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
      />
    </div>
  );
}
