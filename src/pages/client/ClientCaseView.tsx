import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cpApi, CpCase, CASE_STATUS_COLORS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

export default function ClientCaseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<CpCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cpApi.case(Number(id)).then(r => setC(r.case)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );
  if (!c) return null;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <button onClick={() => navigate("/client/cases")}
        className="flex items-center gap-1.5 text-black/40 hover:text-black text-sm mb-6 transition-colors">
        <Icon name="ArrowLeft" size={16} /> Все дела
      </button>

      {/* Шапка */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-mono text-black/35">{c.case_number || `#${c.id}`}</span>
            <h1 className="text-xl font-black text-black tracking-tight mt-0.5 leading-snug">{c.title}</h1>
          </div>
          <span className={`text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 ${CASE_STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
            {c.status_label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {c.plaintiff && (
            <div>
              <div className="text-[10px] font-semibold text-black/35 uppercase tracking-wide mb-0.5">Истец</div>
              <div className="text-[13px] text-black/80">{c.plaintiff}</div>
            </div>
          )}
          {c.defendant && (
            <div>
              <div className="text-[10px] font-semibold text-black/35 uppercase tracking-wide mb-0.5">Ответчик</div>
              <div className="text-[13px] text-black/80">{c.defendant}</div>
            </div>
          )}
          {c.amount != null && (
            <div>
              <div className="text-[10px] font-semibold text-black/35 uppercase tracking-wide mb-0.5">Сумма иска</div>
              <div className="text-[14px] font-bold text-[#1a0a6e]">{formatMoney(c.amount)}</div>
            </div>
          )}
          {c.court && (
            <div className="col-span-2 sm:col-span-3">
              <div className="text-[10px] font-semibold text-black/35 uppercase tracking-wide mb-0.5">Суд</div>
              <div className="text-[13px] text-black/80">{c.court}</div>
            </div>
          )}
          {c.description && (
            <div className="col-span-2 sm:col-span-3">
              <div className="text-[10px] font-semibold text-black/35 uppercase tracking-wide mb-0.5">Описание</div>
              <div className="text-[13px] text-black/70 leading-relaxed">{c.description}</div>
            </div>
          )}
        </div>

        {c.docs_link && (
          <a href={c.docs_link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#1a0a6e]/8 text-[#1a0a6e] text-[13px] font-semibold hover:bg-[#1a0a6e]/15 transition-colors">
            <Icon name="FolderOpen" size={15} /> Документы по делу
          </a>
        )}
      </div>

      {/* История статусов */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6">
        <h2 className="font-bold text-black text-[15px] mb-5">История движения дела</h2>
        {c.statuses.length === 0 ? (
          <p className="text-sm text-black/40">Статусов пока нет</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-black/8" />
            <div className="space-y-5">
              {c.statuses.map((s, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center z-10 ${
                    i === c.statuses.length - 1 ? "bg-[#1a0a6e]" : "bg-white border-2 border-[#1a0a6e]/30"
                  }`}>
                    {i === c.statuses.length - 1
                      ? <Icon name="Check" size={13} className="text-white" />
                      : <div className="w-2 h-2 rounded-full bg-[#1a0a6e]/30" />
                    }
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[13px] text-black">{s.label}</span>
                      <span className="text-[11px] text-black/35">{formatDate(s.happened_at)}</span>
                    </div>
                    {s.comment && (
                      <p className="text-[12px] text-black/55 mt-0.5 leading-relaxed">{s.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
