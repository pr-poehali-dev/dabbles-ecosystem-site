import { useEffect, useState, useCallback } from "react";
import { cpApi, CpClient, CpCase, CpPayment } from "@/lib/client-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { Modal, FormField, ModalButtons } from "./AdminClientsShared";
import AdminClientsCases from "./AdminClientsCases";
import AdminClientsPayments from "./AdminClientsPayments";
import AdminClientsRequestsTemplates from "./AdminClientsRequestsTemplates";
import ClientCard from "./ClientCard";

type Tab = "clients" | "cases" | "payments" | "requests" | "templates";

export default function AdminClients() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("clients");

  // Clients
  const [clients, setClients] = useState<(CpClient & { created_at: string })[]>([]);
  const [search, setSearch] = useState("");
  const [openCardId, setOpenCardId] = useState<number | null>(null);
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
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
              tab === t.key ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"
            }`}
          >
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
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск клиентов..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-black/10 text-sm bg-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowClientForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"
            >
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
                  <div
                    key={c.id}
                    onClick={() => setOpenCardId(c.id)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a0a6e]/5 cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1a0a6e]/10 flex items-center justify-center text-[12px] font-black text-[#1a0a6e] shrink-0">
                      {c.full_name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-black truncate">{c.full_name}</div>
                      <div className="text-[11px] text-black/40">{c.email} {c.phone ? `· ${c.phone}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1a0a6e] shrink-0 opacity-60 group-hover:opacity-100">
                      Открыть <Icon name="ChevronRight" size={15} />
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
        <AdminClientsCases
          cases={cases}
          clients={clients}
          showCaseForm={showCaseForm}
          setShowCaseForm={setShowCaseForm}
          caseForm={caseForm}
          setCaseForm={setCaseForm}
          caseSaving={caseSaving}
          setCaseSaving={setCaseSaving}
          showStatusForm={showStatusForm}
          setShowStatusForm={setShowStatusForm}
          statusForm={statusForm}
          setStatusForm={setStatusForm}
          loadCases={loadCases}
        />
      )}

      {/* ═══ ОПЛАТЫ ═══ */}
      {tab === "payments" && (
        <AdminClientsPayments
          payments={payments}
          clients={clients}
          cases={cases}
          showPayForm={showPayForm}
          setShowPayForm={setShowPayForm}
          payForm={payForm}
          setPayForm={setPayForm}
          paySaving={paySaving}
          setPaySaving={setPaySaving}
          loadPayments={loadPayments}
        />
      )}

      {/* ═══ ЗАЯВЛЕНИЯ + ШАБЛОНЫ ═══ */}
      {(tab === "requests" || tab === "templates") && (
        <AdminClientsRequestsTemplates
          tab={tab}
          requests={requests}
          loadRequests={loadRequests}
          templates={templates}
          loadTemplates={loadTemplates}
          editTpl={editTpl}
          setEditTpl={setEditTpl}
        />
      )}

      {/* ══ CRM-КАРТОЧКА КЛИЕНТА ══ */}
      {openCardId && (
        <ClientCard
          clientId={openCardId}
          onClose={() => setOpenCardId(null)}
          onChanged={loadClients}
        />
      )}

      {/* ══ МОДАЛКИ КЛИЕНТОВ ══ */}

      {/* Создание клиента */}
      {showClientForm && (
        <Modal title="Новый клиент" onClose={() => setShowClientForm(false)}>
          <form onSubmit={handleCreateClient} className="space-y-3">
            {([
              { k: "full_name", l: "ФИО *", p: "Иванов Иван Иванович", req: true },
              { k: "email", l: "Email *", p: "client@email.ru", req: true },
              { k: "phone", l: "Телефон", p: "+7 (000) 000-00-00" },
              { k: "passport", l: "Паспорт", p: "1234 567890" },
              { k: "inn", l: "ИНН", p: "123456789012" },
              { k: "address", l: "Адрес", p: "г. Москва..." },
            ] as { k: string; l: string; p: string; req?: boolean }[]).map(f => (
              <FormField
                key={f.k}
                label={f.l}
                placeholder={f.p}
                required={f.req}
                value={clientForm[f.k as keyof typeof clientForm]}
                onChange={v => setClientForm(prev => ({ ...prev, [f.k]: v }))}
              />
            ))}
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Заметки</label>
              <textarea
                value={clientForm.notes}
                onChange={e => setClientForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none"
              />
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-[12px] text-blue-700">
              <Icon name="Info" size={12} className="inline mr-1" />
              Клиенту автоматически отправится письмо с логином и паролем
            </div>
            <ModalButtons onClose={() => setShowClientForm(false)} loading={clientSaving} label="Создать клиента" />
          </form>
        </Modal>
      )}

      {/* Отправить документ на почту */}
      {showSendDoc && (
        <Modal title="Отправить документ на email" onClose={() => setShowSendDoc(null)}>
          <form onSubmit={handleSendDoc} className="space-y-3">
            <FormField
              label="Название документа *"
              placeholder="Копия договора"
              required
              value={sendDocForm.doc_title}
              onChange={v => setSendDocForm(p => ({ ...p, doc_title: v }))}
            />
            <div>
              <label className="text-[11px] font-semibold text-black/40 mb-1 block">Текст</label>
              <textarea
                value={sendDocForm.doc_content}
                onChange={e => setSendDocForm(p => ({ ...p, doc_content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none"
              />
            </div>
            <FormField
              label="Ссылка на файл"
              placeholder="https://..."
              value={sendDocForm.file_url}
              onChange={v => setSendDocForm(p => ({ ...p, file_url: v }))}
            />
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
                <button
                  onClick={() => {
                    setDocForm({ id: d.id, doc_type: d.doc_type, title: d.title, content: d.content, file_url: d.file_url, file_name: "", sort_order: d.sort_order });
                    setShowDocForm(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 text-black/40"
                >
                  <Icon name="Pencil" size={13} />
                </button>
              </div>
            ))}
          </div>

          {!showDocForm ? (
            <button
              onClick={() => {
                setDocForm({ id: undefined, doc_type: "contract", title: "", content: "", file_url: "", file_name: "", sort_order: 1 });
                setShowDocForm(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"
            >
              <Icon name="Plus" size={14} /> Добавить документ
            </button>
          ) : (
            <form onSubmit={handleSaveDoc} className="space-y-3 border-t border-black/8 pt-4 mt-2">
              <div className="text-[13px] font-bold text-black mb-2">
                {docForm.id ? "Редактировать" : "Новый документ"}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-black/40 mb-1 block">Тип</label>
                <select
                  value={docForm.doc_type}
                  onChange={e => setDocForm(p => ({ ...p, doc_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none"
                >
                  {([["contract", "Договор"], ["addendum", "Допсоглашение"], ["act", "Акт"], ["invoice", "Счёт"], ["other", "Прочее"]] as [string, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <FormField
                label="Название *"
                placeholder="Договор на оказание услуг"
                required
                value={docForm.title}
                onChange={v => setDocForm(p => ({ ...p, title: v }))}
              />
              <div>
                <label className="text-[11px] font-semibold text-black/40 mb-1 block">Текст документа (онлайн)</label>
                <textarea
                  value={docForm.content}
                  onChange={e => setDocForm(p => ({ ...p, content: e.target.value }))}
                  rows={6}
                  placeholder="Введите полный текст договора..."
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none resize-none"
                />
              </div>
              <FormField
                label="Ссылка на файл"
                placeholder="https://..."
                value={docForm.file_url}
                onChange={v => setDocForm(p => ({ ...p, file_url: v }))}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocForm(false)}
                  className="flex-1 py-2 rounded-xl border border-black/10 text-sm font-semibold text-black/60"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold"
                >
                  Сохранить
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}