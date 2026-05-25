import { useEffect, useState, FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { request, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/api";

type InviteInfo = { email: string; full_name: string; position: string };

export default function IdInvite() {
  const { token } = useParams();
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [err, setErr] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    request<InviteInfo>("dabbl-id", { query: { action: "invite-info", token }, auth: false })
      .then((d) => { setInfo(d); setFullName(d.full_name); })
      .catch((e) => setErr(e instanceof Error ? e.message : "Приглашение не найдено"));
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) { setErr("Минимум 6 символов"); return; }
    if (password !== password2) { setErr("Пароли не совпадают"); return; }
    setBusy(true);
    try {
      const r = await request<{ token: string; user: User }>("dabbl-id", {
        method: "POST",
        query: { action: "invite-accept" },
        body: { token, password, full_name: fullName },
        auth: false,
      });
      setToken(r.token);
      setUser(r.user);
      nav("/cabinet");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0535] via-[#1a0a6e] to-[#2d0060] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 mb-4">
            <Icon name="Mail" size={14} className="text-[#C1F089]" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.2em]">Приглашение</span>
          </div>
          <div className="text-white/60 text-sm">Завершите регистрацию в Даббл ID</div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {!info && !err && (
            <div className="text-center py-6">
              <Icon name="Loader" size={26} className="animate-spin text-black/30 mx-auto" />
            </div>
          )}

          {err && !info && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Icon name="XCircle" size={26} className="text-red-500" />
              </div>
              <h2 className="font-display text-xl font-black text-black mb-2">Ссылка недействительна</h2>
              <p className="text-sm text-black/55 mb-5">{err}</p>
              <Link to="/id/auth" className="inline-block px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm">
                На страницу входа
              </Link>
            </div>
          )}

          {info && (
            <>
              <h1 className="font-display text-2xl font-black text-black mb-1">Добро пожаловать в Даббл!</h1>
              <p className="text-black/55 text-sm mb-6">
                Приглашение для <b>{info.email}</b>{info.position && ` · ${info.position}`}
              </p>

              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="text-xs text-black/50 font-medium mb-1.5 block">Имя и фамилия</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="text-xs text-black/50 font-medium mb-1.5 block">Придумайте пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
                    placeholder="Минимум 6 символов"
                  />
                </div>
                <div>
                  <label className="text-xs text-black/50 font-medium mb-1.5 block">Повторите пароль</label>
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
                  />
                </div>
                {err && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{err}</div>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] disabled:opacity-60 text-white font-semibold transition-colors mt-2"
                >
                  {busy ? "Создаём аккаунт…" : "Создать аккаунт"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
