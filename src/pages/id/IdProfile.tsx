import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

type Section = "home" | "data" | "security" | "sessions";

const NAV: { key: Section; label: string; icon: string }[] = [
  { key: "home", label: "Главная", icon: "Home" },
  { key: "data", label: "Данные", icon: "IdCard" },
  { key: "security", label: "Безопасность", icon: "ShieldCheck" },
  { key: "sessions", label: "Устройства", icon: "Monitor" },
];

const SERVICES: { key: string; label: string; icon: string; to: string; gradient: string }[] = [
  { key: "cabinet", label: "Кабинет сотрудника", icon: "Briefcase", to: "/cabinet", gradient: "from-[#FD4160] to-[#0077FF]" },
  { key: "client", label: "Юридический портал", icon: "Scale", to: "/client", gradient: "from-[#1a0a6e] to-[#2d0060]" },
  { key: "camp", label: "Кэмп", icon: "GraduationCap", to: "/camp", gradient: "from-[#EBD047] to-[#DAB332]" },
  { key: "vibe", label: "ВАЙБ", icon: "ShoppingBag", to: "/vibe", gradient: "from-[#C1F089] to-[#0077FF]" },
];

const CLIENT_LABELS: Record<string, string> = {
  cabinet: "Кабинет",
  vibe: "ВАЙБ",
  camp: "Кэмп",
  "client-portal": "Юр.портал",
  meroshkins: "Мерошкинс",
};

