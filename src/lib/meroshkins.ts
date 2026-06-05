import { request } from "@/lib/api";

export type EventType = "conference" | "training" | "exhibition" | "workshop" | "corporate" | "other";
export type EventStatus = "planned" | "ongoing" | "done" | "cancelled";

export interface MEvent {
  id: number;
  title: string;
  event_type: EventType;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  room_id: number | null;
  room_name?: string;
  venue_name?: string;
  responsible: string;
  description: string;
  info_reason: string;
  press_release?: string;
  color: string;
}

export interface MRoom {
  id: number;
  name: string;
  capacity: number;
  features: string;
  is_active: boolean;
  venue_id: number;
  venue_name: string;
}

export interface MVenue {
  id: number;
  name: string;
  address: string;
  description: string;
  is_active: boolean;
}

export const EVENT_TYPES: Record<EventType, { label: string; color: string }> = {
  conference: { label: "Конференция", color: "#0077FF" },
  training:   { label: "Тренинг",     color: "#10b981" },
  exhibition: { label: "Выставка",    color: "#f59e0b" },
  workshop:   { label: "Мастер-класс",color: "#7c3aed" },
  corporate:  { label: "Корпоратив",  color: "#FD4160" },
  other:      { label: "Другое",      color: "#6b7280" },
};

export const EVENT_STATUSES: Record<EventStatus, { label: string }> = {
  planned:   { label: "Запланировано" },
  ongoing:   { label: "Идёт сейчас"  },
  done:      { label: "Завершено"     },
  cancelled: { label: "Отменено"     },
};

const q = (action: string, params?: Record<string, string | number | undefined>) =>
  ({ action, ...params } as Record<string, string | number | undefined>);

export const mApi = {
  events: (year: number, month: number, filters?: Record<string, string>) =>
    request<{ events: MEvent[] }>("meroshkins", { query: { action: "events", year, month, ...filters } }),

  createEvent: (data: Partial<MEvent>) =>
    request<{ id: number }>("meroshkins", { method: "POST", query: { action: "events" }, body: data }),

  updateEvent: (data: Partial<MEvent> & { id: number }) =>
    request<{ ok: boolean }>("meroshkins", { method: "PUT", query: { action: "events" }, body: data }),

  deleteEvent: (id: number) =>
    request<{ ok: boolean }>("meroshkins", { method: "PUT", query: { action: "event-delete" }, body: { id } }),

  rooms: (venue_id?: number) =>
    request<{ rooms: MRoom[] }>("meroshkins", { query: q("rooms", venue_id ? { venue_id } : {}) }),

  createRoom: (data: Partial<MRoom>) =>
    request<{ id: number }>("meroshkins", { method: "POST", query: { action: "rooms" }, body: data }),

  updateRoom: (data: Partial<MRoom> & { id: number }) =>
    request<{ ok: boolean }>("meroshkins", { method: "PUT", query: { action: "rooms" }, body: data }),

  venues: () =>
    request<{ venues: MVenue[] }>("meroshkins", { query: { action: "venues" } }),

  createVenue: (data: Partial<MVenue>) =>
    request<{ id: number }>("meroshkins", { method: "POST", query: { action: "venues" }, body: data }),

  updateVenue: (data: Partial<MVenue> & { id: number }) =>
    request<{ ok: boolean }>("meroshkins", { method: "PUT", query: { action: "venues" }, body: data }),

  shareCreate: (role: "viewer" | "editor", date_from?: string, date_to?: string) =>
    request<{ token: string; role: string }>("meroshkins", { method: "POST", query: { action: "share-create" }, body: { role, date_from, date_to } }),

  shareDelete: (token: string) =>
    request<{ ok: boolean }>("meroshkins", { method: "POST", query: { action: "share-delete" }, body: { token } }),

  shareList: () =>
    request<{ shares: { token: string; role: string; date_from: string | null; date_to: string | null; created_at: string }[] }>("meroshkins", { query: { action: "share-list" } }),

  shareJoin: (token: string) =>
    request<{ ok: boolean; owner_id?: number; already?: boolean; already_owner?: boolean }>("meroshkins", { method: "POST", query: { action: "share-join", token } }),

  collaborators: () =>
    request<{ collaborators: { id: number; invite_email: string; role: string; status: string; created_at: string; full_name: string | null; email: string | null }[] }>("meroshkins", { query: { action: "collaborators" } }),

  inviteCollaborator: (email: string, role: string) =>
    request<{ id: number; token: string; auto_accepted: boolean }>("meroshkins", { method: "POST", query: { action: "collaborators" }, body: { email, role } }),

  acceptInvite: (token: string) =>
    request<{ ok: boolean }>("meroshkins", { method: "PUT", query: { action: "collaborators" }, body: { token } }),

  revokeCollaborator: (id: number) =>
    request<{ ok: boolean }>("meroshkins", { method: "PUT", query: { action: "collaborator-revoke" }, body: { id } }),

  inviteInfo: (token: string) =>
    request<{ invite_id: number; owner_id: number; invite_email: string; status: string; token: string }>("meroshkins", { query: { action: "invite-accept", token }, auth: false }),
};

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekday(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}