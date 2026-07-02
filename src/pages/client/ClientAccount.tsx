import { useEffect, useState } from "react";
import { cpApi } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

type Account = {
  id: number; account_number: string; balance: number; currency: string;
  card_number: string; expiry_month: number; expiry_year: number; card_holder: string;
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ClientAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    cpApi.myAccount().then(r => setAccount(r.account)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyAccount = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.account_number).then(() =>
      toast({ title: "Номер счёта скопирован" })
    );
  };

  if (loading) return (
    <div className="h-[160px] bg-white rounded-2xl animate-pulse mb-4" />
  );

  if (!account) return null;

  const expiry = `${String(account.expiry_month).padStart(2, "0")}/${String(account.expiry_year).slice(-2)}`;
  const balanceDisplay = hidden ? "•••• ••" : fmt(account.balance);

  return (
    <div className="mb-5">
      {/* Карта */}
      <div
        className="relative rounded-2xl p-5 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2d6a0a 0%, #5a9a2a 45%, #9FC96D 100%)" }}
      >
        {/* Декоративные круги */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-12 w-20 h-20 rounded-full bg-white/8" />

        {/* Верх карты */}
        <div className="relative flex items-start justify-between mb-6">
          <div>
            <div className="text-white/60 text-[11px] font-semibold uppercase tracking-wide mb-0.5">
              Лицевой счёт
            </div>
            <div className="text-white text-[13px] font-mono font-semibold tracking-wide">
              {hidden
                ? `${account.account_number.slice(0, 5)} •••• •••• ${account.account_number.slice(-4)}`
                : account.account_number}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHidden(h => !h)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              title={hidden ? "Показать" : "Скрыть"}
            >
              <Icon name={hidden ? "EyeOff" : "Eye"} size={14} />
            </button>
            <button
              onClick={copyAccount}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              title="Скопировать номер счёта"
            >
              <Icon name="Copy" size={14} />
            </button>
          </div>
        </div>

        {/* Баланс */}
        <div className="relative mb-4">
          <div className="text-white/60 text-[11px] font-semibold mb-0.5">Баланс</div>
          <div className="text-white text-[28px] font-black leading-none">
            {balanceDisplay} <span className="text-[16px] font-semibold text-white/70">₽</span>
          </div>
        </div>

        {/* Низ карты */}
        <div className="relative flex items-end justify-between">
          <div>
            <div className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Держатель</div>
            <div className="text-white text-[12px] font-semibold tracking-wide truncate max-w-[180px]">
              {account.card_holder}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Срок</div>
            <div className="text-white text-[12px] font-semibold">{expiry}</div>
          </div>
        </div>
      </div>

      {/* Номер карты под картой */}
      <div className="bg-white rounded-xl mt-2 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-black/35 font-semibold uppercase tracking-wide mb-0.5">Номер карты</div>
          <div className="text-[14px] font-mono font-semibold text-black tracking-widest">
            {hidden ? `${account.card_number.slice(0, 4)} •••• •••• ${account.card_number.slice(-4)}` : account.card_number}
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#f0f8e8] flex items-center justify-center">
          <Icon name="CreditCard" size={18} className="text-[#5a9a2a]" />
        </div>
      </div>
    </div>
  );
}
