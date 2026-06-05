import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { request } from "@/lib/api";
import { redirectToYandex } from "@/lib/yandexAuth";

type ClientInfo = { name: string; description: string; logo_url: string; is_internal: boolean };

export default function IdAuth() {
  const { user, login, verifyTfa, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const clientId = params.get("client_id") || "cabinet";
  const redirectUri = params.get("redirect_uri") || "/cabinet";

  const [client, setClient] = useState<ClientInfo | null>(null);
  const [step, setStep] = useState<"login" | "tfa" | "consent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [tfaUserId, setTfaUserId] = useState<number | null>(null);
  const [emailHint, setEmailHint] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    request<ClientInfo>("dabbl-id", { query: { action: "client-info", client_id: clientId }, auth: false })
      .then(setClient)
      .catch(() => setClient(null));
  }, [clientId]);

  // Уже авторизован → сразу к consent (или авторедирект для внутренних)
  useEffect(() => {
    if (!loading && user && step === "login") {
      setStep("consent");
    }
  }, [user, loading, step]);

  const onSubmitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await login(email, password, clientId);
      if ("tfa" in r) {
        setTfaUserId(r.user_id);
        setEmailHint(r.email_hint);
        setDevCode(r.dev_code || null);
        setStep("tfa");
      } else {
        setStep("consent");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitTfa = async (e: FormEvent) => {
    e.preventDefault();
    if (!tfaUserId) return;
    setBusy(true);
    setError("");
    try {
      await verifyTfa(tfaUserId, code, clientId);
      setStep("consent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный код");
    } finally {
      setBusy(false);
    }
  };

  const onApprove = async () => {
    setBusy(true);
    setError("");
    try {
      // Для внутренних клиентов просто редиректим
      if (client?.is_internal || ["cabinet", "vibe"].includes(clientId)) {
        nav(redirectUri);
        return;
      }
      // Для внешних — получаем code и передаём в redirect_uri
      const { code: authCode } = await request<{ code: string }>("dabbl-id", {
        method: "POST",
        query: { action: "authorize" },
        body: { client_id: clientId, redirect_uri: redirectUri },
      });
      const sep = redirectUri.includes("?") ? "&" : "?";
      window.location.href = `${redirectUri}${sep}code=${authCode}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0535] via-[#1a0a6e] to-[#2d0060] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* DABBL ID HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#C1F089]" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.2em]">Даббл ID</span>
          </div>
          <div className="text-white/60 text-sm">Единый вход во все сервисы Даббл</div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* CLIENT BLOCK */}
          {client && (
            <div className="mb-7 pb-6 border-b border-black/8">
              <div className="text-[11px] uppercase tracking-wider text-black/40 font-semibold mb-2">
                Авторизация в сервис
              </div>
              <div className="flex items-center gap-3">
                {client.logo_url ? (
                  <img src={client.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center">
                    <Icon name="LayoutGrid" size={18} className="text-white" />
                  </div>
                )}
                <div>
                  <div className="font-display text-lg font-bold text-black">{client.name}</div>
                  {client.description && <div className="text-xs text-black/50">{client.description}</div>}
                </div>
              </div>
            </div>
          )}

          {step === "login" && (
            <>
              <h1 className="font-display text-2xl font-black text-black mb-1">Вход</h1>
              <p className="text-black/50 text-sm mb-7">Введите рабочий email и пароль</p>

              <form onSubmit={onSubmitLogin} className="space-y-3">
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="name@dabbl.ru"
                />
                <Field
                  label="Пароль"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                />
                {error && <Err msg={error} />}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] disabled:opacity-60 text-white font-semibold transition-colors mt-2"
                >
                  {busy ? "Входим…" : "Войти"}
                </button>
                <p className="text-[11px] text-black/35 text-center pt-1">
                  Нет учётной записи? Попросите администратора прислать приглашение.
                </p>
              </form>

              {clientId === "meroshkins" && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-black/8" />
                    <span className="text-[11px] text-black/30 font-medium">или</span>
                    <div className="flex-1 h-px bg-black/8" />
                  </div>
                  <button
                    onClick={() => redirectToYandex()}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-black/10 bg-white hover:bg-[#fff5f3] transition-colors text-[14px] font-semibold text-black/70"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#FC3F1D"/>
                      <path d="M13.4 7.2H12.3C11.1 7.2 10.4 7.8 10.4 8.9C10.4 10.1 10.9 10.7 11.9 11.4L13 12.1L10.3 16.8H8.5L11 12.4C9.7 11.5 9 10.5 9 8.9C9 7 10.2 5.8 12.2 5.8H15V16.8H13.4V7.2Z" fill="white"/>
                    </svg>
                    Войти через Яндекс ID
                  </button>
                </>
              )}
            </>
          )}

          {step === "tfa" && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#0077FF]/10 flex items-center justify-center mb-4">
                <Icon name="ShieldCheck" size={22} className="text-[#0077FF]" />
              </div>
              <h1 className="font-display text-2xl font-black text-black mb-1">Подтвердите вход</h1>
              <p className="text-black/50 text-sm mb-2">
                Мы отправили шестизначный код на <b>{emailHint}</b>
              </p>
              {devCode && (
                <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-xl mb-4">
                  Dev-режим: код <b>{devCode}</b>
                </div>
              )}

              <form onSubmit={onSubmitTfa} className="space-y-3 mt-5">
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-4 text-center font-display text-2xl font-black tracking-[0.4em] rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
                  placeholder="000000"
                />
                {error && <Err msg={error} />}
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="w-full py-3 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] disabled:opacity-60 text-white font-semibold transition-colors"
                >
                  {busy ? "Проверяем…" : "Подтвердить"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("login"); setCode(""); }}
                  className="w-full py-2 text-sm text-black/45 hover:text-black"
                >
                  ← Назад к входу
                </button>
              </form>
            </>
          )}

          {step === "consent" && user && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#C1F089]/30 flex items-center justify-center mb-4">
                <Icon name="CheckCircle2" size={22} className="text-[#1a0a6e]" />
              </div>
              <h1 className="font-display text-2xl font-black text-black mb-1">
                Здравствуйте, {user.full_name || user.email.split("@")[0]}!
              </h1>
              <p className="text-black/50 text-sm mb-5">
                Войти в <b>{client?.name || clientId}</b> от имени этого аккаунта?
              </p>

              <div className="flex items-center gap-3 p-4 bg-[#f0f0f5] rounded-2xl mb-5">
                <Avatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-black truncate">{user.full_name || user.email}</div>
                  <div className="text-xs text-black/45 truncate">{user.email}</div>
                </div>
              </div>

              {error && <Err msg={error} />}

              <button
                onClick={onApprove}
                disabled={busy}
                className="w-full py-3 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] disabled:opacity-60 text-white font-semibold transition-colors"
              >
                {busy ? "Переходим…" : "Войти"}
              </button>
              <div className="flex gap-2 mt-3">
                <Link
                  to="/id/profile"
                  className="flex-1 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-black/70 font-semibold text-sm text-center"
                >
                  Профиль
                </Link>
                <button
                  onClick={() => { localStorage.removeItem("dabbl_token"); window.location.reload(); }}
                  className="flex-1 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-black/70 font-semibold text-sm"
                >
                  Сменить аккаунт
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/40 hover:text-white text-xs">
            ← На сайт Даббл
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, type = "text", value, onChange, placeholder,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-black/50 font-medium mb-1.5 block">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none transition-colors text-black"
      />
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">
      {msg}
    </div>
  );
}

function Avatar({ user }: { user: { full_name: string; email: string; avatar_url?: string } }) {
  if (user.avatar_url) {
    return <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />;
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center text-white font-bold text-sm">
      {(user.full_name || user.email).substring(0, 2).toUpperCase()}
    </div>
  );
}