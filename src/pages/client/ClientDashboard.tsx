import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpApi, CpCase, CpPayment, CASE_STATUS_COLORS, PAYMENT_STATUS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

type Account = {
  id: number; account_number: string; balance: number; currency: string;
  card_number: string; expiry_month: number; expiry_year: number; card_holder: string;
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── КАРТА ──────────────────────────────────────────────────────────────
function AccountCard({ account }: { account: Account }) {
  const [hidden, setHidden] = useState(true);
  const { toast } = useToast();

  const expiry = `${String(account.expiry_month).padStart(2, "0")}/${String(account.expiry_year).slice(-2)}`;

  const copyNumber = (val: string, label: string) => {
    navigator.clipboard.writeText(val.replace(/\s/g, "")).then(() =>
      toast({ title: `${label} скопирован` })
    );
  };

  return (
    <div
      className="relative rounded-[24px] p-6 text-white overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #2d6a0a 0%, #5a9a2a 50%, #9FC96D 100%)" }}
    >
      {/* Декор */}
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/8 pointer-events-none" />
      <div className="absolute right-6 top-20 w-28 h-28 rounded-full bg-white/6 pointer-events-none" />

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
          <button onClick={() => copyNumber(account.account_number, "Номер счёта")}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
            <Icon name="Copy" size={14} />
          </button>
        </div>
      </div>

      {/* Баланс */}
      <div className="relative mb-6">
        <div className="text-white/55 text-[10px] font-bold uppercase tracking-widest mb-1">Баланс</div>
        <div className="flex items-baseline gap-2">
          <span className="text-white text-[32px] font-black leading-none tracking-tight">
            {hidden ? "•••• ••" : fmt(account.balance)}
          </span>
          <span className="text-white/60 text-[18px] font-semibold">₽</span>
        </div>
      </div>

      {/* Низ — держатель + срок + номер карты */}
      <div className="relative flex items-end justify-between">
        <div className="space-y-0.5">
          <div className="text-white/45 text-[9px] uppercase tracking-widest">Держатель</div>
          <div className="text-white text-[13px] font-semibold tracking-wide truncate max-w-[200px]">
            {account.card_holder}
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <div className="text-white/45 text-[9px] uppercase tracking-widest">Действует до</div>
          <div className="text-white text-[13px] font-semibold">{expiry}</div>
        </div>
      </div>

      {/* Номер карты */}
      <button
        onClick={() => copyNumber(account.card_number, "Номер карты")}
        className="relative mt-4 w-full flex items-center justify-between bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 group"
      >
        <div className="text-white/70 text-[10px] uppercase tracking-widest">Номер карты</div>
        <div className="flex items-center gap-2">
          <span className="text-white font-mono text-[13px] font-semibold tracking-widest">
            {hidden
              ? `•••• •••• •••• ${account.card_number.slice(-4)}`
              : account.card_number}
          </span>
          <Icon name="Copy" size={12} className="text-white/50 group-hover:text-white transition-colors" />
        </div>
      </button>
    </div>
  );
}

// ── ИСТОРИЯ ОПЕРАЦИЙ ───────────────────────────────────────────────────
function PaymentHistory({ payments }: { payments: CpPayment[] }) {
  const recent = payments.slice(0, 5);

  const getIcon = (status: string) => {
    if (status === "paid") return { icon: "ArrowDownLeft", cls: "bg-green-50 text-green-600" };
    if (status === "cancelled") return { icon: "X", cls: "bg-red-50 text-red-500" };
    return { icon: "Clock", cls: "bg-yellow-50 text-yellow-600" };
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
            const { icon, cls } = getIcon(p.status);
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
                  <div className={`text-[14px] font-bold ${p.status === "paid" ? "text-[#5a9a2a]" : "text-black"}`}>
                    {p.status === "paid" ? "+" : ""}{formatMoney(p.amount)}
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${ps.cls}`}>{ps.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {payments.length > 5 && (
        <div className="px-5 py-3 border-t border-black/5">
          <span className="text-[12px] text-[#5a9a2a] font-semibold">
            +{payments.length - 5} операций — перейдите в раздел «Оплаты»
          </span>
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
          {/* Счётчики */}
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

          {/* Последние 3 дела */}
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

  useEffect(() => {
    Promise.all([
      cpApi.myAccount().catch(() => null),
      cpApi.payments().catch(() => ({ payments: [] })),
      cpApi.cases().catch(() => ({ cases: [] })),
    ]).then(([acc, pay, cas]) => {
      if (acc) setAccount(acc.account);
      setPayments(pay.payments);
      setCases(cas.cases);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#9FC96D]/30 border-t-[#5a9a2a] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-24 md:pb-6 space-y-4">
      {account && <AccountCard account={account} />}
      <PaymentHistory payments={payments} />
      <CasesSummary cases={cases} onNavigate={() => navigate("/client/cases")} />
    </div>
  );
}
