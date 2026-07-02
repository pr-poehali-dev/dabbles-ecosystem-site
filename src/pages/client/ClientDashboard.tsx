import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpApi, CpCase, CpPayment, CASE_STATUS_COLORS, PAYMENT_STATUS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

type Account = {
  id: number; account_number: string; balance: number; currency: string;
  card_number: string; expiry_month: number; expiry_year: number; card_holder: string;
};

const OUR_CARD = "2202 2006 5913 8646";

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── МОДАЛКА ПОПОЛНЕНИЯ ─────────────────────────────────────────────────
function TopupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "pay">("form");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const presets = [1000, 3000, 5000, 10000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await cpApi.topupRequest(Number(amount));
      setStep("pay");
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyCard = () => {
    navigator.clipboard.writeText(OUR_CARD.replace(/\s/g, "")).then(() =>
      toast({ title: "Номер карты скопирован" })
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-black text-[17px]">Пополнение баланса</h3>
          <button onClick={onClose} className="text-black/30 hover:text-black">
            <Icon name="X" size={20} />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Пресеты */}
            <div className="grid grid-cols-4 gap-2">
              {presets.map(p => (
                <button key={p} type="button"
                  onClick={() => setAmount(String(p))}
                  className={`py-2 rounded-xl text-[13px] font-bold transition-all ${
                    amount === String(p) ? "bg-[#5a9a2a] text-white" : "bg-[#f5f5f7] text-black hover:bg-[#e8f5d8]"
                  }`}>
                  {p.toLocaleString("ru-RU")}
                </button>
              ))}
            </div>
            {/* Ввод суммы */}
            <div className="relative">
              <input
                type="number" min="1" required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Введите сумму"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[16px] font-bold focus:outline-none focus:border-[#9FC96D] pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35 text-[15px] font-semibold">₽</span>
            </div>
            <button type="submit" disabled={loading || !amount}
              className="w-full py-3 rounded-xl text-white font-bold text-[15px] disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(120deg, #9FC96D 0%, #5a9a2a 100%)" }}>
              {loading ? "Создаём заявку..." : "Далее →"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Карта для перевода */}
            <div className="rounded-2xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, #2d6a0a 0%, #5a9a2a 100%)" }}>
              <div className="text-white/60 text-[11px] font-semibold uppercase tracking-wide mb-1">Переведите на карту</div>
              <div className="text-white text-[22px] font-black tracking-widest mb-3">{OUR_CARD}</div>
              <div className="text-white/80 text-[13px] font-bold mb-3">
                Сумма: {fmt(Number(amount))} ₽
              </div>
              <button onClick={copyCard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[13px] font-semibold transition-colors">
                <Icon name="Copy" size={14} /> Скопировать номер карты
              </button>
            </div>

            <div className="space-y-2 text-[13px] text-black/55">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={14} className="text-[#5a9a2a] shrink-0 mt-0.5" />
                <p>Укажите в назначении платежа ваше ФИО.</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Clock" size={14} className="text-black/35 shrink-0 mt-0.5" />
                <p>После получения перевода баланс пополнится в течение 1 рабочего дня.</p>
              </div>
            </div>

            <button onClick={() => { onClose(); onSuccess(); }}
              className="w-full py-3 rounded-xl bg-[#f5f5f7] text-[13px] font-semibold text-black/60 hover:bg-black/10">
              Понятно, закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── КАРТА ──────────────────────────────────────────────────────────────
function AccountCard({ account, onTopup }: { account: Account; onTopup: () => void }) {
  const [hidden, setHidden] = useState(true);
  const { toast } = useToast();

  const expiry = `${String(account.expiry_month).padStart(2, "0")}/${String(account.expiry_year).slice(-2)}`;

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val.replace(/\s/g, "")).then(() =>
      toast({ title: `${label} скопирован` })
    );
  };

  return (
    <div className="relative rounded-[24px] p-6 text-white overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #2d6a0a 0%, #5a9a2a 50%, #9FC96D 100%)" }}>
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/8 pointer-events-none" />
      <div className="absolute right-6 top-20 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      {/* Верх */}
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <div className="text-white/55 text-[10px] font-bold uppercase tracking-widest mb-1">Лицевой счёт</div>
          <div className="text-white/90 text-[13px] font-mono tracking-wide">
            {hidden
              ? `${account.account_number.slice(0, 5)} •••• •••• ${account.account_number.slice(-4)}`
              : account.account_number}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setHidden(h => !h)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
            <Icon name={hidden ? "EyeOff" : "Eye"} size={14} />
          </button>
          <button onClick={() => copy(account.account_number, "Номер счёта")}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
            <Icon name="Copy" size={14} />
          </button>
        </div>
      </div>

      {/* Баланс */}
      <div className="relative mb-5">
        <div className="text-white/55 text-[10px] font-bold uppercase tracking-widest mb-1">Баланс</div>
        <div className="flex items-baseline gap-2">
          <span className="text-white text-[32px] font-black leading-none tracking-tight">
            {hidden ? "•••• ••" : fmt(account.balance)}
          </span>
          <span className="text-white/60 text-[18px] font-semibold">₽</span>
        </div>
      </div>

      {/* Держатель + срок */}
      <div className="relative flex items-end justify-between mb-4">
        <div>
          <div className="text-white/45 text-[9px] uppercase tracking-widest">Держатель</div>
          <div className="text-white text-[13px] font-semibold tracking-wide truncate max-w-[180px]">
            {account.card_holder}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/45 text-[9px] uppercase tracking-widest">Действует до</div>
          <div className="text-white text-[13px] font-semibold">{expiry}</div>
        </div>
      </div>

      {/* Номер карты */}
      <button onClick={() => copy(account.card_number, "Номер карты")}
        className="relative w-full flex items-center justify-between bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 mb-3 group">
        <div className="text-white/70 text-[10px] uppercase tracking-widest">Номер карты</div>
        <div className="flex items-center gap-2">
          <span className="text-white font-mono text-[13px] font-semibold tracking-widest">
            {hidden ? `•••• •••• •••• ${account.card_number.slice(-4)}` : account.card_number}
          </span>
          <Icon name="Copy" size={12} className="text-white/50 group-hover:text-white transition-colors" />
        </div>
      </button>

      {/* Кнопка Пополнить */}
      <button onClick={onTopup}
        className="relative w-full flex items-center justify-center gap-2 bg-white text-[#2d6a0a] font-bold text-[14px] py-3 rounded-xl hover:bg-white/90 transition-colors">
        <Icon name="Plus" size={16} />
        Пополнить
      </button>
    </div>
  );
}

