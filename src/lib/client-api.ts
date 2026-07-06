const FN_URL_KEY = "client-portal";
import urls from "../../backend/func2url.json";

const TOKEN_KEY = "cp_token";
const ADMIN_TOKEN_KEY = "dabbl_token";

export const getCpToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setCpToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearCpToken = () => localStorage.removeItem(TOKEN_KEY);
const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

const BASE = (urls as Record<string, string>)[FN_URL_KEY];

async function cpRequest<T>(action: string, options: {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number>;
  useAdminToken?: boolean;
} = {}): Promise<T> {
  const { method = "GET", body, query = {}, useAdminToken = false } = options;
  const params = new URLSearchParams({ action, ...Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])) });
  const url = `${BASE}?${params}`;
  const token = useAdminToken ? getAdminToken() : getCpToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Auth-Token": token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка запроса");
  return data as T;
}

export interface CpClient {
  id: number; email: string; full_name: string;
  phone: string; address: string; passport: string; inn: string;
}

export interface CpCase {
  id: number; case_number: string; title: string;
  plaintiff: string; defendant: string; amount: number | null;
  court: string; description?: string; status: string; status_label: string;
  docs_link: string; created_at: string;
  statuses: { status: string; label: string; comment: string; happened_at: string }[];
}

export interface CpPayment {
  id: number; amount: number; basis: string; status: string;
  payment_date: string | null; due_date: string | null;
  notes: string; created_at: string;
  case_number: string | null; case_title: string | null;
  card_number: string; payment_type: string;
}

export interface CpDocument {
  id: number; doc_type: string; title: string;
  content: string; file_url: string; file_name: string;
  case_id: number | null; sort_order: number; created_at: string;
}

export interface CpRequest {
  id: number; request_type: string; request_type_label: string;
  status: string; comment: string; admin_comment: string;
  created_at: string; case_number: string | null;
}

