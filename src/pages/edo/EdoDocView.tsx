import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { edoApi, EdoDoc, EdoRoute, EdoHistory, STATUS_COLOR, STATUS_LABEL, TYPE_LABEL, formatDate, formatFileSize } from "@/lib/edo-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

type DocStatus = "draft" | "pending" | "review" | "approved" | "rejected" | "archive";

const STATUS_TRANSITIONS: Record<string, { to: DocStatus; label: string; icon: string; cls: string }[]> = {
  draft: [{ to: "pending", label: "Отправить на рассмотрение", icon: "Send", cls: "bg-blue-600 text-white" }],
  pending: [
    { to: "review", label: "На согласование", icon: "GitMerge", cls: "bg-yellow-500 text-white" },
    { to: "rejected", label: "Отклонить", icon: "XCircle", cls: "bg-red-500 text-white" },
  ],
  review: [
    { to: "approved", label: "Утвердить", icon: "CheckCircle2", cls: "bg-green-600 text-white" },
    { to: "rejected", label: "Отклонить", icon: "XCircle", cls: "bg-red-500 text-white" },
  ],
  approved: [{ to: "archive", label: "В архив", icon: "Archive", cls: "bg-purple-600 text-white" }],
  rejected: [{ to: "draft", label: "Вернуть в черновик", icon: "RotateCcw", cls: "bg-gray-600 text-white" }],
  archive: [{ to: "draft", label: "Восстановить", icon: "RotateCcw", cls: "bg-gray-600 text-white" }],
};

const ROUTE_COLOR: Record<string, string> = {
  pending: "bg-gray-100 text-gray-500",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  skipped: "bg-gray-50 text-gray-300",
};