// ── ВЫСТАВЛЕННЫЕ СЧЕТА ─────────────────────────────────────────────────
function PendingBills({ payments, onNavigate }: { payments: CpPayment[]; onNavigate: () => void }) {
  const pending = payments.filter(p => p.status === "pending" && p.payment_type === "charge");
  if (pending.length === 0) return null;

  const total = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="bg-white rounded-[20px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-black text-black">Счета к оплате</h2>
          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {pending.length}
          </span>
        </div>
        <span className="text-[14px] font-black text-black">{formatMoney(total)}</span>
      </div>
      <div className="divide-y divide-black/4">
        {pending.map(p => (
          <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Icon name="Receipt" size={16} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-black truncate">{p.basis}</div>
              <div className="text-[11px] text-black/35">
                {p.due_date ? `Срок: ${formatDate(p.due_date)}` : formatDate(p.created_at)}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[14px] font-bold text-red-500">−{formatMoney(p.amount)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-black/5">
        <button onClick={onNavigate}
          className="text-[13px] text-[#5a9a2a] font-semibold hover:underline">
          Оплатить →
        </button>
      </div>
    </div>
  );
}

// ── ИСТОРИЯ ОПЕРАЦИЙ ───────────────────────────────────────────────────
function PaymentHistory({ payments }: { payments: CpPayment[] }) {
  const recent = payments.slice(0, 6);

  const getStyle = (p: CpPayment) => {
    if (p.payment_type === "topup") {
      return p.status === "paid"
        ? { icon: "ArrowDownLeft", cls: "bg-green-50 text-green-600", sign: "+", color: "text-[#5a9a2a]" }
        : { icon: "Clock", cls: "bg-yellow-50 text-yellow-600", sign: "+", color: "text-black/40" };
    }
    return p.status === "paid"
      ? { icon: "ArrowUpRight", cls: "bg-red-50 text-red-500", sign: "−", color: "text-red-500" }
      : { icon: "Clock", cls: "bg-yellow-50 text-yellow-600", sign: "−", color: "text-black/40" };
  };

  return (
    <div className="bg-white rounded-[20px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <h2 className="text-[15px] font-black text-black">История операций</h2>
        <span className="text-[12px] text-black/35 font-medium">{payments.length} операций</span>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-black/25">
          <Icon name="ReceiptText" size={32} className="mb-2" />
          <p className="text-[13px]">Операций пока нет</p>
        </div>
      ) : (
        <div className="divide-y divide-black/4">
          {recent.map(p => {
            const ps = PAYMENT_STATUS[p.status] || { label: p.status, cls: "" };
            const { icon, cls, sign, color } = getStyle(p);
            return (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                  <Icon name={icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-black truncate leading-snug">{p.basis}</div>
                  <div className="text-[11px] text-black/35 mt-0.5">
                    {p.due_date ? `до ${formatDate(p.due_date)}` : formatDate(p.created_at)}
                    {p.case_number ? ` · Дело ${p.case_number}` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[14px] font-bold ${color}`}>
                    {sign}{formatMoney(p.amount)}
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${ps.cls}`}>{ps.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── СВОДКА ДЕЛ ─────────────────────────────────────────────────────────
function CasesSummary({ cases, onNavigate }: { cases: CpCase[]; onNavigate: () => void }) {
  const active = cases.filter(c => !["completed", "closed"].includes(c.status));
  const done = cases.filter(c => ["completed", "closed"].includes(c.status));

  return (
    <div className="bg-white rounded-[20px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <h2 className="text-[15px] font-black text-black">Мои дела</h2>
        <button onClick={onNavigate} className="text-[12px] text-[#5a9a2a] font-semibold hover:underline">
          Все →
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-black/25">
          <Icon name="Scale" size={32} className="mb-2" />
          <p className="text-[13px]">Дел пока нет</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-px bg-black/5">
            <div className="bg-white px-4 py-4 text-center">
              <div className="text-[22px] font-black text-black">{cases.length}</div>
              <div className="text-[10px] text-black/35 font-semibold uppercase tracking-wide mt-0.5">Всего</div>
            </div>
            <div className="bg-white px-4 py-4 text-center">
              <div className="text-[22px] font-black text-[#5a9a2a]">{active.length}</div>
              <div className="text-[10px] text-black/35 font-semibold uppercase tracking-wide mt-0.5">Активных</div>
            </div>
            <div className="bg-white px-4 py-4 text-center">
              <div className="text-[22px] font-black text-black/40">{done.length}</div>
              <div className="text-[10px] text-black/35 font-semibold uppercase tracking-wide mt-0.5">Завершено</div>
            </div>
          </div>
          <div className="divide-y divide-black/4">
            {cases.slice(0, 3).map(c => (
              <button key={c.id} onClick={onNavigate}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#f9fafb] transition-colors text-left">
                <div className="w-8 h-8 rounded-full bg-[#f0f8e8] flex items-center justify-center shrink-0">
                  <Icon name="Scale" size={14} className="text-[#5a9a2a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-black truncate">{c.title}</div>
                  <div className="text-[11px] text-black/35">{c.case_number || `#${c.id}`}</div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${CASE_STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
                  {c.status_label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── ГЛАВНЫЙ КОМПОНЕНТ ──────────────────────────────────────────────────
export default function ClientDashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [payments, setPayments] = useState<CpPayment[]>([]);
  const [cases, setCases] = useState<CpCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);

  const load = () => {
    Promise.all([
      cpApi.myAccount().catch(() => null),
      cpApi.payments().catch(() => ({ payments: [] })),
      cpApi.cases().catch(() => ({ cases: [] })),
    ]).then(([acc, pay, cas]) => {
      if (acc) setAccount(acc.account);
      setPayments(pay.payments);
      setCases(cas.cases);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#9FC96D]/30 border-t-[#5a9a2a] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-24 md:pb-6 space-y-4">
      {account && (
        <AccountCard account={account} onTopup={() => setShowTopup(true)} />
      )}
      <PendingBills payments={payments} onNavigate={() => navigate("/client/payments")} />
      <PaymentHistory payments={payments} />
      <CasesSummary cases={cases} onNavigate={() => navigate("/client/cases")} />

      {showTopup && (
        <TopupModal
          onClose={() => setShowTopup(false)}
          onSuccess={() => { load(); }}
        />
      )}
    </div>
  );
}
