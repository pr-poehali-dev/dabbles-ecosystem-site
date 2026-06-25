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
import AdminDirector from "@/components/cabinet/AdminDirector";
import AdminKP from "@/components/cabinet/AdminKP";
import AdminClients from "@/components/cabinet/AdminClients";
import ChangePasswordModal from "@/components/cabinet/ChangePasswordModal";

type Section = "profile" | "tasks" | "documents" | "crm" | "admin-users" | "admin-oauth" | "admin-org" | "admin-home" | "admin-hero" | "admin-news" | "admin-blog" | "admin-director" | "admin-kp" | "admin-clients";

export default function Cabinet() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mustChange, setMustChange] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav("/login");
  }, [user, loading, nav]);

  useEffect(() => {
    if (user?.must_change_password) setMustChange(true);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f5]">
        <Icon name="Loader" size={28} className="animate-spin text-black/40" />
      </div>
    );
  }

  const section: Section = (params.get("section") as Section) || "profile";
  const setSection = (s: Section) => setParams({ section: s });

  const isAdmin = user.role === "admin";

  const navItems: { key: Section; label: string; icon: string; show: boolean }[] = [
    { key: "profile", label: "Профиль", icon: "User", show: true },
    { key: "tasks", label: "Задачи", icon: "CheckSquare", show: user.access_tasks },
    { key: "documents", label: "Документы", icon: "FileText", show: user.access_documents },
    { key: "crm", label: "CRM", icon: "Users", show: user.access_crm },
  ];

  const adminItems: { key: Section; label: string; icon: string }[] = [
    { key: "admin-clients", label: "Клиентский портал", icon: "Scale" },
    { key: "admin-users", label: "Сотрудники", icon: "UserPlus" },
    { key: "admin-oauth", label: "OAuth-приложения", icon: "KeyRound" },
    { key: "admin-org", label: "Структура компании", icon: "Network" },
    { key: "admin-home", label: "Главная страница", icon: "Home" },
    { key: "admin-blog", label: "Блог", icon: "FileEdit" },
    { key: "admin-director", label: "Директор", icon: "User" },
    { key: "admin-kp", label: "КП — Шаблон", icon: "FileDown" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f5] flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="md:w-64 bg-white border-r border-black/8 md:min-h-screen flex flex-col">
        <div className="p-5 border-b border-black/8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл"
              className="h-7 w-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
          </Link>
          <div className="text-[11px] uppercase tracking-wider text-black/40 font-semibold">Кабинет</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.filter((i) => i.show).map((i) => (
            <button
              key={i.key}
              onClick={() => setSection(i.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                section === i.key ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
              }`}
            >
              <Icon name={i.icon} size={17} />
              {i.label}
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-black/35 font-bold mt-5 mb-2 px-3">Админ</div>
              {adminItems.map((i) => (
                <button
                  key={i.key}
                  onClick={() => setSection(i.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    section === i.key ? "bg-[#FD4160] text-white" : "text-black/70 hover:bg-black/5"
                  }`}
                >
                  <Icon name={i.icon} size={17} />
                  {i.label}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-black/8">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-black truncate">{user.full_name || user.email}</div>
            <div className="text-[11px] text-black/40 truncate">{user.position || user.email}</div>
          </div>
          <Link
            to="/edo"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#1a0a6e] hover:bg-[#1a0a6e]/8 transition-colors mb-1"
          >
            <Icon name="FileStack" size={16} /> ЭДО
          </Link>
          <Link
            to="/id/profile"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-black/60 hover:bg-black/5 hover:text-black transition-colors mb-1"
          >
            <Icon name="IdCard" size={16} /> Даббл ID
          </Link>
          <button
            onClick={async () => { await logout(); nav("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-black/60 hover:bg-black/5 hover:text-black transition-colors"
          >
            <Icon name="LogOut" size={16} /> Выйти
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-5 md:p-10 overflow-x-auto">
        {section === "profile" && <ProfileSection />}
        {section === "tasks" && user.access_tasks && <TasksSection />}
        {section === "documents" && user.access_documents && <DocumentsSection />}
        {section === "crm" && user.access_crm && <CrmSection />}
        {section === "admin-users" && isAdmin && <AdminUsers />}
        {section === "admin-oauth" && isAdmin && <AdminOAuth />}
        {section === "admin-org" && isAdmin && <AdminOrgChart />}
        {section === "admin-home" && isAdmin && <AdminHome />}
        {section === "admin-blog" && isAdmin && <AdminContent kind="blog" />}
        {section === "admin-director" && isAdmin && <AdminDirector />}
        {section === "admin-kp" && isAdmin && <AdminKP />}
        {section === "admin-clients" && isAdmin && <AdminClients />}
      </main>

      {mustChange && (
        <ChangePasswordModal
          onClose={async () => {
            setMustChange(false);
            await request("dabbl-id", { query: { action: "me" } });
          }}
        />
      )}
    </div>
  );
}