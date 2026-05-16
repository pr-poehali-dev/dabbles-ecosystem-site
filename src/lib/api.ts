import urls from "../../backend/func2url.json";

const TOKEN_KEY = "dabbl_token";

export const apiUrl = (key: keyof typeof urls) => (urls as Record<string, string>)[key];

export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function request<T = unknown>(
  fn: keyof typeof urls,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    query?: Record<string, string | number | boolean>;
    body?: unknown;
    auth?: boolean;
  } = {},
): Promise<T> {
  const base = apiUrl(fn);
  const params = options.query
    ? "?" + new URLSearchParams(Object.entries(options.query).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) {
    const t = getToken();
    if (t) headers["X-Auth-Token"] = t;
  }
  const res = await fetch(base + params, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Ошибка ${res.status}`);
  }
  return data as T;
}

export type User = {
  id: number;
  email: string;
  full_name: string;
  position: string;
  role: "admin" | "employee";
  must_change_password: boolean;
  access_tasks: boolean;
  access_documents: boolean;
  access_crm: boolean;
  is_active: boolean;
};
