import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { request, getToken, setToken as saveToken, clearToken, User } from "./api";

export type LoginResult =
  | { ok: true; user: User }
  | { tfa: true; user_id: number; email_hint: string; dev_code?: string };

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, clientId?: string) => Promise<LoginResult>;
  register: (email: string, password: string, fullName: string, clientId?: string) => Promise<User>;
  verifyTfa: (user_id: number, code: string, clientId?: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await request<{ user: User }>("dabbl-id", { query: { action: "me" } });
      setUser(user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login: AuthState["login"] = async (email, password, clientId = "cabinet") => {
    const res = await request<{
      token?: string;
      user?: User;
      tfa_required?: boolean;
      user_id?: number;
      email_hint?: string;
      dev_code?: string;
    }>("dabbl-id", {
      method: "POST",
      query: { action: "login" },
      body: { email, password, client_id: clientId },
      auth: false,
    });
    if (res.tfa_required) {
      return { tfa: true, user_id: res.user_id!, email_hint: res.email_hint!, dev_code: res.dev_code };
    }
    if (res.token && res.user) {
      saveToken(res.token);
      setUser(res.user);
      return { ok: true, user: res.user };
    }
    throw new Error("Неожиданный ответ сервера");
  };

  const register: AuthState["register"] = async (email, password, fullName, clientId = "cabinet") => {
    const { token, user } = await request<{ token: string; user: User }>("dabbl-id", {
      method: "POST",
      query: { action: "register" },
      body: { email, password, full_name: fullName, client_id: clientId },
      auth: false,
    });
    saveToken(token);
    setUser(user);
    return user;
  };

  const verifyTfa: AuthState["verifyTfa"] = async (user_id, code, clientId = "cabinet") => {
    const { token, user } = await request<{ token: string; user: User }>("dabbl-id", {
      method: "POST",
      query: { action: "tfa-verify" },
      body: { user_id, code, client_id: clientId },
      auth: false,
    });
    saveToken(token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await request("dabbl-id", { method: "POST", query: { action: "logout" } });
    } catch {
      // ignore
    }
    clearToken();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, verifyTfa, logout, refresh, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth должен быть внутри AuthProvider");
  return ctx;
}