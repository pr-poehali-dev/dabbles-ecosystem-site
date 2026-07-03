import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { request } from "@/lib/api";
import ProfileSection from "@/components/cabinet/ProfileSection";
import TasksSection from "@/components/cabinet/TasksSection";
import DocumentsSection from "@/components/cabinet/DocumentsSection";
import CrmSection from "@/components/cabinet/CrmSection";
import AdminUsers from "@/components/cabinet/AdminUsers";
import AdminContent from "@/components/cabinet/AdminContent";
import AdminHome from "@/components/cabinet/AdminHome";
import AdminOAuth from "@/components/cabinet/AdminOAuth";
import AdminOrgChart from "@/components/cabinet/AdminOrgChart";
import AdminKP from "@/components/cabinet/AdminKP";
import AdminClients from "@/components/cabinet/AdminClients";
import AdminCamp from "@/components/cabinet/AdminCamp";
import ChangePasswordModal from "@/components/cabinet/ChangePasswordModal";

type Section =
  | "profile" | "tasks" | "documents" | "crm"
  | "admin-clients" | "admin-users" | "admin-oauth"
  | "admin-org" | "admin-home" | "admin-kp" | "admin-camp";

const USER_NAV: { key: Section; label: string; icon: string; access?: string }[] = [
  { key: "profile",   label: "Профиль",    icon: "User" },
  { key: "tasks",     label: "Задачи",     icon: "CheckSquare", access: "access_tasks" },
  { key: "documents", label: "Документы",  icon: "FileText",    access: "access_documents" },
  { key: "crm",       label: "CRM",        icon: "Users",       access: "access_crm" },
];

const ADMIN_NAV: { key: Section; label: string; icon: string; desc: string }[] = [
  { key: "admin-clients", label: "Юр. портал",     icon: "Scale",      desc: "Клиенты, дела, оплаты" },
  { key: "admin-camp",    label: "Кэмп",           icon: "GraduationCap", desc: "Программы, лекции, тесты" },
  { key: "admin-users",   label: "Сотрудники",     icon: "UserPlus",   desc: "Управление командой" },
  { key: "admin-home",    label: "Главная",        icon: "Home",       desc: "Баннер и карточки" },
  { key: "admin-kp",      label: "КП — Шаблон",   icon: "FileDown",   desc: "Документ Word + стоп-слова" },
  { key: "admin-org",     label: "Оргструктура",   icon: "Network",    desc: "Схема компании" },
  { key: "admin-oauth",   label: "OAuth",          icon: "KeyRound",   desc: "Приложения и доступы" },
];

