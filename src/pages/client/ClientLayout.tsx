import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cpApi, clearCpToken, CpClient } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

const NAV = [
  { to: "/client/cases", icon: "Scale", label: "Мои дела" },
  { to: "/client/payments", icon: "CreditCard", label: "История оплат" },
  { to: "/client/documents", icon: "FileText", label: "Мои документы" },
  { to: "/client/submit", icon: "FilePlus2", label: "Подать заявление" },
];

interface Props { children: React.ReactNode }

export default function ClientLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [client, setClient] = useState<CpClient | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    cpApi.me().then(r => setClient(r.client)).catch(() => {
      clearCpToken();
      navigate("/client");
    });
  }, [navigate]);

  const handleLogout = async () => {
    await cpApi.logout();
    clearCpToken();
    navigate("/client");
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");

  const initials = client?.full_name
    ? client.full_name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  const firstName = client?.full_name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-body">

      {/* ── ВЕРХНЯЯ ШАПКА ── */}
      <header className="bg-white border-b border-black/6 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-[64px] flex items-center gap-4">
          {/* Лого */}
          <Link to="/client/cases" className="shrink-0">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/3bb7bd0c-31d8-44c0-85ef-0bd65a2a3961.png"
              alt="Даббл"
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Поиск — по центру */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-[14px] px-3 py-2.5 text-black/35">
              <Icon name="Search" size={16} />
              <span className="text-[14px]">Поиск</span>
            </div>
          </div>

          {/* Правая часть */}
          <div className="ml-auto flex items-center gap-3">
            {/* Сетка сервисов */}
            <button className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-black/50 hover:bg-black/10 transition-colors hidden md:flex">
              <Icon name="LayoutGrid" size={18} />
            </button>

            {/* Аватар + имя */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-black/5 transition-colors group"
              title="Выйти"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #9FC96D 0%, #5a9a2a 100%)" }}>
                {initials}
              </div>
              <span className="text-[14px] font-semibold text-black hidden sm:block">{firstName}</span>
              <Icon name="LogOut" size={14} className="text-black/30 group-hover:text-black/60 transition-colors" />
            </button>

            {/* Мобильное меню */}
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="md:hidden w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-black/60"
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── ОСНОВНОЙ КОНТЕНТ ── */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 gap-6">

        {/* Сайдбар (десктоп) */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 gap-1">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-[14px] text-[14px] font-medium transition-all ${
                isActive(n.to)
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-black/50 hover:text-black hover:bg-white/60"
              }`}
            >
              <Icon
                name={n.icon}
                size={17}
                className={isActive(n.to) ? "text-[#5a9a2a]" : "text-black/35"}
              />
              {n.label}
            </Link>
          ))}
        </aside>

        {/* Контент */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Мобильная навигация — снизу */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/8 flex z-30">
        {NAV.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
              isActive(n.to) ? "text-[#5a9a2a]" : "text-black/35"
            }`}
          >
            <Icon name={n.icon} size={20} />
            <span className="text-[9px] font-semibold leading-none">{n.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Мобильное боковое меню */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col z-50 shadow-2xl">
            <div className="px-5 py-5 border-b border-black/6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #9FC96D 0%, #5a9a2a 100%)" }}>
                {initials}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-black">{client?.full_name}</div>
                <div className="text-[11px] text-black/40">{client?.email}</div>
              </div>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive(n.to) ? "bg-[#f0f8e8] text-[#5a9a2a] font-semibold" : "text-black/55 hover:bg-black/5 hover:text-black"
                  }`}>
                  <Icon name={n.icon} size={17} />
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-black/6">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-[14px] text-black/50 hover:bg-black/5">
                <Icon name="LogOut" size={16} /> Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
