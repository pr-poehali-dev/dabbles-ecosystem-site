import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { edoApi, STATUS_COLOR, STATUS_LABEL, TYPE_LABEL, formatDate, EdoDoc } from "@/lib/edo-api";
import Icon from "@/components/ui/icon";

const STAT_CARDS = [
  { key: "draft", label: "Черновики", icon: "FilePen", color: "text-gray-500" },
  { key: "pending", label: "На рассмотрении", icon: "Clock", color: "text-blue-500" },
  { key: "review", label: "На согласовании", icon: "GitMerge", color: "text-yellow-500" },
  { key: "approved", label: "Утверждены", icon: "CheckCircle2", color: "text-green-500" },
  { key: "rejected", label: "Отклонены", icon: "XCircle", color: "text-red-500" },
  { key: "archive", label: "В архиве", icon: "Archive", color: "text-purple-500" },
];

export default function EdoDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<EdoDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      edoApi.stats(),
      edoApi.list({ limit: 5 }),
    ]).then(([s, d]) => {
      setStats(s.by_status || {});
      setRecent(d.docs || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Приветствие */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
          Добрый день, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-black/40 text-sm mt-1">Электронный документооборот · {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Быстрые действия */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/edo/docs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold hover:bg-[#2d1a8e] transition-colors">
          <Icon name="Plus" size={16} />
          Создать документ
        </Link>
        <Link to="/edo/inbox"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/8 text-black text-sm font-semibold hover:bg-black/3 transition-colors">
          <Icon name="Inbox" size={16} />
          Входящие
        </Link>
        <Link to="/edo/orgs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/8 text-black text-sm font-semibold hover:bg-black/3 transition-colors">
          <Icon name="Building2" size={16} />
          Организации
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {STAT_CARDS.map(c => (
          <Link key={c.key} to={`/edo/docs?status=${c.key}`}
            className="bg-white rounded-2xl p-4 border border-black/5 hover:border-[#1a0a6e]/20 transition-colors group">
            <Icon name={c.icon} size={20} className={`${c.color} mb-2`} />
            <div className="text-2xl font-black text-black">{stats[c.key] || 0}</div>
            <div className="text-[11px] text-black/40 mt-0.5 leading-tight">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Последние документы */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <h2 className="font-bold text-black text-[15px]">Последние документы</h2>
            <Link to="/edo/docs" className="text-[#1a0a6e] text-[13px] font-semibold hover:underline">Все →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-black/30">
              <Icon name="FileText" size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Документов пока нет</p>
              <Link to="/edo/docs/new" className="mt-3 text-[#1a0a6e] text-sm font-semibold hover:underline">Создать первый</Link>
            </div>
          ) : (
            <div className="divide-y divide-black/4">
              {recent.map(doc => (
                <Link key={doc.id} to={`/edo/docs/${doc.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-black/2 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#1a0a6e]/8 flex items-center justify-center shrink-0">
                    <Icon name="FileText" size={14} className="text-[#1a0a6e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-black truncate">{doc.title}</div>
                    <div className="text-[11px] text-black/40">{doc.doc_number} · {TYPE_LABEL[doc.doc_type] || doc.doc_type} · {formatDate(doc.created_at)}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[doc.status]}`}>
                    {STATUS_LABEL[doc.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Сводка по типам */}
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5">
            <h2 className="font-bold text-black text-[15px]">По типам</h2>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(TYPE_LABEL).map(([key, label]) => {
              const count = 0;
              return (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-black/60">{label}</span>
                  <span className="text-[13px] font-bold text-black">{count}</span>
                </div>
              );
            })}
            <div className="pt-2 border-t border-black/5 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-black">Всего</span>
              <span className="text-[13px] font-black text-[#1a0a6e]">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}