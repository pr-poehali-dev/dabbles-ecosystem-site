import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Icon from "@/components/ui/icon";

const NAV = [
  { to: "/edo", icon: "LayoutDashboard", label: "Дашборд", exact: true },
  { to: "/edo/docs", icon: "FileText", label: "Документы" },
  { to: "/edo/inbox", icon: "Inbox", label: "Входящие" },
  { to: "/edo/outbox", icon: "Send", label: "Исходящие" },
  { to: "/edo/orgs", icon: "Building2", label: "Организации" },
  { to: "/edo/archive", icon: "Archive", label: "Архив" },
  { to: "/edo/trash", icon: "Trash2", label: "Корзина", adminOnly: true },
];

interface Props { children: React.ReactNode }

export default function EdoLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const navItems = NAV.filter(n => !n.adminOnly || user?.role === "admin" || user?.role === "manager");

  const Sidebar = () => (
    <aside className="w-60 bg-white border-r border-black/6 flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-black/6 gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#1a0a6e] flex items-center justify-center">
          <Icon name="FileStack" size={14} className="text-white" />
        </div>
        <span className="font-black text-[15px] text-black tracking-tight">ЭДО</span>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(n => (
          <Link key={n.to} to={n.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
              isActive(n.to, n.exact)
                ? "bg-[#1a0a6e] text-white"
                : "text-black/50 hover:text-black hover:bg-black/5"
            }`}>
            <Icon name={n.icon} size={16} />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-black/6">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-[#1a0a6e]/10 flex items-center justify-center text-[11px] font-bold text-[#1a0a6e]">
            {user?.full_name?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-black truncate">{user?.full_name}</div>
            <div className="text-[10px] text-black/40 truncate">{user?.position || user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }} className="text-black/30 hover:text-black/60 transition-colors">
            <Icon name="LogOut" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex bg-[#f5f5f7] font-body overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 bg-white border-b border-black/6 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-black/50">
            <Icon name="Menu" size={20} />
          </button>
          <div className="w-6 h-6 rounded-md bg-[#1a0a6e] flex items-center justify-center">
            <Icon name="FileStack" size={12} className="text-white" />
          </div>
          <span className="font-black text-[14px] text-black">ЭДО</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
