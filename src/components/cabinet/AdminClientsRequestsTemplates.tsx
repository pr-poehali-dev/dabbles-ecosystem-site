import { cpApi, formatDate } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Modal, FormField, ModalButtons } from "./AdminClientsShared";

type RequestRow = {
  id: number;
  request_type_label: string;
  status: string;
  comment: string;
  admin_comment: string;
  created_at: string;
  client_name: string;
  client_email: string;
  case_number: string | null;
};

type TemplateRow = {
  id: number;
  code: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string;
};

interface Props {
  tab: "requests" | "templates";
  requests: RequestRow[];
  loadRequests: () => void;
  templates: TemplateRow[];
  loadTemplates: () => void;
  editTpl: TemplateRow | null;
  setEditTpl: (v: TemplateRow | null) => void;
}

export default function AdminClientsRequestsTemplates({
  tab,
  requests, loadRequests,
  templates, loadTemplates,
  editTpl, setEditTpl,
}: Props) {
  const { toast } = useToast();

  const handleSaveTpl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTpl) return;
    await cpApi.adminTemplateUpdate({ id: editTpl.id, name: editTpl.name, subject: editTpl.subject, body_html: editTpl.body_html });
    toast({ title: "Шаблон сохранён" });
    setEditTpl(null);
    loadTemplates();
  };

  if (tab === "requests") {
    return (
      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="text-black/40 text-sm py-8 text-center">Заявлений нет</p>
        )}
        {requests.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-black/8 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-black text-[14px]">{r.request_type_label}</div>
                <div className="text-[12px] text-black/40">{r.client_name} · {r.client_email}</div>
                {r.comment && (
                  <div className="text-[12px] text-black/60 mt-1 italic">«{r.comment}»</div>
                )}
                {r.admin_comment && (
                  <div className="text-[12px] text-[#1a0a6e] mt-1">Ответ: {r.admin_comment}</div>
                )}
                <div className="text-[11px] text-black/30 mt-0.5">{formatDate(r.created_at)}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                {r.status === "new" && (
                  <>
                    <button
                      onClick={() => cpApi.adminRequestUpdate({ id: r.id, status: "in_progress" }).then(loadRequests)}
                      className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 text-[12px] font-semibold hover:bg-yellow-200"
                    >
                      В работу
                    </button>
                    <button
                      onClick={() => cpApi.adminRequestUpdate({ id: r.id, status: "done" }).then(loadRequests)}
                      className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[12px] font-semibold hover:bg-green-200"
                    >
                      Готово
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map(t => (
        <div key={t.id} className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-black text-[14px]">{t.name}</div>
            <div className="text-[12px] text-black/40">{t.subject}</div>
            {t.variables && (
              <div className="text-[11px] text-black/30 mt-0.5">Переменные: {t.variables}</div>
            )}
          </div>
          <button
            onClick={() => setEditTpl(t)}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold hover:bg-black/5"
          >
            Редактировать
          </button>
        </div>
      ))}

      {editTpl && (
        <Modal title={`Шаблон: ${editTpl.name}`} onClose={() => setEditTpl(null)} wide>
          <form onSubmit={handleSaveTpl} className="space-y-3">
            <FormField
              label="Тема письма"
              value={editTpl.subject}
              onChange={v => setEditTpl(p => p ? { ...p, subject: v } : p)}
            />
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">HTML-тело письма</label>
              <div className="text-[10px] text-black/30 mb-1">
                Переменные: {editTpl.variables?.split(",").map(v => `{{${v.trim()}}}`).join(", ")}
              </div>
              <textarea
                value={editTpl.body_html}
                onChange={e => setEditTpl(p => p ? { ...p, body_html: e.target.value } : p)}
                rows={12}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-[12px] font-mono bg-[#f5f5f7] focus:outline-none resize-none"
              />
            </div>
            <ModalButtons onClose={() => setEditTpl(null)} label="Сохранить шаблон" />
          </form>
        </Modal>
      )}
    </div>
  );
}
