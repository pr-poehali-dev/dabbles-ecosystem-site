import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { edoApi, EdoUser, EdoDoc, TYPE_LABEL } from "@/lib/edo-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const DOC_TYPES = Object.entries(TYPE_LABEL);

export default function EdoDocForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<EdoUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    doc_type: "internal",
    content: "",
    from_org: "",
    to_org: "",
    due_date: "",
    assignee_id: "",
    notes: "",
  });

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    edoApi.users().then(r => setUsers(r.users));
    if (isEdit) {
      setLoading(true);
      edoApi.get(Number(id)).then(r => {
        const d: EdoDoc = r.doc;
        setDocId(d.id);
        setFileUrl(d.file_url || "");
        setFileName(d.file_name || "");
        setForm({
          title: d.title,
          doc_type: d.doc_type,
          content: d.content || "",
          from_org: d.from_org || "",
          to_org: d.to_org || "",
          due_date: d.due_date || "",
          assignee_id: d.assignee?.id ? String(d.assignee.id) : "",
          notes: d.notes || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docId) return;
    setUploadingFile(true);
    try {
      const r = await edoApi.upload(docId, file);
      setFileUrl(r.file_url);
      setFileName(r.file_name);
      toast({ title: "Файл загружен", description: r.file_name });
    } catch {
      toast({ title: "Ошибка загрузки файла", variant: "destructive" });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast({ title: "Введите название", variant: "destructive" });
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
        due_date: form.due_date || null,
      };
      if (isEdit) {
        await edoApi.update({ id: Number(id), ...payload });
        toast({ title: "Документ обновлён" });
        navigate(`/edo/docs/${id}`);
      } else {
        const r = await edoApi.create(payload);
        toast({ title: "Документ создан", description: r.doc_number });
        navigate(`/edo/docs/${r.id}`);
      }
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-black/40 hover:text-black transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">
            {isEdit ? "Редактировать документ" : "Новый документ"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6 space-y-4">
          <h2 className="font-bold text-black text-[15px] mb-1">Основное</h2>

          <div>
            <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Название *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} required
              placeholder="Например: Договор на поставку оборудования №123"
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Тип документа</label>
              <select value={form.doc_type} onChange={e => set("doc_type", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7]">
                {DOC_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Срок исполнения</label>
              <input type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">От организации</label>
              <input value={form.from_org} onChange={e => set("from_org", e.target.value)}
                placeholder="Откуда"
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7]" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Кому</label>
              <input value={form.to_org} onChange={e => set("to_org", e.target.value)}
                placeholder="Получатель"
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7]" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Исполнитель</label>
            <select value={form.assignee_id} onChange={e => set("assignee_id", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7]">
              <option value="">— не назначен —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}{u.position ? ` (${u.position})` : ""}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6 space-y-4">
          <h2 className="font-bold text-black text-[15px] mb-1">Содержание</h2>
          <div>
            <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Текст документа</label>
            <textarea value={form.content} onChange={e => set("content", e.target.value)} rows={8}
              placeholder="Введите текст документа..."
              className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7] resize-none" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Примечания</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              placeholder="Дополнительные пометки..."
              className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f5f5f7] resize-none" />
          </div>
        </div>

        {isEdit && docId && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6">
            <h2 className="font-bold text-black text-[15px] mb-4">Файл</h2>
            {fileName && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[#f5f5f7]">
                <Icon name="Paperclip" size={16} className="text-[#1a0a6e]" />
                <a href={fileUrl} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-[#1a0a6e] hover:underline flex-1 truncate">{fileName}</a>
              </div>
            )}
            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploadingFile ? "border-[#1a0a6e]/30 bg-[#1a0a6e]/3" : "border-black/15 hover:border-[#1a0a6e]/40"}`}>
              <Icon name={uploadingFile ? "Loader2" : "Upload"} size={18} className={`text-black/40 ${uploadingFile ? "animate-spin" : ""}`} />
              <span className="text-sm text-black/50">{uploadingFile ? "Загружаю..." : "Прикрепить или заменить файл"}</span>
              <input type="file" className="hidden" onChange={handleFile} disabled={uploadingFile} />
            </label>
          </div>
        )}

        <div className="flex gap-3 justify-end pb-8">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60 hover:bg-black/5 transition-colors">
            Отмена
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold hover:bg-[#2d1a8e] disabled:opacity-50 transition-colors">
            {saving && <Icon name="Loader2" size={14} className="animate-spin" />}
            {isEdit ? "Сохранить" : "Создать документ"}
          </button>
        </div>
      </form>
    </div>
  );
}
