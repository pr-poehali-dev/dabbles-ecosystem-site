import { useEffect, useState, useCallback } from "react";
import { cpApi, CpClient, CpCase, CpPayment, PAYMENT_STATUS, CASE_STATUS_COLORS, formatMoney, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

type Tab = "clients" | "cases" | "payments" | "requests" | "templates";

const CASE_STATUSES = [
  { v: "new", l: "Принято в работу" },
  { v: "documents_prep", l: "Подготовка документов" },
  { v: "filed", l: "Документы поданы" },
  { v: "hearing", l: "Судебное заседание" },
  { v: "decision", l: "Решение суда" },
  { v: "enforcement", l: "Исполнительное производство" },
  { v: "completed", l: "Дело закрыто" },
  { v: "suspended", l: "Приостановлено" },
];

export default function AdminClients() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("clients");

  // Clients
  const [clients, setClients] = useState<(CpClient & { created_at: string })[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<(CpClient & { notes: string; is_active: string; created_at: string }) | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState({ full_name: "", email: "", phone: "", address: "", passport: "", inn: "", notes: "" });
  const [clientSaving, setClientSaving] = useState(false);

  // Cases
  const [cases, setCases] = useState<(CpCase & { client_name: string; client_email: string })[]>([]);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [caseForm, setCaseForm] = useState({ client_id: "", case_number: "", title: "", plaintiff: "", defendant: "", amount: "", court: "", description: "", docs_link: "" });
  const [caseSaving, setCaseSaving] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState<number | null>(null);
  const [statusForm, setStatusForm] = useState({ status: "new", label: "", comment: "", notify: true });

  // Payments
  const [payments, setPayments] = useState<(CpPayment & { client_name: string })[]>([]);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ client_id: "", case_id: "", amount: "", basis: "", due_date: "", notes: "", notify: true });
  const [paySaving, setPaySaving] = useState(false);

  // Requests
  const [requests, setRequests] = useState<{ id: number; request_type_label: string; status: string; comment: string; admin_comment: string; created_at: string; client_name: string; client_email: string; case_number: string | null }[]>([]);

  // Templates
  const [templates, setTemplates] = useState<{ id: number; code: string; name: string; subject: string; body_html: string; variables: string }[]>([]);
  const [editTpl, setEditTpl] = useState<typeof templates[0] | null>(null);

  // Send doc modal
  const [showSendDoc, setShowSendDoc] = useState<number | null>(null);
  const [sendDocForm, setSendDocForm] = useState({ doc_title: "", doc_content: "", file_url: "" });

  // Docs modal
  const [showDocsModal, setShowDocsModal] = useState<number | null>(null);
  const [clientDocs, setClientDocs] = useState<{ id?: number; doc_type: string; title: string; content: string; file_url: string; is_active: string; sort_order: number }[]>([]);
  const [docForm, setDocForm] = useState({ id: undefined as number | undefined, doc_type: "contract", title: "", content: "", file_url: "", file_name: "", sort_order: 1 });
  const [showDocForm, setShowDocForm] = useState(false);

  const loadClients = useCallback(() => {
    cpApi.adminClients(search).then(r => setClients(r.clients));
  }, [search]);

  const loadCases = useCallback(() => {
    cpApi.adminCases().then(r => setCases(r.cases));
  }, []);

  const loadPayments = useCallback(() => {
    cpApi.adminPayments().then(r => setPayments(r.payments));
  }, []);

  const loadRequests = useCallback(() => {
    cpApi.adminRequests().then(r => setRequests(r.requests as typeof requests));
  }, []);

  const loadTemplates = useCallback(() => {
    cpApi.adminTemplates().then(r => setTemplates(r.templates));
  }, []);

  useEffect(() => {
    if (tab === "clients") loadClients();
    if (tab === "cases") { loadClients(); loadCases(); }
    if (tab === "payments") { loadClients(); loadCases(); loadPayments(); }
    if (tab === "requests") loadRequests();
    if (tab === "templates") loadTemplates();
  }, [tab, loadClients, loadCases, loadPayments, loadRequests, loadTemplates]);

  useEffect(() => { loadClients(); }, [search, loadClients]);

  const setF = (setter: React.Dispatch<React.SetStateAction<typeof clientForm>>) =>
    (k: string, v: string) => setter(f => ({ ...f, [k]: v }));

  // Create client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientSaving(true);
    try {
      const r = await cpApi.adminClientCreate(clientForm);
      toast({ title: "Клиент создан", description: `Пароль: ${r.password} — отправлен на email` });
      setShowClientForm(false);
      setClientForm({ full_name: "", email: "", phone: "", address: "", passport: "", inn: "", notes: "" });
      loadClients();
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Ошибка", variant: "destructive" });
    } finally { setClientSaving(false); }
  };

  const handleResetPassword = async (id: number) => {
    const r = await cpApi.adminClientResetPassword(id);
    toast({ title: "Пароль сброшен", description: `Новый пароль: ${r.password}` });
  };

  const handleClientToggle = async (id: number, active: string) => {
    await cpApi.adminClientUpdate({ id, is_active: active === "yes" ? "no" : "yes" });
    loadClients();
  };

  // Create case
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaseSaving(true);
    try {
      await cpApi.adminCaseCreate({ ...caseForm, client_id: Number(caseForm.client_id), amount: caseForm.amount ? Number(caseForm.amount) : undefined });
      toast({ title: "Дело создано" });
      setShowCaseForm(false);
      setCaseForm({ client_id: "", case_number: "", title: "", plaintiff: "", defendant: "", amount: "", court: "", description: "", docs_link: "" });
      loadCases();
    } catch { toast({ title: "Ошибка", variant: "destructive" }); }
    finally { setCaseSaving(false); }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusForm) return;
    await cpApi.adminCaseAddStatus({ case_id: showStatusForm, ...statusForm });
    toast({ title: "Статус добавлен" });
    setShowStatusForm(null);
    setStatusForm({ status: "new", label: "", comment: "", notify: true });
    loadCases();
  };

  // Create payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaySaving(true);
    try {
      await cpApi.adminPaymentCreate({
        client_id: Number(payForm.client_id),
        amount: Number(payForm.amount),
        basis: payForm.basis,
        case_id: payForm.case_id ? Number(payForm.case_id) : undefined,
        due_date: payForm.due_date || undefined,
        notes: payForm.notes,
        notify: payForm.notify,
      });
      toast({ title: "Счёт выставлен" });
      setShowPayForm(false);
      setPayForm({ client_id: "", case_id: "", amount: "", basis: "", due_date: "", notes: "", notify: true });
      loadPayments();
    } catch { toast({ title: "Ошибка", variant: "destructive" }); }
    finally { setPaySaving(false); }
  };

  const handlePayStatus = async (id: number, status: string) => {
    await cpApi.adminPaymentUpdate({ id, status, payment_date: status === "paid" ? new Date().toISOString().split("T")[0] : undefined });
    loadPayments();
  };

  // Send doc
  const handleSendDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSendDoc) return;
    const r = await cpApi.adminSendDoc({ client_id: showSendDoc, ...sendDocForm });
    toast({ title: r.ok ? `Отправлено на ${r.sent_to}` : "Ошибка отправки" });
    setShowSendDoc(null);
    setSendDocForm({ doc_title: "", doc_content: "", file_url: "" });
  };

  // Docs modal
  const openDocsModal = async (clientId: number) => {
    setShowDocsModal(clientId);
    const r = await cpApi.adminDocuments(clientId);
    setClientDocs(r.documents as typeof clientDocs);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDocsModal) return;
    await cpApi.adminDocumentSave({ ...docForm, client_id: showDocsModal });
    toast({ title: docForm.id ? "Документ обновлён" : "Документ добавлен" });
    setShowDocForm(false);
    setDocForm({ id: undefined, doc_type: "contract", title: "", content: "", file_url: "", file_name: "", sort_order: 1 });
    openDocsModal(showDocsModal);
  };

  // Template save
  const handleSaveTpl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTpl) return;
    await cpApi.adminTemplateUpdate({ id: editTpl.id, name: editTpl.name, subject: editTpl.subject, body_html: editTpl.body_html });
    toast({ title: "Шаблон сохранён" });
    setEditTpl(null);
    loadTemplates();
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "clients", label: "Клиенты", icon: "Users" },
    { key: "cases", label: "Дела", icon: "Scale" },
    { key: "payments", label: "Оплаты", icon: "CreditCard" },
    { key: "requests", label: "Заявления", icon: "Inbox" },
    { key: "templates", label: "Email-шаблоны", icon: "Mail" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-black">Клиентский портал</h2>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 bg-black/5 rounded-2xl p-1 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
              tab === t.key ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"
            }`}>
            <Icon name={t.icon} size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ КЛИЕНТЫ ═══ */}
      {tab === "clients" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск клиентов..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-black/10 text-sm bg-white focus:outline-none" />
            </div>
            <button onClick={() => setShowClientForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">
              <Icon name="UserPlus" size={15} /> Добавить клиента
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            {clients.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-black/30">
                <Icon name="Users" size={32} className="mb-2 opacity-40" />
                <p className="text-sm">Клиентов пока нет</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {clients.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-black/2">
                    <div className="w-8 h-8 rounded-full bg-[#1a0a6e]/10 flex items-center justify-center text-[12px] font-black text-[#1a0a6e] shrink-0">
                      {c.full_name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-black truncate">{c.full_name}</div>
                      <div className="text-[11px] text-black/40">{c.email} {c.phone ? `· ${c.phone}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setShowDocsModal(null); openDocsModal(c.id); }}
                        title="Документы" className="p-1.5 rounded-lg hover:bg-black/5 text-black/40 hover:text-[#1a0a6e]">
                        <Icon name="FileText" size={14} />
                      </button>
                      <button onClick={() => { setShowSendDoc(c.id); }}
                        title="Отправить документ" className="p-1.5 rounded-lg hover:bg-black/5 text-black/40 hover:text-[#1a0a6e]">
                        <Icon name="Send" size={14} />
                      </button>
                      <button onClick={() => handleResetPassword(c.id)}
                        title="Сбросить пароль" className="p-1.5 rounded-lg hover:bg-black/5 text-black/40 hover:text-yellow-600">
                        <Icon name="KeyRound" size={14} />
                      </button>
                      <button onClick={() => handleClientToggle(c.id, "yes")}
                        title="Блокировать" className="p-1.5 rounded-lg hover:bg-black/5 text-black/40 hover:text-red-500">
                        <Icon name="Ban" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ДЕЛА ═══ */}
      {tab === "cases" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCaseForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">
              <Icon name="Plus" size={15} /> Создать дело
            </button>
          </div>
          <div className="space-y-3">
            {cases.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-black/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-mono text-black/35">{c.case_number || `#${c.id}`}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CASE_STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>
                        {c.status_label}
                      </span>
                    </div>
                    <div className="font-bold text-black text-[14px]">{c.title}</div>
                    <div className="text-[12px] text-black/40 mt-0.5">{c.client_name} · {c.client_email}</div>
                    {c.amount != null && <div className="text-[12px] font-bold text-[#1a0a6e] mt-0.5">{formatMoney(c.amount)}</div>}
                  </div>
                  <button onClick={() => { setShowStatusForm(c.id); setStatusForm({ status: c.status, label: "", comment: "", notify: true }); }}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold hover:bg-black/5">
                    + Статус
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ОПЛАТЫ ═══ */}
      {tab === "payments" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowPayForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">
              <Icon name="Plus" size={15} /> Выставить счёт
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <div className="divide-y divide-black/5">
              {payments.map(p => {
                const ps = PAYMENT_STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-black">{formatMoney(p.amount)}</div>
                      <div className="text-[12px] text-black/50">{p.basis}</div>
                      <div className="text-[11px] text-black/35">{p.client_name} {p.due_date ? `· до ${formatDate(p.due_date)}` : ""}</div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ps.cls}`}>{ps.label}</span>
                    {p.status === "pending" && (
                      <button onClick={() => handlePayStatus(p.id, "paid")}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[12px] font-semibold hover:bg-green-200">
                        Оплачено
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ЗАЯВЛЕНИЯ ═══ */}
      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length === 0 && <p className="text-black/40 text-sm py-8 text-center">Заявлений нет</p>}
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-black/8 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black text-[14px]">{r.request_type_label}</div>
                  <div className="text-[12px] text-black/40">{r.client_name} · {r.client_email}</div>
                  {r.comment && <div className="text-[12px] text-black/60 mt-1 italic">«{r.comment}»</div>}
                  {r.admin_comment && <div className="text-[12px] text-[#1a0a6e] mt-1">Ответ: {r.admin_comment}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.status === "new" && (
                    <>
                      <button onClick={() => cpApi.adminRequestUpdate({ id: r.id, status: "in_progress" }).then(loadRequests)}
                        className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 text-[12px] font-semibold hover:bg-yellow-200">В работу</button>
                      <button onClick={() => cpApi.adminRequestUpdate({ id: r.id, status: "done" }).then(loadRequests)}
                        className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[12px] font-semibold hover:bg-green-200">Готово</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ EMAIL-ШАБЛОНЫ ═══ */}
      {tab === "templates" && (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-black text-[14px]">{t.name}</div>
                <div className="text-[12px] text-black/40">{t.subject}</div>
                {t.variables && <div className="text-[11px] text-black/30 mt-0.5">Переменные: {t.variables}</div>}
              </div>
              <button onClick={() => setEditTpl(t)}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-black/10 text-[12px] font-semibold hover:bg-black/5">
                Редактировать
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══ МОДАЛКИ ══ */}

      {/* Создание клиента */}
      {showClientForm && (
        <Modal title="Новый клиент" onClose={() => setShowClientForm(false)}>
          <form onSubmit={handleCreateClient} className="space-y-3">
            {[
              { k: "full_name", l: "ФИО *", p: "Иванов Иван Иванович" },
              { k: "email", l: "Email *", p: "client@email.ru" },
              { k: "phone", l: "Телефон", p: "+7 (000) 000-00-00" },
              { k: "passport", l: "Паспорт", p: "1234 567890" },
              { k: "inn", l: "ИНН", p: "123456789012" },
              { k: "address", l: "Адрес", p: "г. Москва..." },
            ].map(f => (
              <FormField key={f.k} label={f.l} placeholder={f.p} required={f.k === "full_name" || f.k === "email"}
                value={clientForm[f.k as keyof typeof clientForm]}
                onChange={v => setClientForm(prev => ({ ...prev, [f.k]: v }))} />
            ))}
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Заметки</label>
              <textarea value={clientForm.notes} onChange={e => setClientForm(p => ({ ...p, notes: e.target.value }))}
                rows={2} className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none" />
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-[12px] text-blue-700">
              <Icon name="Info" size={12} className="inline mr-1" />
              Клиенту автоматически отправится письмо с логином и паролем
            </div>
            <ModalButtons onClose={() => setShowClientForm(false)} loading={clientSaving} label="Создать клиента" />
          </form>
        </Modal>
      )}

      {/* Создание дела */}
      {showCaseForm && (
        <Modal title="Новое дело" onClose={() => setShowCaseForm(false)}>
          <form onSubmit={handleCreateCase} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Клиент *</label>
              <select value={caseForm.client_id} onChange={e => setCaseForm(p => ({ ...p, client_id: e.target.value }))} required
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none">
                <option value="">Выберите клиента</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
              </select>
            </div>
            {[
              { k: "case_number", l: "Номер дела", p: "А40-12345/2024" },
              { k: "title", l: "Название *", p: "Взыскание задолженности" },
              { k: "plaintiff", l: "Истец", p: "" },
              { k: "defendant", l: "Ответчик", p: "" },
              { k: "amount", l: "Сумма иска", p: "150000" },
              { k: "court", l: "Суд", p: "Арбитражный суд г. Москвы" },
              { k: "docs_link", l: "Ссылка на документы", p: "https://..." },
            ].map(f => (
              <FormField key={f.k} label={f.l} placeholder={f.p} required={f.k === "title"}
                value={caseForm[f.k as keyof typeof caseForm] as string}
                onChange={v => setCaseForm(prev => ({ ...prev, [f.k]: v }))} />
            ))}
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Описание</label>
              <textarea value={caseForm.description} onChange={e => setCaseForm(p => ({ ...p, description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none" />
            </div>
            <ModalButtons onClose={() => setShowCaseForm(false)} loading={caseSaving} label="Создать дело" />
          </form>
        </Modal>
      )}

      {/* Добавление статуса дела */}
      {showStatusForm && (
        <Modal title="Добавить статус" onClose={() => setShowStatusForm(null)}>
          <form onSubmit={handleAddStatus} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Статус</label>
              <select value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value, label: CASE_STATUSES.find(s => s.v === e.target.value)?.l || "" }))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none">
                {CASE_STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
            <FormField label="Своя подпись (необязательно)" placeholder="Например: Первое заседание 15.01.2025"
              value={statusForm.label} onChange={v => setStatusForm(p => ({ ...p, label: v }))} />
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Комментарий</label>
              <textarea value={statusForm.comment} onChange={e => setStatusForm(p => ({ ...p, comment: e.target.value }))}
                rows={2} className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none" />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-black/60 cursor-pointer">
              <input type="checkbox" checked={statusForm.notify} onChange={e => setStatusForm(p => ({ ...p, notify: e.target.checked }))} />
              Уведомить клиента по email
            </label>
            <ModalButtons onClose={() => setShowStatusForm(null)} label="Добавить" />
          </form>
        </Modal>
      )}

      {/* Выставить счёт */}
      {showPayForm && (
        <Modal title="Выставить счёт" onClose={() => setShowPayForm(false)}>
          <form onSubmit={handleCreatePayment} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Клиент *</label>
              <select value={payForm.client_id} onChange={e => setPayForm(p => ({ ...p, client_id: e.target.value }))} required
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none">
                <option value="">Выберите клиента</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            {payForm.client_id && (
              <div>
                <label className="text-[11px] font-semibold text-black/40 mb-1 block">Дело</label>
                <select value={payForm.case_id} onChange={e => setPayForm(p => ({ ...p, case_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none">
                  <option value="">— Без дела —</option>
                  {cases.filter(c => c.client_email === clients.find(cl => cl.id === Number(payForm.client_id))?.email).map(c =>
                    <option key={c.id} value={c.id}>{c.case_number || c.title}</option>
                  )}
                </select>
              </div>
            )}
            <FormField label="Сумма *" placeholder="50000" required
              value={payForm.amount} onChange={v => setPayForm(p => ({ ...p, amount: v }))} type="number" />
            <FormField label="Основание *" placeholder="Юридические услуги по делу №..." required
              value={payForm.basis} onChange={v => setPayForm(p => ({ ...p, basis: v }))} />
            <FormField label="Срок оплаты" placeholder=""
              value={payForm.due_date} onChange={v => setPayForm(p => ({ ...p, due_date: v }))} type="date" />
            <label className="flex items-center gap-2 text-[13px] text-black/60 cursor-pointer">
              <input type="checkbox" checked={payForm.notify} onChange={e => setPayForm(p => ({ ...p, notify: e.target.checked }))} />
              Уведомить клиента по email
            </label>
            <ModalButtons onClose={() => setShowPayForm(false)} loading={paySaving} label="Выставить счёт" />
          </form>
        </Modal>
      )}

      {/* Отправить документ на почту */}
      {showSendDoc && (
        <Modal title="Отправить документ на email" onClose={() => setShowSendDoc(null)}>
          <form onSubmit={handleSendDoc} className="space-y-3">
            <FormField label="Название документа *" placeholder="Копия договора" required
              value={sendDocForm.doc_title} onChange={v => setSendDocForm(p => ({ ...p, doc_title: v }))} />
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Текст</label>
              <textarea value={sendDocForm.doc_content} onChange={e => setSendDocForm(p => ({ ...p, doc_content: e.target.value }))}
                rows={4} className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none" />
            </div>
            <FormField label="Ссылка на файл" placeholder="https://..."
              value={sendDocForm.file_url} onChange={v => setSendDocForm(p => ({ ...p, file_url: v }))} />
            <ModalButtons onClose={() => setShowSendDoc(null)} label="Отправить" />
          </form>
        </Modal>
      )}

      {/* Документы клиента */}
      {showDocsModal && (
        <Modal title="Документы клиента" onClose={() => { setShowDocsModal(null); setShowDocForm(false); }} wide>
          <div className="space-y-2 mb-4">
            {clientDocs.map(d => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/8">
                <Icon name="FileText" size={16} className="text-[#1a0a6e] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-black truncate">{d.title}</div>
                  <div className="text-[11px] text-black/40">{d.doc_type}</div>
                </div>
                <button onClick={() => { setDocForm({ id: d.id, doc_type: d.doc_type, title: d.title, content: d.content, file_url: d.file_url, file_name: "", sort_order: d.sort_order }); setShowDocForm(true); }}
                  className="p-1.5 rounded-lg hover:bg-black/5 text-black/40">
                  <Icon name="Pencil" size={13} />
                </button>
              </div>
            ))}
          </div>

          {!showDocForm ? (
            <button onClick={() => { setDocForm({ id: undefined, doc_type: "contract", title: "", content: "", file_url: "", file_name: "", sort_order: 1 }); setShowDocForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">
              <Icon name="Plus" size={14} /> Добавить документ
            </button>
          ) : (
            <form onSubmit={handleSaveDoc} className="space-y-3 border-t border-black/8 pt-4 mt-2">
              <div className="text-[13px] font-bold text-black mb-2">{docForm.id ? "Редактировать" : "Новый документ"}</div>
              <div>
                <label className="text-[11px] font-semibold text-black/40 mb-1 block">Тип</label>
                <select value={docForm.doc_type} onChange={e => setDocForm(p => ({ ...p, doc_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none">
                  {[["contract","Договор"],["addendum","Допсоглашение"],["act","Акт"],["invoice","Счёт"],["other","Прочее"]].map(([v,l]) =>
                    <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <FormField label="Название *" placeholder="Договор на оказание услуг" required
                value={docForm.title} onChange={v => setDocForm(p => ({ ...p, title: v }))} />
              <div>
                <label className="text-[11px] font-semibold text-black/40 mb-1 block">Текст документа (онлайн)</label>
                <textarea value={docForm.content} onChange={e => setDocForm(p => ({ ...p, content: e.target.value }))}
                  rows={6} placeholder="Введите полный текст договора..." className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none" />
              </div>
              <FormField label="Ссылка на файл" placeholder="https://..."
                value={docForm.file_url} onChange={v => setDocForm(p => ({ ...p, file_url: v }))} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowDocForm(false)}
                  className="flex-1 py-2 rounded-xl border border-black/10 text-sm font-semibold text-black/60">Отмена</button>
                <button type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold">Сохранить</button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Редактор шаблона */}
      {editTpl && (
        <Modal title={`Шаблон: ${editTpl.name}`} onClose={() => setEditTpl(null)} wide>
          <form onSubmit={handleSaveTpl} className="space-y-3">
            <FormField label="Тема письма" value={editTpl.subject} onChange={v => setEditTpl(p => p ? { ...p, subject: v } : p)} />
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">HTML-тело письма</label>
              <div className="text-[10px] text-black/30 mb-1">Переменные: {editTpl.variables?.split(",").map(v => `{{${v.trim()}}}`).join(", ")}</div>
              <textarea value={editTpl.body_html} onChange={e => setEditTpl(p => p ? { ...p, body_html: e.target.value } : p)}
                rows={12} className="w-full px-3 py-2 rounded-xl border border-black/10 text-[12px] font-mono bg-[#f5f5f7] focus:outline-none resize-none" />
            </div>
            <ModalButtons onClose={() => setEditTpl(null)} label="Сохранить шаблон" />
          </form>
        </Modal>
      )}
    </div>
  );
}

// Вспомогательные компоненты
function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl w-full ${wide ? "max-w-xl" : "max-w-md"} p-6 my-4`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-black text-[16px]">{title}</h3>
          <button onClick={onClose} className="text-black/30 hover:text-black p-1">
            <Icon name="X" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, placeholder = "", value, onChange, required, type = "text" }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-black/40 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none focus:border-[#1a0a6e]/40" />
    </div>
  );
}

function ModalButtons({ onClose, loading, label }: { onClose: () => void; loading?: boolean; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose}
        className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60 hover:bg-black/5">
        Отмена
      </button>
      <button type="submit" disabled={loading}
        className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold disabled:opacity-50">
        {loading ? "..." : label}
      </button>
    </div>
  );
}