export default function IdProfile() {
  const { user, refresh, loading, logout } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const section = (params.get("section") as Section) || "home";
  const setSection = (s: Section) => setParams({ section: s });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    if (section === "sessions" && user) {
      request<{ sessions: Session[] }>("dabbl-id", { query: { action: "sessions" } })
        .then((r) => setSessions(r.sessions))
        .catch(() => {});
    }
  }, [section, user]);

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

  const securityChecks = [
    { done: !!avatarUrl, icon: "ImagePlus", label: "Добавьте фото профиля", action: () => setSection("data") },
    { done: !!phone, icon: "Phone", label: "Укажите телефон", action: () => setSection("data") },
    { done: tfaEnabled, icon: "ShieldCheck", label: "Включите 2FA", action: () => setSection("security") },
    { done: !user.must_change_password, icon: "KeyRound", label: "Смените пароль", action: () => setSection("security") },
  ];
  const doneCount = securityChecks.filter((c) => c.done).length;

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-body flex flex-col">
      {/* ── ШАПКА ── */}
      <header className="bg-white border-b border-black/6 sticky top-0 z-30">
        <div className="h-16 flex items-center px-4 md:px-6 gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-1 rounded-full bg-[#1a0a6e] text-white text-[10px] uppercase tracking-[0.18em] font-bold">
              Даббл ID
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xs mx-auto">
            <div className="w-full flex items-center gap-2 bg-[#f5f5f7] rounded-[12px] px-3 py-2 text-black/35 text-[13px]">
              <Icon name="Search" size={14} />
              <span>Поиск по сервисам</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={async () => { await logout(); nav("/"); }}
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-black/60 hover:text-black px-3 py-1.5 rounded-lg hover:bg-black/5"
            >
              <Icon name="LogOut" size={14} /> Выйти
            </button>
            <Avatar user={user} size={34} />
            <button onClick={() => setMobileNavOpen((v) => !v)} className="md:hidden w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-black/60">
              <Icon name={mobileNavOpen ? "X" : "Menu"} size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── САЙДБАР ── */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 py-5 px-3 gap-0.5">
          {NAV.map((i) => (
            <button
              key={i.key}
              onClick={() => setSection(i.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all text-left ${
                section === i.key ? "bg-white text-black shadow-sm font-semibold" : "text-black/45 hover:text-black hover:bg-white/70"
              }`}
            >
              <Icon name={i.icon} size={16} className={section === i.key ? "text-[#1a0a6e]" : "text-black/30"} />
              {i.label}
            </button>
          ))}
          <div className="mt-4 pt-4 border-t border-black/6 text-[11px] text-black/30 px-3">
            © 2026 Даббл ID
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[240px] bg-white p-4">
              {NAV.map((i) => (
                <button
                  key={i.key}
                  onClick={() => { setSection(i.key); setMobileNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-[14px] font-medium mb-1 ${
                    section === i.key ? "bg-[#f0f0f5] text-black font-semibold" : "text-black/55"
                  }`}
                >
                  <Icon name={i.icon} size={17} />
                  {i.label}
                </button>
              ))}
              <button onClick={async () => { await logout(); nav("/"); }}
                className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-[14px] text-red-600 mt-2">
                <Icon name="LogOut" size={17} /> Выйти
              </button>
            </div>
          </div>
        )}

        {/* ── КОНТЕНТ ── */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-16">
          <div className="max-w-3xl">

            {section === "home" && (
              <div className="space-y-5">
                {/* Профиль-хедер как на референсе Яндекс ID */}
                <div className="flex flex-col items-center text-center bg-white rounded-3xl p-8">
                  <Avatar user={user} size={92} />
                  <div className="flex items-center gap-1.5 mt-4">
                    <h1 className="font-display text-2xl font-black text-black">{user.full_name || "Без имени"}</h1>
                    <Icon name="BadgeCheck" size={18} className="text-[#0077FF]" />
                  </div>
                  <div className="text-black/45 text-sm mt-1">
                    {user.phone && <span>{user.phone} · </span>}{user.email}
                  </div>

                  <div className="flex items-center gap-2 mt-5">
                    <button
                      onClick={() => setSection("data")}
                      className="px-4 py-2 rounded-full bg-[#f0f0f5] text-black/70 text-[13px] font-semibold hover:bg-black/10 transition-colors flex items-center gap-1.5"
                    >
                      <Icon name="Pencil" size={13} /> Редактировать
                    </button>
                    <button
                      onClick={() => setSection("security")}
                      className="px-4 py-2 rounded-full bg-[#f0f0f5] text-black/70 text-[13px] font-semibold hover:bg-black/10 transition-colors flex items-center gap-1.5"
                    >
                      <Icon name="ShieldCheck" size={13} /> Безопасность
                    </button>
                  </div>
                </div>

                {/* Защита аккаунта */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="font-display text-lg font-bold text-black">Защита аккаунта</h2>
                    {doneCount < securityChecks.length && (
                      <span className="flex items-center gap-1 text-[12px] font-bold text-red-500">
                        <Icon name="AlertCircle" size={13} /> {securityChecks.length - doneCount} рекомендации
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {securityChecks.map((c) => (
                      <button
                        key={c.label}
                        onClick={c.action}
                        className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow relative"
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.done ? "bg-green-50" : "bg-[#f0f0f5]"}`}>
                          <Icon name={c.icon} size={18} className={c.done ? "text-green-600" : "text-black/40"} />
                        </div>
                        {c.done && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <Icon name="Check" size={10} className="text-white" />
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-black/60 leading-tight">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Мои сервисы */}
                <div>
                  <h2 className="font-display text-lg font-bold text-black mb-3 px-1">Мои сервисы</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SERVICES.map((s) => (
                      <a
                        key={s.key}
                        href={s.to}
                        className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-md transition-shadow"
                      >
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                          <Icon name={s.icon} size={20} className="text-white" />
                        </div>
                        <span className="text-[12px] font-semibold text-black/70 leading-tight">{s.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === "data" && (
              <div className="bg-white rounded-3xl p-7 space-y-4">
                <h1 className="font-display text-xl font-black text-black mb-1">Личные данные</h1>
                <p className="text-black/45 text-sm mb-4">Эти данные видят все сервисы экосистемы Даббл</p>
                <div className="flex items-center gap-4 mb-2">
                  <Avatar user={{ ...user, avatar_url: avatarUrl }} size={64} />
                  <div className="flex-1">
                    <Field label="Ссылка на аватар (URL)" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
                  </div>
                </div>
                <Field label="Имя" value={fullName} onChange={setFullName} />
                <Field label="Должность / роль" value={position} onChange={setPosition} placeholder="Необязательно" />
                <Field label="Телефон" value={phone} onChange={setPhone} placeholder="+7 (000) 000-00-00" />
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

            {section === "security" && (
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

            {section === "sessions" && (
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-black text-sm">
                            {detectDeviceName(s.user_agent)}
                          </span>
                          {s.is_current && (
                            <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                              Эта сессия
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-wider bg-black/5 text-black/55 px-2 py-0.5 rounded-full font-bold">
                            {CLIENT_LABELS[s.client_id] || s.client_id}
                          </span>
                        </div>
                        <div className="text-xs text-black/45">
                          IP: {s.ip || "—"} · последняя активность {new Date(s.last_seen_at).toLocaleString("ru-RU")}
                        </div>
                      </div>
                      {!s.is_current && (
                        <button
                          onClick={() => revokeSession(s.full_token)}
                          className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold shrink-0"
                        >
                          Выйти
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none transition-colors text-black"
      />
    </div>
  );
}

function Avatar({ user, size = 40 }: { user: { full_name: string; email: string; avatar_url?: string }; size?: number }) {
  const style = { width: size, height: size };
  if (user.avatar_url) {
    return (
      <div className="rounded-full p-[2px] bg-gradient-to-br from-[#FD4160] via-[#C1F089] to-[#0077FF] shrink-0" style={style}>
        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-white" />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center text-white font-bold shrink-0"
      style={{ ...style, fontSize: size / 2.6 }}
    >
      {(user.full_name || user.email).substring(0, 2).toUpperCase()}
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
