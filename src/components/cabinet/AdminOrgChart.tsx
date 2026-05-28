import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type OrgNode = {
  id: number;
  parent_id: number | null;
  title: string;
  subtitle: string;
  description: string;
  sort_order: number;
};

const emptyForm = { title: "", subtitle: "", description: "", parent_id: "" as string | number, sort_order: 0 };

export default function AdminOrgChart() {
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<OrgNode | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { nodes } = await request<{ nodes: OrgNode[] }>("public-data", {
        query: { action: "org" }, auth: false,
      });
      setNodes(nodes);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const action = editing ? "org-update" : "org-create";
      await request("admin-users", {
        method: editing ? "PUT" : "POST",
        query: { action },
        body: {
          ...(editing ? { id: editing.id } : {}),
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          parent_id: form.parent_id === "" ? null : Number(form.parent_id),
          sort_order: Number(form.sort_order),
        },
      });
      setEditing(null);
      setCreating(false);
      setForm({ ...emptyForm });
      load();
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить узел? Все дочерние тоже удалятся.")) return;
    await request("admin-users", {
      method: "PUT",
      query: { action: "org-delete" },
      body: { id },
    });
    load();
  };

  const startEdit = (node: OrgNode) => {
    setEditing(node);
    setCreating(false);
    setForm({
      title: node.title,
      subtitle: node.subtitle,
      description: node.description,
      parent_id: node.parent_id ?? "",
      sort_order: node.sort_order,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyForm });
  };

  const getIndent = (node: OrgNode): number => {
    if (node.parent_id === null) return 0;
    const parent = nodes.find((n) => n.id === node.parent_id);
    return parent ? getIndent(parent) + 1 : 1;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-black mb-1">Структура компании</h1>
          <p className="text-black/50">Орг-схема на странице «О компании»</p>
        </div>
        <button
          onClick={startCreate}
          className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] text-white font-semibold text-sm flex items-center gap-2"
        >
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-black/6 mb-6">
          {nodes.length === 0 && (
            <div className="px-6 py-10 text-center text-black/35 text-sm">Нет узлов. Добавьте первый.</div>
          )}
          {nodes.map((node) => {
            const indent = getIndent(node);
            return (
              <div
                key={node.id}
                className="flex items-center gap-3 px-5 py-4 border-b border-black/5 last:border-0 hover:bg-black/2 transition-colors"
              >
                <div style={{ paddingLeft: indent * 20 }} className="flex items-center gap-3 flex-1 min-w-0">
                  {indent > 0 && <Icon name="CornerDownRight" size={14} className="text-black/25 shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-black text-sm truncate">{node.title}</div>
                    <div className="text-black/40 text-xs">{node.subtitle}</div>
                  </div>
                </div>
                <div className="text-black/25 text-xs shrink-0">порядок: {node.sort_order}</div>
                <button
                  onClick={() => startEdit(node)}
                  className="p-1.5 rounded-lg hover:bg-black/8 text-black/40 hover:text-black transition-colors"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => remove(node.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-black/30 hover:text-red-500 transition-colors"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {(creating || editing) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setCreating(false); setEditing(null); }}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black text-black mb-5">
              {creating ? "Новый узел" : "Редактировать"}
            </h2>
            <div className="space-y-3">
              <Field label="Имя / Название *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Например: Сергей Серебренников" />
              <Field label="Должность / Подзаголовок" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="Генеральный директор" />
              <Field label="Описание" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
              <div>
                <label className="text-xs text-black/50 mb-1.5 block font-medium">Родительский узел</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black bg-white"
                >
                  <option value="">— Корневой (нет родителя) —</option>
                  {nodes
                    .filter((n) => !editing || n.id !== editing.id)
                    .map((n) => (
                      <option key={n.id} value={n.id}>{n.title} — {n.subtitle}</option>
                    ))}
                </select>
              </div>
              <Field
                label="Порядок сортировки"
                value={String(form.sort_order)}
                onChange={(v) => setForm({ ...form, sort_order: Number(v) || 0 })}
                placeholder="0"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setCreating(false); setEditing(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/70 font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Icon name="Loader" size={14} className="animate-spin" />}
                  {creating ? "Создать" : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block font-medium">{label}</label>
      {multiline ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black resize-none" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black" />
      )}
    </div>
  );
}
