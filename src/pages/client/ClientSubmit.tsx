import { useEffect, useState } from "react";
import { cpApi, CpCase, CpRequest, REQUEST_STATUSES, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const REQUEST_TYPES = [
  {
    type: "recalculation",
    label: "Заявление на перерасчёт",
    icon: "Calculator",
    desc: "Запрос на пересчёт суммы задолженности или требований",
  },
  {
    type: "termination",
    label: "Заявление на расторжение договора",
    icon: "FileX2",
    desc: "Инициирование расторжения действующего договора",
  },
  {
    type: "additional",
    label: "Дополнительное соглашение",
    icon: "FilePlus2",
    desc: "Запрос на изменение или дополнение условий договора",
  },
];

export default function ClientSubmit() {
  const { toast } = useToast();
  const [cases, setCases] = useState<CpCase[]>([]);
  const [requests, setRequests] = useState<CpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [caseId, setCaseId] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"select" | "form" | "done">("select");

  useEffect(() => {
    Promise.all([cpApi.cases(), cpApi.myRequests()])
      .then(([c, r]) => { setCases(c.cases); setRequests(r.requests); })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await cpApi.submitRequest({
        request_type: selected,
        case_id: caseId ? Number(caseId) : undefined,
        comment,
      });
      toast({ title: "Заявление принято" });
      setStep("done");
      cpApi.myRequests().then(r => setRequests(r.requests));
    } catch {
      toast({ title: "Ошибка отправки", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black tracking-tight">Подать заявление</h1>
        <p className="text-black/40 text-sm mt-0.5">Выберите тип обращения</p>
      </div>

      {step === "done" ? (
        <div className="bg-white rounded-2xl border border-black/5 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle2" size={28} className="text-green-600" />
          </div>
          <h2 className="font-black text-black text-xl mb-2">Заявление принято!</h2>
          <p className="text-black/50 text-sm mb-6">Мы свяжемся с вами в течение 1–2 рабочих дней.</p>
          <button onClick={() => { setStep("select"); setSelected(null); setComment(""); setCaseId(""); }}
            className="px-6 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold hover:bg-[#2d1a8e] transition-colors">
            Подать ещё одно
          </button>
        </div>
      ) : step === "select" ? (
        <div className="space-y-3">
          {REQUEST_TYPES.map(rt => (
            <button key={rt.type} onClick={() => { setSelected(rt.type); setStep("form"); }}
              className="w-full bg-white rounded-2xl border border-black/5 p-5 hover:border-[#1a0a6e]/25 text-left transition-all hover:shadow-sm group">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#1a0a6e]/8 flex items-center justify-center shrink-0 group-hover:bg-[#1a0a6e]/15 transition-colors">
                  <Icon name={rt.icon} size={20} className="text-[#1a0a6e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black text-[14px] leading-snug">{rt.label}</div>
                  <div className="text-[12px] text-black/45 mt-0.5 leading-snug">{rt.desc}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-black/20 shrink-0 mt-1 group-hover:text-[#1a0a6e] transition-colors" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6">
          <button onClick={() => setStep("select")}
            className="flex items-center gap-1.5 text-black/40 hover:text-black text-sm mb-5 transition-colors">
            <Icon name="ArrowLeft" size={15} /> Назад
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#1a0a6e]/8 flex items-center justify-center">
              <Icon name={REQUEST_TYPES.find(r => r.type === selected)?.icon || "File"} size={18} className="text-[#1a0a6e]" />
            </div>
            <div>
              <div className="font-bold text-black text-[15px]">{REQUEST_TYPES.find(r => r.type === selected)?.label}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {cases.length > 0 && (
              <div>
                <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Дело (необязательно)</label>
                <select value={caseId} onChange={e => setCaseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm bg-[#f7f7fa] focus:outline-none focus:border-[#1a0a6e]/40">
                  <option value="">— Выберите дело —</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.case_number ? `${c.case_number} — ` : ""}{c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Пояснение (необязательно)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                rows={4} placeholder="Опишите суть вашего обращения..."
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm bg-[#f7f7fa] focus:outline-none focus:border-[#1a0a6e]/40 resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#2d1a8e] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {submitting && <Icon name="Loader2" size={15} className="animate-spin" />}
              Отправить заявление
            </button>
          </form>
        </div>
      )}

      {/* История заявлений */}
      {requests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-bold text-black/50 uppercase tracking-wide mb-3">Мои обращения</h2>
          <div className="space-y-2">
            {requests.map(r => {
              const rs = REQUEST_STATUSES[r.status] || { label: r.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <div key={r.id} className="bg-white rounded-xl border border-black/5 px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-black truncate">{r.request_type_label}</div>
                    <div className="text-[11px] text-black/35">{formatDate(r.created_at)}{r.case_number ? ` · Дело ${r.case_number}` : ""}</div>
                    {r.admin_comment && (
                      <div className="text-[12px] text-black/55 mt-0.5 italic">Ответ: «{r.admin_comment}»</div>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${rs.cls}`}>{rs.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
