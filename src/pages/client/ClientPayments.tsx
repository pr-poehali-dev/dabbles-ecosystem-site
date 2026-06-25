import { useEffect, useState } from "react";
import { cpApi, CpPayment, PAYMENT_STATUS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const CARD = "2202 2006 5913 8646";

function PayCard({ payment, onPay }: { payment: CpPayment; onPay: () => void }) {
  const ps = PAYMENT_STATUS[payment.status] || { label: payment.status, cls: "bg-gray-100 text-gray-500" };
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-black text-[15px]">{formatMoney(payment.amount)}</div>
          <div className="text-[12px] text-black/55 mt-0.5 leading-snug">{payment.basis}</div>
          {payment.case_number && (
            <div className="text-[11px] text-black/35 mt-0.5">Дело: {payment.case_number}</div>
          )}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ps.cls}`}>{ps.label}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-black/40">
        <span>{payment.due_date ? `Срок: ${formatDate(payment.due_date)}` : formatDate(payment.created_at)}</span>
        {payment.payment_date && <span>Оплачено: {formatDate(payment.payment_date)}</span>}
      </div>
      {payment.status === "pending" && (
        <button onClick={onPay}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#1a0a6e] text-white text-[13px] font-semibold hover:bg-[#2d1a8e] transition-colors flex items-center justify-center gap-2">
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
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black tracking-tight">История оплат</h1>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-black/5 p-4">
          <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Оплачено</div>
          <div className="text-xl font-black text-green-600">{formatMoney(totalPaid)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-4">
          <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">К оплате</div>
          <div className="text-xl font-black text-[#1a0a6e]">{formatMoney(totalPending)}</div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-black/30 bg-white rounded-3xl border border-black/5">
          <Icon name="CreditCard" size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Оплат пока нет</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[13px] font-bold text-black/60 uppercase tracking-wide mb-3">Ожидают оплаты</h2>
              <div className="space-y-3">
                {pending.map(p => <PayCard key={p.id} payment={p} onPay={() => setShowPayModal(true)} />)}
              </div>
            </div>
          )}

          {paid.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-black/60 uppercase tracking-wide mb-3">История</h2>
              <div className="space-y-3">
                {paid.map(p => <PayCard key={p.id} payment={p} onPay={() => {}} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Попап оплаты */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-black text-lg">Оплата</h3>
              <button onClick={() => setShowPayModal(false)} className="text-black/30 hover:text-black">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#1a0a6e] to-[#2d1a8e] rounded-2xl p-5 mb-5 text-white">
              <div className="text-[11px] text-white/60 mb-1 font-medium">Номер карты для оплаты</div>
              <div className="text-xl font-black tracking-widest mb-3">{CARD}</div>
              <button onClick={copyCard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold transition-colors">
                <Icon name="Copy" size={14} /> Скопировать номер карты
              </button>
            </div>

            <div className="space-y-2 text-[13px] text-black/60 mb-5">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={14} className="text-[#1a0a6e] shrink-0 mt-0.5" />
                <p>Переведите сумму на карту и укажите в назначении платежа ваше ФИО и номер дела.</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Clock" size={14} className="text-black/40 shrink-0 mt-0.5" />
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
