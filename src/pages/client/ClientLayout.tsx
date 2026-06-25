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

  return (
    <div className="min-h-screen bg-[#f5f5f8] flex flex-col md:flex-row font-body">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-black/6 min-h-screen">
        <div className="px-5 py-5 border-b border-black/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a0a6e] flex items-center justify-center">
              <Icon name="Scale" size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-black text-black leading-tight">Личный кабинет</div>
              <div className="text-[10px] text-black/35 font-medium">Юридические услуги</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                isActive(n.to) ? "bg-[#1a0a6e] text-white" : "text-black/50 hover:text-black hover:bg-black/5"
              }`}>
              <Icon name={n.icon} size={16} />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-black/6">
          <div className="px-3 py-2 mb-1">
            <div className="text-[13px] font-semibold text-black truncate">{client?.full_name || "..."}</div>
            <div className="text-[11px] text-black/40 truncate">{client?.email}</div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-black/50 hover:bg-black/5 hover:text-black transition-colors">
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-black/6 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1a0a6e] flex items-center justify-center">
            <Icon name="Scale" size={16} className="text-white" />
          </div>
          <span className="font-black text-[14px] text-black">Личный кабинет</span>
        </div>
        <button onClick={() => setMenuOpen(m => !m)} className="text-black/50">
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col z-50">
            <div className="px-5 py-5 border-b border-black/6">
              <div className="text-[13px] font-semibold text-black">{client?.full_name}</div>
              <div className="text-[11px] text-black/40">{client?.email}</div>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    isActive(n.to) ? "bg-[#1a0a6e] text-white" : "text-black/50 hover:text-black hover:bg-black/5"
                  }`}>
                  <Icon name={n.icon} size={16} />
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-black/6">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-black/50">
                <Icon name="LogOut" size={15} /> Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
