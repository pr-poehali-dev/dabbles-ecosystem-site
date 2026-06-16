import { request } from "@/lib/api";

export type DocStatus = "draft" | "pending" | "review" | "approved" | "rejected" | "archive";
export type DocType = "incoming" | "outgoing" | "internal" | "order" | "contract" | "act";

export interface EdoDoc {
  id: number;
  title: string;
  doc_number: string;
  doc_type: DocType;
  doc_type_label: string;
  status: DocStatus;
  status_label: string;
  content: string;
  file_url: string;
  file_name: string;
  file_size: number;
  from_org: string;
  to_org: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  notes: string;
  doc_status: string;
  author: { id: number; full_name: string; email: string; avatar_url: string };
  assignee: { id: number; full_name: string; email: string; avatar_url: string } | null;
}

export interface EdoRoute {
  id: number;
  step_order: number;
  status: string;
  status_label: string;
  comment: string;
  acted_at: string | null;
  created_at: string;
  approver: { id: number; full_name: string; email: string; avatar_url: string; position: string };
}

export interface EdoHistory {
  id: number;
  action: string;
  old_status: string;
  new_status: string;
  comment: string;
  created_at: string;
  user: { full_name: string; email: string; avatar_url: string };
}

export interface EdoUser {
  id: number;
  full_name: string;
  email: string;
  position: string;
  role: string;
  avatar_url: string;
}

export interface EdoOrg {
  id: number;
  name: string;
  inn: string;
  email: string;
  phone: string;
}

const FN = "edo" as const;

export const edoApi = {
  list: (params: Record<string, string | number> = {}) =>
    request<{ docs: EdoDoc[]; total: number }>(FN, { query: { action: "list", ...params } }),

  get: (id: number) =>
    request<{ doc: EdoDoc; routes: EdoRoute[]; history: EdoHistory[] }>(FN, { query: { action: "get", id } }),

  create: (data: Partial<EdoDoc>) =>
    request<{ id: number; doc_number: string }>(FN, { method: "POST", query: { action: "create" }, body: data }),

  update: (data: Partial<EdoDoc> & { id: number }) =>
    request<{ ok: boolean }>(FN, { method: "POST", query: { action: "update" }, body: data }),

  setStatus: (id: number, status: DocStatus, comment = "") =>
    request<{ ok: boolean }>(FN, { method: "POST", query: { action: "status" }, body: { id, status, comment } }),

  delete: (id: number) =>
    request<{ ok: boolean }>(FN, { method: "POST", query: { action: "delete" }, body: { id } }),

  restore: (id: number) =>
    request<{ ok: boolean }>(FN, { method: "POST", query: { action: "restore" }, body: { id } }),

  upload: (doc_id: number, file: File) =>
    new Promise<{ file_url: string; file_name: string; file_size: number }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const b64 = (reader.result as string).split(",")[1];
        try {
          const res = await request<{ file_url: string; file_name: string; file_size: number }>(
            FN, { method: "POST", query: { action: "upload" }, body: { doc_id, file: b64, file_name: file.name } }
          );
          resolve(res);
        } catch (e) { reject(e); }
      };
      reader.readAsDataURL(file);
    }),

  routeAdd: (doc_id: number, approver_id: number) =>
    request<{ ok: boolean }>(FN, { method: "POST", query: { action: "route-add" }, body: { doc_id, approver_id } }),

  routeAct: (route_id: number, status: "approved" | "rejected", comment = "") =>
    request<{ ok: boolean }>(FN, { method: "POST", query: { action: "route-act" }, body: { route_id, status, comment } }),

  users: () =>
    request<{ users: EdoUser[] }>(FN, { query: { action: "users" } }),

  orgs: () =>
    request<{ orgs: EdoOrg[] }>(FN, { query: { action: "orgs" } }),

  orgCreate: (data: Partial<EdoOrg>) =>
    request<{ id: number }>(FN, { method: "POST", query: { action: "org-create" }, body: data }),

  stats: () =>
    request<{ by_status: Record<string, number>; by_type: Record<string, number>; deleted: number }>(FN, { query: { action: "stats" } }),

  trash: () =>
    request<{ docs: EdoDoc[] }>(FN, { query: { action: "trash" } }),
};

export const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  archive: "bg-purple-100 text-purple-700",
};

export const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  pending: "На рассмотрении",
  review: "На согласовании",
  approved: "Утверждён",
  rejected: "Отклонён",
  archive: "В архиве",
};

export const TYPE_LABEL: Record<string, string> = {
  incoming: "Входящий",
  outgoing: "Исходящий",
  internal: "Внутренний",
  order: "Приказ",
  contract: "Договор",
  act: "Акт",
};

export function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
  return (bytes / 1024 / 1024).toFixed(1) + " МБ";
}

export function formatDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}
