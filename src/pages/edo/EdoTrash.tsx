import { useEffect, useState } from "react";
import { edoApi, EdoDoc, TYPE_LABEL, STATUS_LABEL, STATUS_COLOR, formatDate } from "@/lib/edo-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

export default function EdoTrash() {
  const [docs, setDocs] = useState<EdoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    edoApi.trash().then(r => setDocs(r.docs)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (id: number) => {
    await edoApi.restore(id);
    toast({ title: "Документ восстановлен" });
    load();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black tracking-tight">Корзина</h1>
        <p className="text-black/40 text-sm">{docs.length} удалённых документов</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-black/30 bg-white rounded-2xl border border-black/5">
          <Icon name="Trash2" size={36} className="mb-3 opacity-40" />
          <p className="text-sm">Корзина пуста</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden divide-y divide-black/5">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Icon name="FileX" size={16} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-black truncate">{doc.title}</div>
                <div className="text-[11px] text-black/40">
                  {doc.doc_number} · {TYPE_LABEL[doc.doc_type] || doc.doc_type} · {formatDate(doc.created_at)}
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${STATUS_COLOR[doc.status]}`}>
                {STATUS_LABEL[doc.status]}
              </span>
              <button onClick={() => handleRestore(doc.id)}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold text-[#1a0a6e] hover:bg-[#1a0a6e]/5 transition-colors">
                Восстановить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