export const cpApi = {
  login: (email: string, password: string) =>
    cpRequest<{ token: string; client: CpClient }>("login", { method: "POST", body: { email, password } }),

  logout: () => cpRequest<{ ok: boolean }>("logout", { method: "POST" }),

  me: () => cpRequest<{ client: CpClient }>("me"),

  myAccount: () => cpRequest<{ account: {
    id: number; account_number: string; balance: number; currency: string;
    card_number: string; expiry_month: number; expiry_year: number; card_holder: string;
  } }>("my-account"),

  topupRequest: (amount: number) =>
    cpRequest<{ id: number }>("client-topup-request", { method: "POST", body: { amount } }),

  cases: () => cpRequest<{ cases: CpCase[] }>("cases"),

  case: (id: number) => cpRequest<{ case: CpCase }>("case", { query: { id } }),

  payments: () => cpRequest<{ payments: CpPayment[] }>("payments"),

  documents: () => cpRequest<{ documents: CpDocument[] }>("documents"),

  submitRequest: (data: { request_type: string; case_id?: number; comment?: string }) =>
    cpRequest<{ id: number; message: string }>("submit-request", { method: "POST", body: data }),

  myRequests: () => cpRequest<{ requests: CpRequest[] }>("my-requests"),

  // Admin (используют токен Даббл-авторизации)
  adminStats: () =>
    cpRequest<{ clients_count: number; cases_count: number; new_requests: number; total_paid: number; total_pending: number }>("admin-stats", { useAdminToken: true }),

  adminClients: (search = "") =>
    cpRequest<{ clients: (CpClient & { created_at: string })[] }>("admin-clients", { query: search ? { search } : {}, useAdminToken: true }),

  adminClientGet: (id: number) =>
    cpRequest<{ client: CpClient & { notes: string; is_active: string; created_at: string; balance: number } }>("admin-client-get", { query: { id }, useAdminToken: true }),

  adminClientCreate: (data: Partial<CpClient> & { notes?: string }) =>
    cpRequest<{ id: number; password: string }>("admin-client-create", { method: "POST", body: data, useAdminToken: true }),

  adminClientUpdate: (data: Partial<CpClient> & { id: number; notes?: string; is_active?: string }) =>
    cpRequest<{ ok: boolean }>("admin-client-update", { method: "POST", body: data, useAdminToken: true }),

  adminClientResetPassword: (id: number) =>
    cpRequest<{ ok: boolean; password: string }>("admin-client-reset-password", { method: "POST", body: { id }, useAdminToken: true }),

  adminClientSendCredentials: (id: number) =>
    cpRequest<{ ok: boolean; result: unknown; sent_to: string; password: string }>("admin-client-send-credentials", { method: "POST", body: { id }, useAdminToken: true }),

  adminLoginAsClient: (id: number) =>
    cpRequest<{ token: string }>("admin-login-as-client", { method: "POST", body: { id }, useAdminToken: true }),

  adminSendEmail: (data: { client_id: number; subject: string; message: string }) =>
    cpRequest<{ ok: boolean; sent_to: string }>("admin-send-email", { method: "POST", body: data, useAdminToken: true }),

  adminPaymentReminders: () =>
    cpRequest<{ sent: { payment_id: number; email: string }[]; errors: { payment_id: number; email: string; error: string }[]; total: number }>("admin-payment-reminders", { method: "POST", body: {}, useAdminToken: true }),

  adminCases: (client_id?: number) =>
    cpRequest<{ cases: (CpCase & { client_name: string; client_email: string })[] }>("admin-cases", { query: client_id ? { client_id } : {}, useAdminToken: true }),

  adminCaseCreate: (data: Partial<CpCase> & { client_id: number }) =>
    cpRequest<{ id: number }>("admin-case-create", { method: "POST", body: data, useAdminToken: true }),

  adminCaseUpdate: (data: Partial<CpCase> & { id: number }) =>
    cpRequest<{ ok: boolean }>("admin-case-update", { method: "POST", body: data, useAdminToken: true }),

  adminCaseAddStatus: (data: { case_id: number; status: string; label: string; comment?: string; notify?: boolean }) =>
    cpRequest<{ ok: boolean }>("admin-case-add-status", { method: "POST", body: data, useAdminToken: true }),

  adminPayments: (client_id?: number) =>
    cpRequest<{ payments: (CpPayment & { client_name: string })[] }>("admin-payments", { query: client_id ? { client_id } : {}, useAdminToken: true }),

  adminPaymentCreate: (data: { client_id: number; amount: number; basis: string; case_id?: number; due_date?: string; notes?: string; notify?: boolean }) =>
    cpRequest<{ id: number }>("admin-payment-create", { method: "POST", body: data, useAdminToken: true }),

  adminPaymentUpdate: (data: { id: number; status?: string; payment_date?: string; amount?: number; basis?: string }) =>
    cpRequest<{ ok: boolean }>("admin-payment-update", { method: "POST", body: data, useAdminToken: true }),

  adminPaymentDelete: (id: number) =>
    cpRequest<{ ok: boolean }>("admin-payment-delete", { method: "POST", body: { id }, useAdminToken: true }),

  adminBalanceCharge: (data: { client_id: number; amount: number; basis: string; case_id?: number }) =>
    cpRequest<{ id: number; balance: number }>("admin-balance-charge", { method: "POST", body: data, useAdminToken: true }),

  adminDocuments: (client_id: number) =>
    cpRequest<{ documents: CpDocument[] }>("admin-documents", { query: { client_id }, useAdminToken: true }),

  adminDocumentSave: (data: Partial<CpDocument> & { client_id?: number }) =>
    cpRequest<{ id?: number; ok?: boolean }>("admin-document-save", { method: "POST", body: data, useAdminToken: true }),

  adminRequests: (params: { client_id?: number; status?: string } = {}) =>
    cpRequest<{ requests: (CpRequest & { client_name: string; client_email: string })[] }>("admin-requests", { query: params as Record<string, string | number>, useAdminToken: true }),

  adminRequestUpdate: (data: { id: number; status?: string; admin_comment?: string }) =>
    cpRequest<{ ok: boolean }>("admin-request-update", { method: "POST", body: data, useAdminToken: true }),

  adminSendDoc: (data: { client_id: number; doc_title: string; doc_content?: string; file_url?: string }) =>
    cpRequest<{ ok: boolean; sent_to: string }>("admin-send-doc", { method: "POST", body: data, useAdminToken: true }),

  adminTemplates: () =>
    cpRequest<{ templates: { id: number; code: string; name: string; subject: string; body_html: string; variables: string }[] }>("admin-templates", { useAdminToken: true }),

  adminTemplateUpdate: (data: { id: number; name?: string; subject?: string; body_html?: string }) =>
    cpRequest<{ ok: boolean }>("admin-template-update", { method: "POST", body: data, useAdminToken: true }),

  adminTestEmail: (to?: string) =>
    cpRequest<{ ok: boolean; result: unknown; smtp_host: string; smtp_port: string; smtp_user: string; smtp_password_set: boolean; sent_to: string }>(
      "test-email", { method: "POST", body: to ? { to } : {}, useAdminToken: true }
    ),
};

export const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидает оплаты", cls: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Оплачено", cls: "bg-green-100 text-green-700" },
  overdue: { label: "Просрочено", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Отменено", cls: "bg-gray-100 text-gray-500" },
};

export const CASE_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  documents_prep: "bg-indigo-100 text-indigo-700",
  filed: "bg-purple-100 text-purple-700",
  hearing: "bg-yellow-100 text-yellow-700",
  decision: "bg-orange-100 text-orange-700",
  enforcement: "bg-pink-100 text-pink-700",
  completed: "bg-green-100 text-green-700",
  suspended: "bg-gray-100 text-gray-500",
};

export const REQUEST_STATUSES: Record<string, { label: string; cls: string }> = {
  new: { label: "Новое", cls: "bg-blue-100 text-blue-700" },
  in_progress: { label: "В работе", cls: "bg-yellow-100 text-yellow-700" },
  done: { label: "Выполнено", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Отклонено", cls: "bg-red-100 text-red-600" },
};

export function formatMoney(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " ₽";
}

export function formatDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}