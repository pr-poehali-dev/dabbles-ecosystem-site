import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { request, getToken, setToken as saveToken, clearToken, User } from "./api";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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
      const { user } = await request<{ user: User }>("auth", { query: { action: "me" } });
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

  const login = async (email: string, password: string) => {
    const { token, user } = await request<{ token: string; user: User }>("auth", {
      method: "POST",
      query: { action: "login" },
      body: { email, password },
      auth: false,
    });
    saveToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await request("auth", { method: "POST", query: { action: "logout" } });
    } catch {
      // ignore
    }
    clearToken();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth должен быть внутри AuthProvider");
  return ctx;
}
