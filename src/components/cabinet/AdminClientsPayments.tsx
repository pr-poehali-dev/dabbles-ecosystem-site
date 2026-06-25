import { cpApi, CpPayment, CpCase, PAYMENT_STATUS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { Modal, FormField, ModalButtons } from "./AdminClientsShared";

interface Props {
  payments: (CpPayment & { client_name: string })[];
  clients: { id: number; full_name: string; email: string }[];
  cases: (CpCase & { client_email: string })[];
  showPayForm: boolean;
  setShowPayForm: (v: boolean) => void;
  payForm: { client_id: string; case_id: string; amount: string; basis: string; due_date: string; notes: string; notify: boolean };
  setPayForm: React.Dispatch<React.SetStateAction<{ client_id: string; case_id: string; amount: string; basis: string; due_date: string; notes: string; notify: boolean }>>;
  paySaving: boolean;
  setPaySaving: (v: boolean) => void;
  loadPayments: () => void;
}

export default function AdminClientsPayments({
  payments, clients, cases,
  showPayForm, setShowPayForm, payForm, setPayForm, paySaving, setPaySaving,
  loadPayments,
}: Props) {
  const { toast } = useToast();

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaySaving(true);
    try {
      await cpApi.adminPaymentCreate({
        client_id: Number(payForm.client_id),
        amount: Number(payForm.amount),
        basis: payForm.basis,
        case_id: payForm.case_id ? Number(payForm.case_id) : undefined,
        due_date: payForm.due_date || undefined,
        notes: payForm.notes,
        notify: payForm.notify,
      });
      toast({ title: "Счёт выставлен" });
      setShowPayForm(false);
      setPayForm({ client_id: "", case_id: "", amount: "", basis: "", due_date: "", notes: "", notify: true });
      loadPayments();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setPaySaving(false);
    }
  };

  const handlePayStatus = async (id: number, status: string) => {
    await cpApi.adminPaymentUpdate({
      id,
      status,
      payment_date: status === "paid" ? new Date().toISOString().split("T")[0] : undefined,
    });
    loadPayments();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowPayForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"
        >
          <Icon name="Plus" size={15} /> Выставить счёт
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="divide-y divide-black/5">
          {payments.map(p => {
            const ps = PAYMENT_STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-500" };
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-black">{formatMoney(p.amount)}</div>
                  <div className="text-[12px] text-black/50">{p.basis}</div>
                  <div className="text-[11px] text-black/35">
                    {p.client_name} {p.due_date ? `· до ${formatDate(p.due_date)}` : ""}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ps.cls}`}>
                  {ps.label}
                </span>
                {p.status === "pending" && (
                  <button
                    onClick={() => handlePayStatus(p.id, "paid")}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[12px] font-semibold hover:bg-green-200"
                  >
                    Оплачено
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Выставить счёт */}
      {showPayForm && (
        <Modal title="Выставить счёт" onClose={() => setShowPayForm(false)}>
          <form onSubmit={handleCreatePayment} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Клиент *</label>
              <select
                value={payForm.client_id}
                onChange={e => setPayForm(p => ({ ...p, client_id: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none"
              >
                <option value="">Выберите клиента</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            {payForm.client_id && (
              <div>
                <label className="text-[11px] font-semibold text-black/40 mb-1 block">Дело</label>
                <select
                  value={payForm.case_id}
                  onChange={e => setPayForm(p => ({ ...p, case_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none"
                >
                  <option value="">— Без дела —</option>
                  {cases
                    .filter(c => c.client_email === clients.find(cl => cl.id === Number(payForm.client_id))?.email)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.case_number || c.title}</option>
                    ))}
                </select>
              </div>
            )}
            <FormField
              label="Сумма *"
              placeholder="50000"
              required
              value={payForm.amount}
              onChange={v => setPayForm(p => ({ ...p, amount: v }))}
              type="number"
            />
            <FormField
              label="Основание *"
              placeholder="Юридические услуги по делу №..."
              required
              value={payForm.basis}
              onChange={v => setPayForm(p => ({ ...p, basis: v }))}
            />
            <FormField
              label="Срок оплаты"
              placeholder=""
              value={payForm.due_date}
              onChange={v => setPayForm(p => ({ ...p, due_date: v }))}
              type="date"
            />
            <label className="flex items-center gap-2 text-[13px] text-black/60 cursor-pointer">
              <input
                type="checkbox"
                checked={payForm.notify}
                onChange={e => setPayForm(p => ({ ...p, notify: e.target.checked }))}
              />
              Уведомить клиента по email
            </label>
            <ModalButtons onClose={() => setShowPayForm(false)} loading={paySaving} label="Выставить счёт" />
          </form>
        </Modal>
      )}
    </div>
  );
}
