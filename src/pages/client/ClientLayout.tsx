import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cpApi, clearCpToken, CpClient } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

const NAV = [
  { to: "/client/home", icon: "Home", label: "Главная", exact: true },
  { to: "/client/cases", icon: "Scale", label: "Дела" },
  { to: "/client/payments", icon: "CreditCard", label: "Оплаты" },
  { to: "/client/documents", icon: "FileText", label: "Документы" },
  { to: "/client/submit", icon: "FilePlus2", label: "Заявления" },
];

interface Props { children: React.ReactNode }

export default function ClientLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [client, setClient] = useState<CpClient | null>(null);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    cpApi.me().then(r => setClient(r.client)).catch(() => {
      clearCpToken();
      navigate("/client");
    });
  }, [navigate]);

  const handleLogout = async () => {
    await cpApi.logout().catch(() => {});
    clearCpToken();
    navigate("/client");
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : (location.pathname === to || location.pathname.startsWith(to + "/"));

  const initials = client?.full_name
    ? client.full_name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-body flex flex-col">

      {/* ── ШАПКА ── */}
      <header className="bg-white border-b border-black/6 sticky top-0 z-30 shrink-0">
        <div className="h-[60px] flex items-center px-4 md:px-6 gap-3">

          {/* Логотип */}
          <Link to="/client/cases" className="shrink-0">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/3bb7bd0c-31d8-44c0-85ef-0bd65a2a3961.png"
              alt="Даббл"
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Поиск по центру (десктоп) */}
          <div className="hidden md:flex flex-1 max-w-sm mx-auto">
            <div className="w-full flex items-center gap-2 bg-[#f5f5f7] rounded-[12px] px-3 py-2 text-black/35 text-[13px]">
              <Icon name="Search" size={14} />
              <span>Поиск</span>
            </div>
          </div>

          {/* Правая часть */}
          <div className="ml-auto flex items-center gap-2">
            {/* Аватар + имя (десктоп) */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-black/5 transition-colors group"
              title="Выйти"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #9FC96D 0%, #5a9a2a 100%)" }}
              >
                {initials}
              </div>
              <span className="text-[13px] font-semibold text-black max-w-[120px] truncate">
                {client?.full_name?.split(" ")[0] || "..."}
              </span>
              <Icon name="LogOut" size={13} className="text-black/30 group-hover:text-black/60" />
            </button>

            {/* Бургер (мобилка) */}
            <button
              onClick={() => setSideOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-black/60"
            >
              <Icon name="Menu" size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── ТЕЛО ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Сайдбар десктоп */}
        <aside className="hidden md:flex flex-col w-[200px] shrink-0 py-4 px-2">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all mb-0.5 ${
                isActive(n.to, n.exact)
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-black/45 hover:text-black hover:bg-white/70"
              }`}
            >
              <Icon
                name={n.icon}
                size={16}
                className={isActive(n.to, n.exact) ? "text-[#5a9a2a]" : "text-black/30"}
              />
              {n.label}
            </Link>
          ))}
        </aside>

        {/* Контент */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-6 py-5 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* ── НИЖНЯЯ НАВИГАЦИЯ (мобилка) ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-black/8 z-30 safe-area-bottom">
        <div className="flex items-stretch h-[56px]">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${
                isActive(n.to, n.exact) ? "text-[#5a9a2a]" : "text-black/35"
              }`}
            >
              <Icon name={n.icon} size={19} />
              <span className="text-[9px] font-semibold leading-none tracking-tight whitespace-nowrap">
                {n.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── БОКОВОЕ МЕНЮ (мобилка) ── */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSideOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl">
            {/* Шапка */}
            <div className="px-5 py-4 border-b border-black/6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
                  style={{ background: "linear-gradient(135deg, #9FC96D 0%, #5a9a2a 100%)" }}
                >
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[13px] font-bold text-black truncate">{client?.full_name}</div>
                  <div className="text-[11px] text-black/40 truncate">{client?.email}</div>
                </div>
              </div>
              <button onClick={() => setSideOpen(false)} className="text-black/30 hover:text-black p-1">
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Навигация */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {NAV.map(n => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setSideOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive(n.to, n.exact)
                      ? "bg-[#f0f8e8] text-[#5a9a2a] font-semibold"
                      : "text-black/55 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <Icon name={n.icon} size={17} />
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Выход */}
            <div className="p-3 border-t border-black/6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] text-black/50 hover:bg-black/5"
              >
                <Icon name="LogOut" size={16} />
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}