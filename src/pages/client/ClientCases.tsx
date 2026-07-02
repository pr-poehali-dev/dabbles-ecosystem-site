import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpApi, CpCase, CASE_STATUS_COLORS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

export default function ClientCases() {
  const [cases, setCases] = useState<CpCase[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cpApi.cases().then(r => setCases(r.cases)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#9FC96D]/30 border-t-[#5a9a2a] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      <div className="mb-5">
        <h1 className="text-[22px] font-black text-black tracking-tight">Мои дела</h1>
        <p className="text-black/40 text-sm mt-0.5">{cases.length} {cases.length === 1 ? "дело" : "дел"}</p>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-black/30 bg-white rounded-2xl">
          <Icon name="Scale" size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">Дел пока нет</p>
          <p className="text-xs mt-1">Обратитесь к вашему менеджеру</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => (
            <div key={c.id}
              onClick={() => navigate(`/client/cases/${c.id}`)}
              className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-black/30">{c.case_number || `#${c.id}`}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CASE_STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
                      {c.status_label}
                    </span>
                  </div>
                  <h2 className="font-bold text-black text-[15px] leading-snug">{c.title}</h2>
                </div>
                <Icon name="ChevronRight" size={18} className="text-black/20 shrink-0 mt-1 group-hover:text-[#5a9a2a] transition-colors" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {c.plaintiff && (
                  <div>
                    <div className="text-[10px] font-semibold text-black/30 uppercase tracking-wide mb-0.5">Истец</div>
                    <div className="text-[12px] text-black/65 truncate">{c.plaintiff}</div>
                  </div>
                )}
                {c.defendant && (
                  <div>
                    <div className="text-[10px] font-semibold text-black/30 uppercase tracking-wide mb-0.5">Ответчик</div>
                    <div className="text-[12px] text-black/65 truncate">{c.defendant}</div>
                  </div>
                )}
                {c.amount != null && (
                  <div>
                    <div className="text-[10px] font-semibold text-black/30 uppercase tracking-wide mb-0.5">Сумма иска</div>
                    <div className="text-[13px] font-bold text-[#5a9a2a]">{formatMoney(c.amount)}</div>
                  </div>
                )}
              </div>

              {c.statuses.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {c.statuses.map((s, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i === c.statuses.length - 1 ? "bg-[#9FC96D]" : "bg-[#9FC96D]/25"}`} />
                  ))}
                  <span className="text-[10px] text-black/30 ml-2 shrink-0">{formatDate(c.statuses[c.statuses.length - 1]?.happened_at)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
