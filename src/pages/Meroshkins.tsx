import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import CalendarPage from "./meroshkins/CalendarPage";
import VenuesPage from "./meroshkins/VenuesPage";
import CollabPage from "./meroshkins/CollabPage";

type Tab = "calendar" | "venues" | "collab";

const NAV: { key: Tab; icon: string; label: string }[] = [
  { key: "calendar", icon: "CalendarDays", label: "Календарь" },
  { key: "venues",   icon: "MapPin",       label: "Площадки"  },
  { key: "collab",   icon: "Users",        label: "Доступ"    },
];

const APPLE = { fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" };

export default function Meroshkins() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mobileNav, setMobileNav] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/meroshkins/promo");
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center" style={APPLE}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7c3aed]/25">
            <Icon name="CalendarDays" size={22} className="text-white" />
          </div>
          <div className="w-4 h-4 border-2 border-[#7c3aed]/30 border-t-[#7c3aed] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const tab = (params.get("tab") as Tab) || "calendar";
  const setTab = (t: Tab) => { setParams({ tab: t }); setMobileNav(false); };

  const initials = user.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col" style={APPLE}>

      {/* ── TOP BAR ── */}
      <header
        className="sticky top-0 z-40 h-[52px] flex items-center px-4 md:px-6 gap-3"
        style={{
          background: "rgba(245,245,247,0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 -ml-1 rounded-xl hover:bg-black/5 transition-colors"
          onClick={() => setMobileNav(s => !s)}
        >
          <Icon name={mobileNav ? "X" : "Menu"} size={18} className="text-black/60" />
        </button>

        {/* Logo */}
        <Link to="/meroshkins/promo" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center shadow-sm">
            <Icon name="CalendarDays" size={13} className="text-white" />
          </div>
          <span className="text-[14px] font-semibold text-black hidden sm:block tracking-[-0.2px]">
            Мерошкинс
          </span>
        </Link>

        {/* Desktop tab pills */}
        <div className="hidden md:flex items-center gap-0.5 bg-black/5 rounded-xl p-0.5 ml-2">
          {NAV.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[13px] font-medium transition-all ${
                tab === n.key
                  ? "bg-white text-black shadow-sm shadow-black/10"
                  : "text-black/50 hover:text-black"
              }`}
            >
              <Icon name={n.icon} size={13} />
              {n.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Back to site */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1 text-[12px] text-black/35 hover:text-black/70 transition-colors"
        >
          <Icon name="Globe" size={12} />
          dabbl.ru
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(s => !s)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-black/6 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {initials}
            </div>
            <span className="text-[13px] font-medium text-black/70 hidden sm:block max-w-[120px] truncate">
              {user.full_name || user.email}
            </span>
            <Icon name="ChevronDown" size={12} className="text-black/30 hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div
                className="absolute right-0 top-10 w-52 z-50 rounded-2xl shadow-xl border border-black/8 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
              >
                <div className="px-4 py-3 border-b border-black/6">
                  <p className="text-[13px] font-semibold text-black truncate">{user.full_name || "Профиль"}</p>
                  <p className="text-[11px] text-black/40 truncate">{user.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/cabinet"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 text-[13px] text-black/70 hover:text-black transition-colors"
                  >
                    <Icon name="LayoutDashboard" size={14} />
                    Личный кабинет
                  </Link>
                  <button
                    onClick={() => { logout(); navigate("/meroshkins/promo"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-[13px] text-red-500 transition-colors"
                  >
                    <Icon name="LogOut" size={14} />
                    Выйти
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ── MOBILE NAV OVERLAY ── */}
        {mobileNav && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNav(false)} />
            <div
              className="absolute top-[52px] left-0 bottom-0 w-64 flex flex-col"
              style={{ background: "rgba(245,245,247,0.98)", backdropFilter: "blur(20px)" }}
            >
              <div className="p-3 flex-1">
                <p className="text-[10px] font-semibold text-black/30 uppercase tracking-[0.15em] px-3 mb-2 mt-1">
                  Разделы
                </p>
                {NAV.map(n => (
                  <button
                    key={n.key}
                    onClick={() => setTab(n.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium mb-0.5 transition-colors ${
                      tab === n.key ? "bg-[#7c3aed]/10 text-[#7c3aed]" : "text-black/60 hover:bg-black/5"
                    }`}
                  >
                    <Icon name={n.icon} size={16} />
                    {n.label}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-black/6">
                <Link to="/" className="flex items-center gap-2 text-[12px] text-black/35">
                  <Icon name="ArrowLeft" size={13} />
                  На сайт Даббл
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            {tab === "calendar" && <CalendarPage />}
            {tab === "venues"   && <VenuesPage />}
            {tab === "collab"   && <CollabPage />}
          </div>

          {/* ── FOOTER ── */}
          <footer className="border-t border-black/6 mt-8 py-6 px-4 md:px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center">
                  <Icon name="LayoutGrid" size={10} className="text-white" />
                </div>
                <span className="text-[12px] font-semibold text-black">Даббл</span>
              </Link>
              <p className="text-[11px] text-black/30 text-center">
                Проект входит в экосистему корпорации «Даббл» — 2026
              </p>
              <Link to="/meroshkins/promo" className="text-[11px] text-black/30 hover:text-black/60 transition-colors">
                О сервисе
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