export default function Cabinet() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mustChange, setMustChange] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { if (!loading && !user) nav("/login"); }, [user, loading, nav]);
  useEffect(() => { if (user?.must_change_password) setMustChange(true); }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <div className="w-6 h-6 border-2 border-[#9FC96D]/30 border-t-[#5a9a2a] rounded-full animate-spin" />
    </div>
  );

  const section: Section = (params.get("section") as Section) || "profile";
  const setSection = (s: Section) => { setParams({ section: s }); setMobileOpen(false); };
  const isAdmin = user.role === "admin";

  const visibleUser = USER_NAV.filter(i =>
    !i.access || (user as Record<string, unknown>)[i.access] === true
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-body">

      {/* ── ШАПКА ── */}
      <header className="bg-white border-b border-black/6 sticky top-0 z-30">
        <div className="h-[60px] flex items-center px-4 md:px-6 gap-4">
          <Link to="/" className="shrink-0">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/3bb7bd0c-31d8-44c0-85ef-0bd65a2a3961.png"
              alt="Даббл"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {/* Быстрые ссылки (десктоп) */}
            <Link to="/edo"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-black/50 hover:bg-black/5 transition-colors">
              <Icon name="FileStack" size={14} /> ЭДО
            </Link>
            <Link to="/id/profile"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-black/50 hover:bg-black/5 transition-colors">
              <Icon name="IdCard" size={14} /> Даббл ID
            </Link>

            {/* Имя + выход */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-black/8 ml-1">
              <div className="w-8 h-8 rounded-full bg-[#f0f8e8] flex items-center justify-center text-[#5a9a2a] text-[12px] font-bold">
                {(user.full_name || user.email || "?")[0].toUpperCase()}
              </div>
              <span className="text-[13px] font-semibold text-black max-w-[120px] truncate">
                {user.full_name?.split(" ")[0] || user.email}
              </span>
              <button onClick={async () => { await logout(); nav("/"); }}
                className="p-1.5 rounded-lg text-black/30 hover:text-black/70 hover:bg-black/5 transition-colors" title="Выйти">
                <Icon name="LogOut" size={15} />
              </button>
            </div>

            {/* Бургер мобилка */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-black/60">
              <Icon name={mobileOpen ? "X" : "Menu"} size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── САЙДБАР (десктоп) ── */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 py-4 px-2 gap-0.5 overflow-y-auto">

          {/* Личные разделы */}
          {visibleUser.map(i => (
            <button key={i.key} onClick={() => setSection(i.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all text-left ${
                section === i.key ? "bg-white text-black shadow-sm font-semibold" : "text-black/45 hover:text-black hover:bg-white/70"
              }`}>
              <Icon name={i.icon} size={15} className={section === i.key ? "text-[#5a9a2a]" : "text-black/30"} />
              {i.label}
            </button>
          ))}

          {/* Раздел админа */}
          {isAdmin && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-black/30 font-bold mt-4 mb-1 px-3">
                Управление
              </div>
              {ADMIN_NAV.map(i => (
                <button key={i.key} onClick={() => setSection(i.key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all text-left ${
                    section === i.key ? "bg-white text-black shadow-sm font-semibold" : "text-black/45 hover:text-black hover:bg-white/70"
                  }`}>
                  <Icon name={i.icon} size={15} className={section === i.key ? "text-[#5a9a2a]" : "text-black/30"} />
                  {i.label}
                </button>
              ))}
            </>
          )}
        </aside>

        {/* ── КОНТЕНТ ── */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-6 py-5 pb-24 md:pb-6">
          {section === "profile"        && <ProfileSection />}
          {section === "tasks"          && user.access_tasks     && <TasksSection />}
          {section === "documents"      && user.access_documents && <DocumentsSection />}
          {section === "crm"            && user.access_crm       && <CrmSection />}
          {section === "admin-users"    && isAdmin && <AdminUsers />}
          {section === "admin-oauth"    && isAdmin && <AdminOAuth />}
          {section === "admin-org"      && isAdmin && <AdminOrgChart />}
          {section === "admin-home"     && isAdmin && <AdminHome />}
          {section === "admin-kp"       && isAdmin && <AdminKP />}
          {section === "admin-clients"  && isAdmin && <AdminClients />}
          {section === "admin-camp"     && isAdmin && <AdminCamp />}
        </main>
      </div>

      {/* ── МОБИЛЬНОЕ БОКОВОЕ МЕНЮ ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl overflow-y-auto">
            <div className="px-5 py-4 border-b border-black/6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0f8e8] flex items-center justify-center text-[#5a9a2a] text-[14px] font-bold">
                  {(user.full_name || user.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-black truncate">{user.full_name || user.email}</div>
                  <div className="text-[11px] text-black/40">{user.position || ""}</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-black/30 p-1">
                <Icon name="X" size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {visibleUser.map(i => (
                <button key={i.key} onClick={() => setSection(i.key)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors text-left ${
                    section === i.key ? "bg-[#f0f8e8] text-[#5a9a2a] font-semibold" : "text-black/55 hover:bg-black/5"
                  }`}>
                  <Icon name={i.icon} size={17} /> {i.label}
                </button>
              ))}

              {isAdmin && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-black/30 font-bold mt-4 mb-1 px-2">Управление</div>
                  {ADMIN_NAV.map(i => (
                    <button key={i.key} onClick={() => setSection(i.key)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors text-left ${
                        section === i.key ? "bg-[#f0f8e8] text-[#5a9a2a] font-semibold" : "text-black/55 hover:bg-black/5"
                      }`}>
                      <Icon name={i.icon} size={17} />
                      <div>
                        <div>{i.label}</div>
                        <div className="text-[10px] text-black/35 font-normal">{i.desc}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </nav>

            <div className="px-3 py-3 border-t border-black/6 space-y-1">
              <Link to="/edo" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black/55 hover:bg-black/5">
                <Icon name="FileStack" size={16} /> ЭДО
              </Link>
              <Link to="/id/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black/55 hover:bg-black/5">
                <Icon name="IdCard" size={16} /> Даббл ID
              </Link>
              <button onClick={async () => { await logout(); nav("/"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-black/55 hover:bg-black/5">
                <Icon name="LogOut" size={16} /> Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {mustChange && (
        <ChangePasswordModal onClose={async () => {
          setMustChange(false);
          await request("dabbl-id", { query: { action: "me" } });
        }} />
      )}
    </div>
  );
}