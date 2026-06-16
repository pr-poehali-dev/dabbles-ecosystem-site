import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { edoApi, STATUS_COLOR, STATUS_LABEL, TYPE_LABEL, formatDate, EdoDoc } from "@/lib/edo-api";
import Icon from "@/components/ui/icon";

const STATUSES = ["", "draft", "pending", "review", "approved", "rejected", "archive"];
const DOC_TYPES = ["", "incoming", "outgoing", "internal", "order", "contract", "act"];

interface Props { filter?: { doc_type?: string; status?: string } }

export default function EdoDocList({ filter }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<EdoDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(filter?.status || searchParams.get("status") || "");
  const [docType, setDocType] = useState(filter?.doc_type || searchParams.get("doc_type") || "");
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: LIMIT, offset: page * LIMIT };
    if (search) params.search = search;
    if (status) params.status = status;
    if (docType) params.doc_type = docType;
    edoApi.list(params)
      .then(d => { setDocs(d.docs); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [search, status, docType, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchParams({ search, status, doc_type: docType });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Документы</h1>
          <p className="text-black/40 text-sm">{total} документов</p>
        </div>
        <Link to="/edo/docs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold hover:bg-[#2d1a8e] transition-colors">
          <Icon name="Plus" size={16} />
          <span className="hidden sm:inline">Создать</span>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию, номеру, организации..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/40 bg-[#f5f5f7]"
            />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none focus:border-[#1a0a6e]/40">
            <option value="">Все статусы</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select value={docType} onChange={e => { setDocType(e.target.value); setPage(0); }}
            className="px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none focus:border-[#1a0a6e]/40">
            <option value="">Все типы</option>
            {DOC_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">
            Найти
          </button>
        </form>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-black/30">
            <Icon name="FileX" size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">Документов не найдено</p>
            <Link to="/edo/docs/new" className="mt-3 text-[#1a0a6e] text-sm font-semibold hover:underline">Создать документ</Link>
          </div>
        ) : (
          <>
            {/* Desktop таблица */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-[#f5f5f7]">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-black/40 uppercase tracking-wide">№</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-black/40 uppercase tracking-wide">Название</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-black/40 uppercase tracking-wide">Тип</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-black/40 uppercase tracking-wide">Автор</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-black/40 uppercase tracking-wide">Срок</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-black/40 uppercase tracking-wide">Статус</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/4">
                  {docs.map(doc => (
                    <tr key={doc.id} className="hover:bg-black/2 cursor-pointer" onClick={() => navigate(`/edo/docs/${doc.id}`)}>
                      <td className="px-5 py-3 text-[12px] text-black/40 font-mono">{doc.doc_number}</td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-black text-[13px] truncate max-w-[220px]">{doc.title}</div>
                        {(doc.from_org || doc.to_org) && (
                          <div className="text-[11px] text-black/35 truncate max-w-[220px]">{doc.from_org || doc.to_org}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[12px] text-black/50">{TYPE_LABEL[doc.doc_type] || doc.doc_type}</td>
                      <td className="px-5 py-3 text-[12px] text-black/50">{doc.author_name}</td>
                      <td className="px-5 py-3 text-[12px] text-black/50">{doc.due_date ? formatDate(doc.due_date) : "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[doc.status]}`}>
                          {STATUS_LABEL[doc.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Icon name="ChevronRight" size={14} className="text-black/20" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile список */}
            <div className="md:hidden divide-y divide-black/5">
              {docs.map(doc => (
                <Link key={doc.id} to={`/edo/docs/${doc.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-black/2 active:bg-black/4">
                  <div className="w-9 h-9 rounded-xl bg-[#1a0a6e]/8 flex items-center justify-center shrink-0">
                    <Icon name="FileText" size={16} className="text-[#1a0a6e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-black truncate">{doc.title}</div>
                    <div className="text-[11px] text-black/40">{doc.doc_number} · {formatDate(doc.created_at)}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[doc.status]}`}>
                    {STATUS_LABEL[doc.status]}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Пагинация */}
        {total > LIMIT && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-black/5">
            <span className="text-[12px] text-black/40">Показано {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} из {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-medium disabled:opacity-30 hover:bg-black/5">
                ←
              </button>
              <button disabled={(page + 1) * LIMIT >= total} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-medium disabled:opacity-30 hover:bg-black/5">
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
