import { cpApi, CpCase, CASE_STATUS_COLORS, formatMoney } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { Modal, FormField, ModalButtons } from "./AdminClientsShared";

const CASE_STATUSES = [
  { v: "new", l: "Принято в работу" },
  { v: "documents_prep", l: "Подготовка документов" },
  { v: "filed", l: "Документы поданы" },
  { v: "hearing", l: "Судебное заседание" },
  { v: "decision", l: "Решение суда" },
  { v: "enforcement", l: "Исполнительное производство" },
  { v: "completed", l: "Дело закрыто" },
  { v: "suspended", l: "Приостановлено" },
];

interface Props {
  cases: (CpCase & { client_name: string; client_email: string })[];
  clients: { id: number; full_name: string; email: string }[];
  showCaseForm: boolean;
  setShowCaseForm: (v: boolean) => void;
  caseForm: { client_id: string; case_number: string; title: string; plaintiff: string; defendant: string; amount: string; court: string; description: string; docs_link: string };
  setCaseForm: React.Dispatch<React.SetStateAction<{ client_id: string; case_number: string; title: string; plaintiff: string; defendant: string; amount: string; court: string; description: string; docs_link: string }>>;
  caseSaving: boolean;
  setCaseSaving: (v: boolean) => void;
  showStatusForm: number | null;
  setShowStatusForm: (v: number | null) => void;
  statusForm: { status: string; label: string; comment: string; notify: boolean };
  setStatusForm: React.Dispatch<React.SetStateAction<{ status: string; label: string; comment: string; notify: boolean }>>;
  loadCases: () => void;
}

export default function AdminClientsCases({
  cases, clients,
  showCaseForm, setShowCaseForm, caseForm, setCaseForm, caseSaving, setCaseSaving,
  showStatusForm, setShowStatusForm, statusForm, setStatusForm,
  loadCases,
}: Props) {
  const { toast } = useToast();

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaseSaving(true);
    try {
      await cpApi.adminCaseCreate({
        ...caseForm,
        client_id: Number(caseForm.client_id),
        amount: caseForm.amount ? Number(caseForm.amount) : undefined,
      });
      toast({ title: "Дело создано" });
      setShowCaseForm(false);
      setCaseForm({ client_id: "", case_number: "", title: "", plaintiff: "", defendant: "", amount: "", court: "", description: "", docs_link: "" });
      loadCases();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setCaseSaving(false);
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusForm) return;
    await cpApi.adminCaseAddStatus({ case_id: showStatusForm, ...statusForm });
    toast({ title: "Статус добавлен" });
    setShowStatusForm(null);
    setStatusForm({ status: "new", label: "", comment: "", notify: true });
    loadCases();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCaseForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"
        >
          <Icon name="Plus" size={15} /> Создать дело
        </button>
      </div>

      <div className="space-y-3">
        {cases.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-black/8 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-mono text-black/35">{c.case_number || `#${c.id}`}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CASE_STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
                    {c.status_label}
                  </span>
                </div>
                <div className="font-bold text-black text-[14px]">{c.title}</div>
                <div className="text-[12px] text-black/40 mt-0.5">{c.client_name} · {c.client_email}</div>
                {c.amount != null && (
                  <div className="text-[12px] font-bold text-[#1a0a6e] mt-0.5">{formatMoney(c.amount)}</div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowStatusForm(c.id);
                  setStatusForm({ status: c.status, label: "", comment: "", notify: true });
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold hover:bg-black/5"
              >
                + Статус
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Создание дела */}
      {showCaseForm && (
        <Modal title="Новое дело" onClose={() => setShowCaseForm(false)}>
          <form onSubmit={handleCreateCase} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Клиент *</label>
              <select
                value={caseForm.client_id}
                onChange={e => setCaseForm(p => ({ ...p, client_id: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none"
              >
                <option value="">Выберите клиента</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>
            {([
              { k: "case_number", l: "Номер дела", p: "А40-12345/2024" },
              { k: "title", l: "Название *", p: "Взыскание задолженности", req: true },
              { k: "plaintiff", l: "Истец", p: "" },
              { k: "defendant", l: "Ответчик", p: "" },
              { k: "amount", l: "Сумма иска", p: "150000" },
              { k: "court", l: "Суд", p: "Арбитражный суд г. Москвы" },
              { k: "docs_link", l: "Ссылка на документы", p: "https://..." },
            ] as { k: string; l: string; p: string; req?: boolean }[]).map(f => (
              <FormField
                key={f.k}
                label={f.l}
                placeholder={f.p}
                required={f.req}
                value={caseForm[f.k as keyof typeof caseForm] as string}
                onChange={v => setCaseForm(prev => ({ ...prev, [f.k]: v }))}
              />
            ))}
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Описание</label>
              <textarea
                value={caseForm.description}
                onChange={e => setCaseForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none"
              />
            </div>
            <ModalButtons onClose={() => setShowCaseForm(false)} loading={caseSaving} label="Создать дело" />
          </form>
        </Modal>
      )}

      {/* Добавление статуса */}
      {showStatusForm && (
        <Modal title="Добавить статус" onClose={() => setShowStatusForm(null)}>
          <form onSubmit={handleAddStatus} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Статус</label>
              <select
                value={statusForm.status}
                onChange={e => setStatusForm(p => ({
                  ...p,
                  status: e.target.value,
                  label: CASE_STATUSES.find(s => s.v === e.target.value)?.l || "",
                }))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none"
              >
                {CASE_STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
            <FormField
              label="Своя подпись (необязательно)"
              placeholder="Например: Первое заседание 15.01.2025"
              value={statusForm.label}
              onChange={v => setStatusForm(p => ({ ...p, label: v }))}
            />
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Комментарий</label>
              <textarea
                value={statusForm.comment}
                onChange={e => setStatusForm(p => ({ ...p, comment: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none"
              />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-black/60 cursor-pointer">
              <input
                type="checkbox"
                checked={statusForm.notify}
                onChange={e => setStatusForm(p => ({ ...p, notify: e.target.checked }))}
              />
              Уведомить клиента по email
            </label>
            <ModalButtons onClose={() => setShowStatusForm(null)} label="Добавить" />
          </form>
        </Modal>
      )}
    </div>
  );
}
