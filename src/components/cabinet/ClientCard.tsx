import { useEffect, useState, useCallback } from "react";
import { cpApi, CpClient, CpCase, CpPayment, PAYMENT_STATUS, CASE_STATUS_COLORS, REQUEST_STATUSES, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

type CardTab = "profile" | "cases" | "payments" | "documents" | "requests";

type ClientFull = CpClient & { notes: string; is_active: string; created_at: string };
type CaseRow = CpCase & { client_name: string; client_email: string };
type PaymentRow = CpPayment & { client_name: string };
type DocRow = { id?: number; doc_type: string; title: string; content: string; file_url: string; file_name?: string; is_active?: string; sort_order: number; created_at?: string };
type RequestRow = { id: number; request_type_label: string; status: string; comment: string; admin_comment: string; created_at: string; case_number: string | null };

const TABS: { key: CardTab; label: string; icon: string }[] = [
  { key: "profile", label: "Профиль", icon: "User" },
  { key: "cases", label: "Дела", icon: "Scale" },
  { key: "payments", label: "Оплаты", icon: "CreditCard" },
  { key: "documents", label: "Документы", icon: "FileText" },
  { key: "requests", label: "Заявления", icon: "Inbox" },
];

const DOC_TYPES: Record<string, string> = {
  contract: "Договор", addendum: "Допсоглашение", act: "Акт", invoice: "Счёт", other: "Прочее",
};

interface Props {
  clientId: number;
  onClose: () => void;
  onChanged: () => void;
}

export default function ClientCard({ clientId, onClose, onChanged }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<CardTab>("profile");

  const [client, setClient] = useState<ClientFull | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  // Профиль (редактирование)
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", email: "", phone: "", address: "", passport: "", inn: "", notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Дело
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [caseForm, setCaseForm] = useState({ case_number: "", title: "", plaintiff: "", defendant: "", amount: "", court: "", description: "", docs_link: "" });
  const [showStatusFor, setShowStatusFor] = useState<number | null>(null);
  const [statusForm, setStatusForm] = useState({ status: "new", label: "", comment: "", notify: true });

  // Оплата
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ case_id: "", amount: "", basis: "", due_date: "", notify: true });

  // Документ
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({ id: undefined as number | undefined, doc_type: "contract", title: "", content: "", file_url: "", sort_order: 1 });

  const CASE_STATUSES = [
    { v: "new", l: "Принято в работу" }, { v: "documents_prep", l: "Подготовка документов" },
    { v: "filed", l: "Документы поданы" }, { v: "hearing", l: "Судебное заседание" },
    { v: "decision", l: "Решение суда" }, { v: "enforcement", l: "Исполнительное производство" },
    { v: "completed", l: "Дело закрыто" }, { v: "suspended", l: "Приостановлено" },
  ];

  const loadClient = useCallback(async () => {
    const r = await cpApi.adminClientGet(clientId);
    setClient(r.client);
    setProfileForm({
      full_name: r.client.full_name || "", email: r.client.email || "", phone: r.client.phone || "",
      address: r.client.address || "", passport: r.client.passport || "", inn: r.client.inn || "", notes: r.client.notes || "",
    });
  }, [clientId]);

  const loadCases = useCallback(() => cpApi.adminCases(clientId).then(r => setCases(r.cases)), [clientId]);
  const loadPayments = useCallback(() => cpApi.adminPayments(clientId).then(r => setPayments(r.payments)), [clientId]);
  const loadDocuments = useCallback(() => cpApi.adminDocuments(clientId).then(r => setDocuments(r.documents as DocRow[])), [clientId]);
  const loadRequests = useCallback(() => cpApi.adminRequests({ client_id: clientId }).then(r => setRequests(r.requests as RequestRow[])), [clientId]);

  useEffect(() => { loadClient(); }, [loadClient]);
  useEffect(() => {
    if (tab === "cases") loadCases();
    if (tab === "payments") { loadCases(); loadPayments(); }
    if (tab === "documents") loadDocuments();
    if (tab === "requests") loadRequests();
  }, [tab, loadCases, loadPayments, loadDocuments, loadRequests]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await cpApi.adminClientUpdate({ id: clientId, ...profileForm });
      toast({ title: "Профиль сохранён" });
      setEditProfile(false);
      loadClient();
      onChanged();
    } catch { toast({ title: "Ошибка", variant: "destructive" }); }
    finally { setSavingProfile(false); }
  };

  const resetPassword = async () => {
    const r = await cpApi.adminClientResetPassword(clientId);
    toast({ title: "Пароль сброшен", description: `Новый пароль: ${r.password} — отправлен клиенту` });
  };

  const [sendingCreds, setSendingCreds] = useState(false);
  const sendCredentials = async () => {
    setSendingCreds(true);
    try {
      const r = await cpApi.adminClientSendCredentials(clientId);
      if (r.ok) {
        toast({ title: "Доступ отправлен", description: `Логин и пароль отправлены на ${r.sent_to}` });
      } else {
        toast({ title: "Письмо не отправлено", description: `Пароль создан: ${r.password}. Ошибка: ${String(r.result)}`, variant: "destructive" });
      }
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSendingCreds(false);
    }
  };

  const toggleActive = async () => {
    if (!client) return;
    await cpApi.adminClientUpdate({ id: clientId, is_active: client.is_active === "yes" ? "no" : "yes" });
    loadClient();
    onChanged();
  };

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault();
    await cpApi.adminCaseCreate({ client_id: clientId, ...caseForm, amount: caseForm.amount ? Number(caseForm.amount) : undefined });
    toast({ title: "Дело создано" });
    setShowCaseForm(false);
    setCaseForm({ case_number: "", title: "", plaintiff: "", defendant: "", amount: "", court: "", description: "", docs_link: "" });
    loadCases();
  };

  const addStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusFor) return;
    await cpApi.adminCaseAddStatus({ case_id: showStatusFor, ...statusForm });
    toast({ title: "Статус добавлен" });
    setShowStatusFor(null);
    setStatusForm({ status: "new", label: "", comment: "", notify: true });
    loadCases();
  };

  const createPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await cpApi.adminPaymentCreate({
      client_id: clientId, amount: Number(payForm.amount), basis: payForm.basis,
      case_id: payForm.case_id ? Number(payForm.case_id) : undefined,
      due_date: payForm.due_date || undefined, notify: payForm.notify,
    });
    toast({ title: "Счёт выставлен" });
    setShowPayForm(false);
    setPayForm({ case_id: "", amount: "", basis: "", due_date: "", notify: true });
    loadPayments();
  };

  const markPaid = async (id: number) => {
    await cpApi.adminPaymentUpdate({ id, status: "paid", payment_date: new Date().toISOString().split("T")[0] });
    loadPayments();
  };

  const saveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    await cpApi.adminDocumentSave({ ...docForm, client_id: clientId });
    toast({ title: docForm.id ? "Документ обновлён" : "Документ добавлен" });
    setShowDocForm(false);
    setDocForm({ id: undefined, doc_type: "contract", title: "", content: "", file_url: "", sort_order: 1 });
    loadDocuments();
  };

  const updateRequest = async (id: number, status: string) => {
    await cpApi.adminRequestUpdate({ id, status });
    loadRequests();
  };

  const input = "w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none focus:border-[#1a0a6e]/40";
  const lbl = "text-[11px] font-semibold text-black/40 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-stretch sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-3xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden">
        {/* Шапка */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/8 shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#1a0a6e]/10 flex items-center justify-center text-[15px] font-black text-[#1a0a6e] shrink-0">
            {client?.full_name?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-black text-[15px] truncate">{client?.full_name || "Загрузка..."}</div>
            <div className="text-[12px] text-black/40 truncate">{client?.email}</div>
          </div>
          {client && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${client.is_active === "yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {client.is_active === "yes" ? "Активен" : "Заблокирован"}
            </span>
          )}
          <button onClick={onClose} className="text-black/30 hover:text-black p-1 shrink-0">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex gap-1 px-3 pt-3 border-b border-black/8 shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-[12px] font-semibold whitespace-nowrap transition-colors ${tab === t.key ? "bg-[#1a0a6e]/8 text-[#1a0a6e] border-b-2 border-[#1a0a6e]" : "text-black/50 hover:text-black"}`}>
              <Icon name={t.icon} size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ── ПРОФИЛЬ ── */}
          {tab === "profile" && client && (
            editProfile ? (
              <form onSubmit={saveProfile} className="space-y-3">
                {([["full_name", "ФИО"], ["email", "Email"], ["phone", "Телефон"], ["passport", "Паспорт"], ["inn", "ИНН"], ["address", "Адрес"]] as [keyof typeof profileForm, string][]).map(([k, l]) => (
                  <div key={k}>
                    <label className={lbl}>{l}</label>
                    <input className={input} value={profileForm[k]} onChange={e => setProfileForm(p => ({ ...p, [k]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className={lbl}>Заметки</label>
                  <textarea className={`${input} resize-none`} rows={3} value={profileForm.notes} onChange={e => setProfileForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setEditProfile(false)} className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60">Отмена</button>
                  <button type="submit" disabled={savingProfile} className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold disabled:opacity-50">{savingProfile ? "..." : "Сохранить"}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {([["Телефон", client.phone], ["Email", client.email], ["Паспорт", client.passport], ["ИНН", client.inn], ["Адрес", client.address], ["Клиент с", formatDate(client.created_at)]] as [string, string][]).map(([l, v]) => (
                    <div key={l} className="bg-[#f5f5f7] rounded-xl p-3">
                      <div className="text-[10px] text-black/40 font-semibold mb-0.5">{l}</div>
                      <div className="text-[13px] text-black font-medium break-words">{v || "—"}</div>
                    </div>
                  ))}
                </div>
                {client.notes && (
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <div className="text-[10px] text-yellow-700 font-semibold mb-0.5">Заметки</div>
                    <div className="text-[13px] text-yellow-900">{client.notes}</div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap pt-1">
                  <button onClick={() => setEditProfile(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"><Icon name="Pencil" size={14} /> Редактировать</button>
                  <button onClick={sendCredentials} disabled={sendingCreds} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold disabled:opacity-50"><Icon name="Mail" size={14} /> {sendingCreds ? "Отправка..." : "Отправить доступ"}</button>
                  <button onClick={resetPassword} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 text-sm font-semibold text-black/70 hover:bg-black/5"><Icon name="KeyRound" size={14} /> Сбросить пароль</button>
                  <button onClick={toggleActive} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 text-sm font-semibold text-red-500 hover:bg-red-50"><Icon name="Ban" size={14} /> {client.is_active === "yes" ? "Заблокировать" : "Разблокировать"}</button>
                </div>
              </div>
            )
          )}

          {/* ── ДЕЛА ── */}
          {tab === "cases" && (
            <div>
              <div className="flex justify-end mb-3">
                <button onClick={() => setShowCaseForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"><Icon name="Plus" size={14} /> Создать дело</button>
              </div>
              {showCaseForm && (
                <form onSubmit={createCase} className="bg-[#f5f5f7] rounded-2xl p-4 mb-4 space-y-2">
                  {([["title", "Название дела *", true], ["case_number", "Номер дела", false], ["plaintiff", "Истец", false], ["defendant", "Ответчик", false], ["amount", "Сумма иска", false], ["court", "Суд", false], ["docs_link", "Ссылка на документы", false]] as [keyof typeof caseForm, string, boolean][]).map(([k, l, req]) => (
                    <input key={k} className={input} placeholder={l} required={req} value={caseForm[k]} onChange={e => setCaseForm(p => ({ ...p, [k]: e.target.value }))} />
                  ))}
                  <textarea className={`${input} resize-none`} rows={2} placeholder="Описание" value={caseForm.description} onChange={e => setCaseForm(p => ({ ...p, description: e.target.value }))} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowCaseForm(false)} className="flex-1 py-2 rounded-xl border border-black/10 text-sm font-semibold text-black/60">Отмена</button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">Создать</button>
                  </div>
                </form>
              )}
              <div className="space-y-3">
                {cases.length === 0 && <p className="text-black/40 text-sm py-8 text-center">У клиента нет дел</p>}
                {cases.map(c => (
                  <div key={c.id} className="border border-black/8 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono text-black/35">{c.case_number || `#${c.id}`}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CASE_STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>{c.status_label}</span>
                    </div>
                    <div className="font-bold text-black text-[14px]">{c.title}</div>
                    {(c.plaintiff || c.defendant) && <div className="text-[12px] text-black/50 mt-0.5">{c.plaintiff} → {c.defendant}</div>}
                    {c.amount != null && <div className="text-[12px] font-bold text-[#1a0a6e] mt-0.5">{formatMoney(c.amount)}</div>}
                    <button onClick={() => { setShowStatusFor(c.id); setStatusForm({ status: c.status, label: "", comment: "", notify: true }); }} className="mt-2 px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold hover:bg-black/5">+ Обновить статус</button>
                    {showStatusFor === c.id && (
                      <form onSubmit={addStatus} className="mt-3 bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                        <select className={input} value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value, label: CASE_STATUSES.find(s => s.v === e.target.value)?.l || "" }))}>
                          {CASE_STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                        </select>
                        <textarea className={`${input} resize-none`} rows={2} placeholder="Комментарий" value={statusForm.comment} onChange={e => setStatusForm(p => ({ ...p, comment: e.target.value }))} />
                        <label className="flex items-center gap-2 text-[12px] text-black/60"><input type="checkbox" checked={statusForm.notify} onChange={e => setStatusForm(p => ({ ...p, notify: e.target.checked }))} /> Уведомить клиента</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowStatusFor(null)} className="flex-1 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold text-black/60">Отмена</button>
                          <button type="submit" className="flex-1 py-1.5 rounded-lg bg-[#1a0a6e] text-white text-[12px] font-semibold">Добавить</button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ОПЛАТЫ ── */}
          {tab === "payments" && (
            <div>
              <div className="flex justify-end mb-3">
                <button onClick={() => setShowPayForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"><Icon name="Plus" size={14} /> Выставить счёт</button>
              </div>
              {showPayForm && (
                <form onSubmit={createPayment} className="bg-[#f5f5f7] rounded-2xl p-4 mb-4 space-y-2">
                  <select className={input} value={payForm.case_id} onChange={e => setPayForm(p => ({ ...p, case_id: e.target.value }))}>
                    <option value="">— Без привязки к делу —</option>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.case_number || c.title}</option>)}
                  </select>
                  <input className={input} type="number" placeholder="Сумма *" required value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} />
                  <input className={input} placeholder="Основание *" required value={payForm.basis} onChange={e => setPayForm(p => ({ ...p, basis: e.target.value }))} />
                  <input className={input} type="date" value={payForm.due_date} onChange={e => setPayForm(p => ({ ...p, due_date: e.target.value }))} />
                  <label className="flex items-center gap-2 text-[12px] text-black/60"><input type="checkbox" checked={payForm.notify} onChange={e => setPayForm(p => ({ ...p, notify: e.target.checked }))} /> Уведомить клиента</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPayForm(false)} className="flex-1 py-2 rounded-xl border border-black/10 text-sm font-semibold text-black/60">Отмена</button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">Выставить</button>
                  </div>
                </form>
              )}
              <div className="space-y-2">
                {payments.length === 0 && <p className="text-black/40 text-sm py-8 text-center">Счетов нет</p>}
                {payments.map(p => {
                  const ps = PAYMENT_STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-500" };
                  return (
                    <div key={p.id} className="flex items-center gap-3 border border-black/8 rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-black">{formatMoney(p.amount)}</div>
                        <div className="text-[12px] text-black/50">{p.basis}</div>
                        {p.due_date && <div className="text-[11px] text-black/35">до {formatDate(p.due_date)}</div>}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ps.cls}`}>{ps.label}</span>
                      {p.status === "pending" && <button onClick={() => markPaid(p.id)} className="shrink-0 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[12px] font-semibold hover:bg-green-200">Оплачено</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ДОКУМЕНТЫ ── */}
          {tab === "documents" && (
            <div>
              <div className="flex justify-end mb-3">
                <button onClick={() => { setDocForm({ id: undefined, doc_type: "contract", title: "", content: "", file_url: "", sort_order: 1 }); setShowDocForm(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"><Icon name="Plus" size={14} /> Добавить документ</button>
              </div>
              {showDocForm && (
                <form onSubmit={saveDoc} className="bg-[#f5f5f7] rounded-2xl p-4 mb-4 space-y-2">
                  <select className={input} value={docForm.doc_type} onChange={e => setDocForm(p => ({ ...p, doc_type: e.target.value }))}>
                    {Object.entries(DOC_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <input className={input} placeholder="Название *" required value={docForm.title} onChange={e => setDocForm(p => ({ ...p, title: e.target.value }))} />
                  <textarea className={`${input} resize-none`} rows={5} placeholder="Текст документа (онлайн)" value={docForm.content} onChange={e => setDocForm(p => ({ ...p, content: e.target.value }))} />
                  <input className={input} placeholder="Ссылка на файл" value={docForm.file_url} onChange={e => setDocForm(p => ({ ...p, file_url: e.target.value }))} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowDocForm(false)} className="flex-1 py-2 rounded-xl border border-black/10 text-sm font-semibold text-black/60">Отмена</button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">Сохранить</button>
                  </div>
                </form>
              )}
              <div className="space-y-2">
                {documents.length === 0 && <p className="text-black/40 text-sm py-8 text-center">Документов нет</p>}
                {documents.map(d => (
                  <div key={d.id} className="flex items-center gap-3 border border-black/8 rounded-xl p-3">
                    <Icon name="FileText" size={16} className="text-[#1a0a6e] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-black truncate">{d.title}</div>
                      <div className="text-[11px] text-black/40">{DOC_TYPES[d.doc_type] || d.doc_type}</div>
                    </div>
                    <button onClick={() => { setDocForm({ id: d.id, doc_type: d.doc_type, title: d.title, content: d.content, file_url: d.file_url, sort_order: d.sort_order }); setShowDocForm(true); }} className="p-1.5 rounded-lg hover:bg-black/5 text-black/40"><Icon name="Pencil" size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ЗАЯВЛЕНИЯ ── */}
          {tab === "requests" && (
            <div className="space-y-3">
              {requests.length === 0 && <p className="text-black/40 text-sm py-8 text-center">Заявлений нет</p>}
              {requests.map(r => {
                const rs = REQUEST_STATUSES[r.status] || { label: r.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <div key={r.id} className="border border-black/8 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-black text-[14px]">{r.request_type_label}</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${rs.cls}`}>{rs.label}</span>
                    </div>
                    {r.comment && <div className="text-[12px] text-black/60 mt-1 italic">«{r.comment}»</div>}
                    <div className="text-[11px] text-black/30 mt-0.5">{formatDate(r.created_at)}</div>
                    {r.status === "new" && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateRequest(r.id, "in_progress")} className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 text-[12px] font-semibold">В работу</button>
                        <button onClick={() => updateRequest(r.id, "done")} className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[12px] font-semibold">Готово</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}