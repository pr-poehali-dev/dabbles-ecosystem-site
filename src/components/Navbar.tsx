import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";

interface NavbarProps {
  activeNav: string;
  menuOpen: boolean;
  scrollTo: (href: string) => void;
  setMenuOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: "О компании", href: "#about" },
  { label: "Продукты", href: "#products" },
  { label: "Инвесторам", href: "#initiatives" },
  { label: "Контакты", href: "#contacts" },
];

export default function Navbar({ menuOpen, scrollTo, setMenuOpen }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white border-b border-black/8 flex items-center">
        <div className="w-full flex items-center px-6 md:px-10 gap-6">
          {/* LOGO */}
          <button onClick={() => scrollTo("#hero")} className="shrink-0 flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл"
              className="h-8 w-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
          </button>

          {/* CENTER LINKS */}
          <ul className="hidden md:flex items-center gap-0 flex-1 justify-center">
            {NAV_ITEMS.map((l) => (
              <li key={l.href + l.label}>
                <button
                  onClick={() => scrollTo(l.href)}
                  className="px-4 py-2 text-[15px] text-black/60 hover:text-black font-medium transition-colors duration-150 whitespace-nowrap"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
            {searchOpen ? (
              <div className="flex items-center gap-2 border border-black/15 rounded-xl px-3 py-2 bg-black/3">
                <Icon name="Search" size={15} className="text-black/40" />
                <input
                  autoFocus
                  placeholder="Поиск..."
                  className="text-sm outline-none bg-transparent w-36 text-black placeholder-black/30"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                title="Поиск"
              >
                <Icon name="Search" size={20} />
              </button>
            )}

            {/* GRID ICON (как у Яндекса) */}
            <div className="relative">
              <button
                onClick={() => setGridOpen(!gridOpen)}
                className="p-2.5 rounded-xl hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                title="Сервисы"
              >
                <Icon name="LayoutGrid" size={20} />
              </button>
              {gridOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-black/8 p-3 grid grid-cols-3 gap-2">
                  {[
                    { icon: "Zap", label: "Про" },
                    { icon: "Globe", label: "Нетворк" },
                    { icon: "Layers", label: "Стэк" },
                    { icon: "BarChart3", label: "Аналитика" },
                    { icon: "Heart", label: "Инициативы" },
                    { icon: "Briefcase", label: "Карьера" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { scrollTo("#products"); setGridOpen(false); }}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center">
                        <Icon name={s.icon} size={18} className="text-black/60" />
                      </div>
                      <span className="text-[11px] text-black/50 font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CABINET / LOGIN */}
            <Link
              to={user ? "/cabinet" : "/login"}
              className="hidden md:flex items-center gap-2 ml-1 px-4 py-2 rounded-xl bg-black hover:bg-black/85 text-white text-sm font-semibold transition-colors"
            >
              <Icon name={user ? "User" : "LogIn"} size={15} />
              {user ? "Кабинет" : "Войти"}
            </Link>

            {/* MOBILE MENU */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-black/5 text-black/60"
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-[68px]">
          <div className="flex flex-col p-6 gap-1">
            {NAV_ITEMS.map((l) => (
              <button
                key={l.href + l.label}
                onClick={() => scrollTo(l.href)}
                className="text-left px-4 py-3 text-lg font-medium text-black/70 hover:text-black hover:bg-black/4 rounded-xl transition-colors"
              >
                {l.label}
              </button>
            ))}
            <Link
              to={user ? "/cabinet" : "/login"}
              className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-black text-white text-lg font-semibold"
            >
              <Icon name={user ? "User" : "LogIn"} size={18} />
              {user ? "Личный кабинет" : "Войти"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}