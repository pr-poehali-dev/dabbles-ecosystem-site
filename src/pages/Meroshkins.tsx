import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import CalendarPage from "./meroshkins/CalendarPage";
import VenuesPage from "./meroshkins/VenuesPage";

type Tab = "calendar" | "venues";

const SIDEBAR = [
  { key: "calendar" as Tab, icon: "CalendarDays", label: "Календарь" },
  { key: "venues" as Tab, icon: "MapPin", label: "Площадки" },
];

export default function Meroshkins() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ff]">
        <Icon name="Loader" size={28} className="animate-spin text-[#7c3aed]/50" />
      </div>
    );
  }

  const tab = (params.get("tab") as Tab) || "calendar";
  const setTab = (t: Tab) => { setParams({ tab: t }); setSideOpen(false); };

  return (
    <div className="min-h-screen bg-[#f5f3ff] flex flex-col font-body">
      {/* TOP NAV */}
      <nav className="h-[60px] bg-white border-b border-black/8 flex items-center px-4 md:px-6 gap-3 shrink-0 z-30">
        <button onClick={() => setSideOpen(s => !s)} className="md:hidden p-2 rounded-xl hover:bg-black/5 text-black/50">
          <Icon name="Menu" size={20} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
            <Icon name="CalendarDays" size={14} className="text-white" />
          </div>
          <span className="font-display font-black text-black text-sm hidden sm:block">
            Даббл.<span className="text-[#7c3aed]">Мерошкинс</span>
          </span>
        </Link>

        <div className="flex-1" />

        {/* User */}
        <div className="flex items-center gap-2 text-sm text-black/50">
          <div className="w-7 h-7 rounded-full bg-[#7c3aed]/15 flex items-center justify-center text-[#7c3aed] font-bold text-xs">
            {user.full_name?.[0] || user.email[0].toUpperCase()}
          </div>
          <span className="hidden sm:block text-xs font-medium">{user.full_name || user.email}</span>
        </div>
        <Link to="/cabinet" className="p-2 rounded-xl hover:bg-black/5 text-black/40" title="Кабинет">
          <Icon name="LayoutDashboard" size={18} />
        </Link>
      </nav>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`
          w-56 bg-white border-r border-black/8 flex flex-col shrink-0 z-20
          md:relative md:translate-x-0 md:block
          fixed top-[60px] bottom-0 left-0 transition-transform duration-200
          ${sideOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"}
        `}>
          {sideOpen && (
            <div className="fixed inset-0 bg-black/30 z-[-1] md:hidden" onClick={() => setSideOpen(false)} />
          )}
          <div className="p-3 flex-1">
            <div className="text-[10px] text-black/30 font-bold uppercase tracking-widest px-3 mb-2 mt-2">Навигация</div>
            {SIDEBAR.map(s => (
              <button
                key={s.key}
                onClick={() => setTab(s.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold mb-0.5 transition-colors ${
                  tab === s.key
                    ? "bg-[#7c3aed]/10 text-[#7c3aed]"
                    : "text-black/55 hover:bg-black/5 hover:text-black"
                }`}
              >
                <Icon name={s.icon} size={16} />
                {s.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-black/5">
            <Link to="/" className="flex items-center gap-2 text-xs text-black/30 hover:text-black/60 transition-colors">
              <Icon name="ArrowLeft" size={13} />
              Вернуться на сайт
            </Link>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 min-w-0 relative">
          {tab === "calendar" && <CalendarPage />}
          {tab === "venues" && <VenuesPage />}
        </main>
      </div>
    </div>
  );
}
