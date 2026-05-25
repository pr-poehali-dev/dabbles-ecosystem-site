import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { request } from "@/lib/api";

type Session = {
  token_preview: string;
  full_token: string;
  is_current: boolean;
  user_agent: string;
  ip: string;
  client_id: string;
  last_seen_at: string;
  created_at: string;
};

export default function IdProfile() {
  const { user, refresh, loading, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"info" | "security" | "sessions">("info");

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!loading && !user) nav("/id/auth");
  }, [user, loading, nav]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPosition(user.position);
      setPhone(user.phone || "");
      setAvatarUrl(user.avatar_url || "");
      setTfaEnabled(!!user.tfa_enabled);
    }
  }, [user]);

  useEffect(() => {
    if (tab === "sessions" && user) {
      request<{ sessions: Session[] }>("dabbl-id", { query: { action: "sessions" } })
        .then((r) => setSessions(r.sessions))
        .catch(() => {});
    }
  }, [tab, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f5]">
        <Icon name="Loader" size={28} className="animate-spin text-black/40" />
      </div>
    );
  }

  const saveProfile = async () => {
    setSavedMsg("");
    try {
      await request("dabbl-id", {
        method: "POST",
        query: { action: "profile-update" },
        body: { full_name: fullName, position, phone, avatar_url: avatarUrl },
      });
      await refresh();
      setSavedMsg("Сохранено");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      setSavedMsg(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const changePw = async () => {
    setPwMsg("");
    try {
      await request("dabbl-id", {
        method: "POST",
        query: { action: "change-password" },
        body: { old_password: oldPw, new_password: newPw },
      });
      setOldPw(""); setNewPw("");
      setPwMsg("Пароль изменён");
      setTimeout(() => setPwMsg(""), 3000);
    } catch (e) {
      setPwMsg(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const toggleTfa = async (v: boolean) => {
    setTfaEnabled(v);
    await request("dabbl-id", {
      method: "POST",
      query: { action: "profile-update" },
      body: { tfa_enabled: v },
    });
    await refresh();
  };

  const revokeSession = async (token: string) => {
    await request("dabbl-id", {
      method: "POST",
      query: { action: "session-revoke" },
      body: { token },
    });
    const r = await request<{ sessions: Session[] }>("dabbl-id", { query: { action: "sessions" } });
    setSessions(r.sessions);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <header className="bg-white border-b border-black/8">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-[#1a0a6e] text-white text-[10px] uppercase tracking-[0.18em] font-bold">
              Даббл ID
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/cabinet" className="text-sm text-black/60 hover:text-black px-3 py-1.5">
              Кабинет
            </Link>
            <button
              onClick={async () => { await logout(); nav("/"); }}
              className="text-sm font-semibold text-black/70 hover:text-black px-3 py-1.5 rounded-lg hover:bg-black/5"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* HEADER CARD */}
        <div className="bg-white rounded-3xl p-7 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center text-white font-display text-2xl font-black">
              {(user.full_name || user.email).substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="font-display text-2xl font-black text-black">{user.full_name || "Без имени"}</div>
            <div className="text-sm text-black/55">{user.position || (user.role === "admin" ? "Администратор" : "Сотрудник")}</div>
            <div className="text-xs text-black/40 mt-1">{user.email}</div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-5 bg-white rounded-2xl p-1.5 w-fit">
          {[
            { k: "info", label: "Профиль", icon: "User" },
            { k: "security", label: "Безопасность", icon: "Shield" },
            { k: "sessions", label: "Устройства", icon: "Monitor" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.k ? "bg-[#1a0a6e] text-white" : "text-black/55 hover:text-black hover:bg-black/3"
              }`}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "info" && (
          <div className="bg-white rounded-3xl p-7 space-y-4">
            <Field label="Имя" value={fullName} onChange={setFullName} />
            <Field label="Должность" value={position} onChange={setPosition} />
            <Field label="Телефон" value={phone} onChange={setPhone} placeholder="+7 (000) 000-00-00" />
            <Field label="Аватар (URL)" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveProfile}
                className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#0a0535]"
              >
                Сохранить
              </button>
              {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-7">
              <h3 className="font-display text-lg font-bold text-black mb-1">Смена пароля</h3>
              <p className="text-sm text-black/50 mb-5">Минимум 6 символов</p>
              <div className="space-y-3">
                <Field label="Текущий пароль" type="password" value={oldPw} onChange={setOldPw} />
                <Field label="Новый пароль" type="password" value={newPw} onChange={setNewPw} />
                <div className="flex items-center gap-3">
                  <button
                    onClick={changePw}
                    disabled={!oldPw || !newPw}
                    className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#0a0535] disabled:opacity-50"
                  >
                    Обновить
                  </button>
                  {pwMsg && <span className="text-sm text-green-600">{pwMsg}</span>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#0077FF]/10 flex items-center justify-center shrink-0">
                  <Icon name="ShieldCheck" size={20} className="text-[#0077FF]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-black mb-1">Двухфакторная аутентификация</h3>
                  <p className="text-sm text-black/55 mb-4">
                    При входе будем присылать на почту шестизначный код. Защитит аккаунт, даже если пароль попадёт к другим.
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tfaEnabled}
                      onChange={(e) => toggleTfa(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="font-medium text-black">
                      {tfaEnabled ? "Включена" : "Выключена"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "sessions" && (
          <div className="bg-white rounded-3xl overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-10 text-center text-black/40 text-sm">Активных сессий нет</div>
            ) : (
              sessions.map((s, i) => (
                <div key={s.full_token} className={`p-5 flex items-start gap-4 ${i > 0 ? "border-t border-black/5" : ""}`}>
                  <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                    <Icon name={detectDeviceIcon(s.user_agent)} size={18} className="text-black/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-black text-sm">
                        {detectDeviceName(s.user_agent)}
                      </span>
                      {s.is_current && (
                        <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          Эта сессия
                        </span>
                      )}
                      <span className="text-[10px] uppercase tracking-wider bg-black/5 text-black/55 px-2 py-0.5 rounded-full font-bold">
                        {s.client_id}
                      </span>
                    </div>
                    <div className="text-xs text-black/45">
                      IP: {s.ip || "—"} · последняя активность {new Date(s.last_seen_at).toLocaleString("ru-RU")}
                    </div>
                  </div>
                  {!s.is_current && (
                    <button
                      onClick={() => revokeSession(s.full_token)}
                      className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Выйти
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none transition-colors text-black"
      />
    </div>
  );
}

function detectDeviceIcon(ua: string) {
  const u = (ua || "").toLowerCase();
  if (u.includes("iphone") || u.includes("android")) return "Smartphone";
  if (u.includes("ipad") || u.includes("tablet")) return "Tablet";
  return "Monitor";
}

function detectDeviceName(ua: string) {
  const u = (ua || "").toLowerCase();
  if (u.includes("iphone")) return "iPhone";
  if (u.includes("android")) return "Android";
  if (u.includes("ipad")) return "iPad";
  if (u.includes("mac")) return "Mac";
  if (u.includes("windows")) return "Windows";
  if (u.includes("linux")) return "Linux";
  return "Браузер";
}
