import { useEffect, useState } from "react";
import { cpApi, CpPayment, PAYMENT_STATUS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const CARD = "2202 2006 5913 8646";

function PayCard({ payment, onPay }: { payment: CpPayment; onPay: () => void }) {
  const ps = PAYMENT_STATUS[payment.status] || { label: payment.status, cls: "bg-gray-100 text-gray-500" };
  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-black text-[16px]">{formatMoney(payment.amount)}</div>
          <div className="text-[13px] text-black/50 mt-0.5 leading-snug">{payment.basis}</div>
          {payment.case_number && (
            <div className="text-[11px] text-black/30 mt-0.5">Дело: {payment.case_number}</div>
          )}
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${ps.cls}`}>{ps.label}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-black/35">
        <span>{payment.due_date ? `Срок: ${formatDate(payment.due_date)}` : formatDate(payment.created_at)}</span>
        {payment.payment_date && <span>Оплачено: {formatDate(payment.payment_date)}</span>}
      </div>
      {payment.status === "pending" && (
        <button onClick={onPay}
          className="mt-3 w-full py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(120deg, #9FC96D 0%, #5a9a2a 100%)" }}>
          <Icon name="CreditCard" size={14} /> Оплатить
        </button>
      )}
    </div>
  );
}

export default function ClientPayments() {
  const [payments, setPayments] = useState<CpPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    cpApi.payments().then(r => setPayments(r.payments)).finally(() => setLoading(false));
  }, []);

  const copyCard = () => {
    navigator.clipboard.writeText(CARD.replace(/\s/g, "")).then(() => {
      toast({ title: "Номер карты скопирован" });
    });
  };

  const pending = payments.filter(p => p.status === "pending");
  const paid = payments.filter(p => p.status === "paid");
  const totalPaid = paid.reduce((s, p) => s + p.amount, 0);
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#9FC96D]/30 border-t-[#5a9a2a] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      <div className="mb-5">
        <h1 className="text-[22px] font-black text-black tracking-tight">История оплат</h1>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Оплачено</div>
          <div className="text-xl font-black text-[#5a9a2a]">{formatMoney(totalPaid)}</div>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">К оплате</div>
          <div className="text-xl font-black text-black">{formatMoney(totalPending)}</div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-black/30 bg-white rounded-2xl">
          <Icon name="CreditCard" size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Оплат пока нет</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[12px] font-bold text-black/40 uppercase tracking-wide mb-3">Ожидают оплаты</h2>
              <div className="space-y-3">
                {pending.map(p => <PayCard key={p.id} payment={p} onPay={() => setShowPayModal(true)} />)}
              </div>
            </div>
          )}
          {paid.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/40 uppercase tracking-wide mb-3">История</h2>
              <div className="space-y-3">
                {paid.map(p => <PayCard key={p.id} payment={p} onPay={() => {}} />)}
              </div>
            </div>
          )}
        </>
      )}

      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-black text-lg">Оплата</h3>
              <button onClick={() => setShowPayModal(false)} className="text-black/30 hover:text-black">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="rounded-2xl p-5 mb-5 text-white"
              style={{ background: "linear-gradient(135deg, #9FC96D 0%, #5a9a2a 100%)" }}>
              <div className="text-[11px] text-white/70 mb-1 font-medium">Номер карты для оплаты</div>
              <div className="text-xl font-black tracking-widest mb-3">{CARD}</div>
              <button onClick={copyCard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[13px] font-semibold transition-colors">
                <Icon name="Copy" size={14} /> Скопировать номер
              </button>
            </div>

            <div className="space-y-2 text-[13px] text-black/55 mb-5">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={14} className="text-[#5a9a2a] shrink-0 mt-0.5" />
                <p>Переведите сумму на карту и укажите в назначении платежа ваше ФИО и номер дела.</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Clock" size={14} className="text-black/35 shrink-0 mt-0.5" />
                <p>После оплаты статус обновится в течение 1 рабочего дня.</p>
              </div>
            </div>

            <button onClick={() => setShowPayModal(false)}
              className="w-full py-3 rounded-xl border border-black/10 text-[13px] font-semibold text-black/60 hover:bg-black/5">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