export default function EdoDocView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [doc, setDoc] = useState<EdoDoc | null>(null);
  const [routes, setRoutes] = useState<EdoRoute[]>([]);
  const [history, setHistory] = useState<EdoHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "route" | "history">("info");
  const [statusComment, setStatusComment] = useState("");
  const [showStatusModal, setShowStatusModal] = useState<DocStatus | null>(null);
  const [working, setWorking] = useState(false);
  const [addApprover, setAddApprover] = useState("");
  const [users, setUsers] = useState<{ id: number; full_name: string; position: string }[]>([]);

  const load = () => {
    setLoading(true);
    edoApi.get(Number(id))
      .then(r => { setDoc(r.doc); setRoutes(r.routes); setHistory(r.history); })
      .catch(() => navigate("/edo/docs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); edoApi.users().then(r => setUsers(r.users)); }, [id]);

  const handleStatus = async (newStatus: DocStatus) => {
    setWorking(true);
    try {
      await edoApi.setStatus(Number(id), newStatus, statusComment);
      toast({ title: `Статус изменён: ${STATUS_LABEL[newStatus]}` });
      setShowStatusModal(null);
      setStatusComment("");
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally { setWorking(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Переместить в корзину?")) return;
    await edoApi.delete(Number(id));
    toast({ title: "Документ удалён" });
    navigate("/edo/docs");
  };

  const handleAddApprover = async () => {
    if (!addApprover) return;
    await edoApi.routeAdd(Number(id), Number(addApprover));
    setAddApprover("");
    load();
    toast({ title: "Согласующий добавлен" });
  };

  const handleRouteAct = async (routeId: number, status: "approved" | "rejected") => {
    setWorking(true);
    try {
      await edoApi.routeAct(routeId, status, statusComment);
      toast({ title: status === "approved" ? "Согласовано" : "Отклонено" });
      setStatusComment("");
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally { setWorking(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );
  if (!doc) return null;

  const transitions = STATUS_TRANSITIONS[doc.status] || [];
  const isAuthor = user?.id === doc.author.id;
  const canEdit = isAuthor || user?.role === "admin" || user?.role === "manager";
  const myRoute = routes.find(r => r.approver.id === user?.id && r.status === "pending");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button onClick={() => navigate("/edo/docs")} className="mt-1 text-black/40 hover:text-black transition-colors shrink-0">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[12px] font-mono text-black/30">{doc.doc_number}</span>
            <span className="text-black/20">·</span>
            <span className="text-[12px] text-black/40">{TYPE_LABEL[doc.doc_type] || doc.doc_type}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[doc.status]}`}>
              {STATUS_LABEL[doc.status]}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-black tracking-tight leading-snug">{doc.title}</h1>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/edo/docs/${id}/edit`}
              className="p-2 rounded-xl border border-black/10 text-black/50 hover:text-black hover:bg-black/5 transition-colors">
              <Icon name="Pencil" size={16} />
            </Link>
            <button onClick={handleDelete}
              className="p-2 rounded-xl border border-black/10 text-black/50 hover:text-red-500 hover:border-red-200 transition-colors">
              <Icon name="Trash2" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Моё согласование */}
      {myRoute && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Icon name="Bell" size={18} className="text-yellow-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <div className="font-semibold text-yellow-800 text-sm">Требуется ваше согласование</div>
            <textarea value={statusComment} onChange={e => setStatusComment(e.target.value)}
              placeholder="Комментарий (необязательно)" rows={2}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-yellow-200 text-sm bg-white resize-none focus:outline-none" />
          </div>
          <div className="flex gap-2 shrink-0">
            <button disabled={working} onClick={() => handleRouteAct(myRoute.id, "approved")}
              className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
              Согласовать
            </button>
            <button disabled={working} onClick={() => handleRouteAct(myRoute.id, "rejected")}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
              Отклонить
            </button>
          </div>
        </div>
      )}

      {/* Действия со статусом */}
      {canEdit && transitions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {transitions.map(t => (
            <button key={t.to} onClick={() => setShowStatusModal(t.to)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 ${t.cls}`}>
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Табы */}
      <div className="flex gap-1 bg-white rounded-2xl border border-black/5 p-1 mb-5">
        {([["info", "Информация"], ["route", "Маршрут"], ["history", "История"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors ${tab === key ? "bg-[#1a0a6e] text-white" : "text-black/40 hover:text-black"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="space-y-4">
        {tab === "info" && (
          <>
            <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Автор</div>
                  <div className="text-sm font-semibold text-black">{doc.author.full_name}</div>
                  <div className="text-[11px] text-black/40">{doc.author.email}</div>
                </div>
                {doc.assignee && (
                  <div>
                    <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Исполнитель</div>
                    <div className="text-sm font-semibold text-black">{doc.assignee.full_name}</div>
                    <div className="text-[11px] text-black/40">{doc.assignee.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Срок</div>
                  <div className="text-sm font-semibold text-black">{doc.due_date ? formatDate(doc.due_date) : "—"}</div>
                </div>
                {doc.from_org && (
                  <div>
                    <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">От</div>
                    <div className="text-sm text-black">{doc.from_org}</div>
                  </div>
                )}
                {doc.to_org && (
                  <div>
                    <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Кому</div>
                    <div className="text-sm text-black">{doc.to_org}</div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-1">Создан</div>
                  <div className="text-sm text-black">{formatDate(doc.created_at)}</div>
                </div>
              </div>

              {doc.content && (
                <div>
                  <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-3">Содержание</div>
                  <div className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap bg-[#f5f5f7] rounded-xl p-4">{doc.content}</div>
                </div>
              )}

              {doc.notes && (
                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-2">Примечания</div>
                  <div className="text-sm text-black/60 leading-relaxed">{doc.notes}</div>
                </div>
              )}
            </div>

            {doc.file_name && (
              <div className="bg-white rounded-2xl border border-black/5 p-5">
                <div className="text-[11px] font-semibold text-black/35 uppercase tracking-wide mb-3">Прикреплённый файл</div>
                <a href={doc.file_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] hover:bg-[#ede9ff] transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-[#1a0a6e]/10 flex items-center justify-center">
                    <Icon name="FileDown" size={18} className="text-[#1a0a6e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1a0a6e] truncate">{doc.file_name}</div>
                    <div className="text-[11px] text-black/40">{formatFileSize(doc.file_size)}</div>
                  </div>
                  <Icon name="ExternalLink" size={14} className="text-black/20 group-hover:text-[#1a0a6e] transition-colors" />
                </a>
              </div>
            )}
          </>
        )}

        {tab === "route" && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-black text-[15px]">Маршрут согласования</h3>
            </div>
            {routes.length === 0 ? (
              <p className="text-sm text-black/40 mb-4">Согласующие не назначены</p>
            ) : (
              <div className="space-y-3 mb-5">
                {routes.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1a0a6e]/10 flex items-center justify-center text-[10px] font-black text-[#1a0a6e] shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-black">{r.approver.full_name}</div>
                      <div className="text-[11px] text-black/40">{r.approver.position || r.approver.email}</div>
                      {r.comment && <div className="text-[11px] text-black/50 mt-0.5 italic">«{r.comment}»</div>}
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${ROUTE_COLOR[r.status]}`}>
                      {r.status === "pending" ? "Ожидает" : r.status === "approved" ? "Согласовано" : r.status === "rejected" ? "Отклонено" : "Пропущено"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {canEdit && (
              <div className="flex gap-2 pt-4 border-t border-black/5">
                <select value={addApprover} onChange={e => setAddApprover(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none focus:border-[#1a0a6e]/40">
                  <option value="">Выбрать согласующего...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name}{u.position ? ` (${u.position})` : ""}</option>)}
                </select>
                <button onClick={handleAddApprover} disabled={!addApprover}
                  className="px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#2d1a8e] transition-colors">
                  Добавить
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 md:p-6">
            <h3 className="font-bold text-black text-[15px] mb-4">История действий</h3>
            {history.length === 0 ? (
              <p className="text-sm text-black/40">История пуста</p>
            ) : (
              <div className="space-y-4">
                {history.map(h => (
                  <div key={h.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1a0a6e]/8 flex items-center justify-center shrink-0 text-[11px] font-bold text-[#1a0a6e]">
                      {h.user.full_name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-black">{h.user.full_name}</span>
                        <span className="text-[11px] text-black/35">{formatDate(h.created_at)}</span>
                      </div>
                      <div className="text-[13px] text-black/60 mt-0.5">{h.action}</div>
                      {h.comment && <div className="text-[12px] text-black/40 italic mt-0.5">«{h.comment}»</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модалка изменения статуса */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-black text-black text-lg mb-1">Изменить статус</h3>
            <p className="text-sm text-black/50 mb-4">→ {STATUS_LABEL[showStatusModal]}</p>
            <textarea value={statusComment} onChange={e => setStatusComment(e.target.value)}
              placeholder="Комментарий (необязательно)" rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/40 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowStatusModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60">
                Отмена
              </button>
              <button disabled={working} onClick={() => handleStatus(showStatusModal)}
                className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold disabled:opacity-50">
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
