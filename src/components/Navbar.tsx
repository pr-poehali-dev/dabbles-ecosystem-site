import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";

interface NavbarProps {
  activeNav: string;
  menuOpen: boolean;
  scrollTo: (href: string) => void;
  setMenuOpen: (open: boolean) => void;
  audience?: string;
  setAudience?: (a: string) => void;
}

// Верхние табы — аудитории (как у Сбера, адаптировано под Даббл)
const TOP_AUDIENCES = ["Бизнесу", "Командам", "Разработчикам", "Партнёрам"];

// Пилюли-сегменты
const SEGMENTS = ["Для всех", "Для бизнеса", "Для команд"];

const SERVICES_GRID = [
  { icon: "CheckSquare", label: "Трекер", href: "" },
  { icon: "FileText", label: "Формус", href: "https://forms-dubble.ru" },
  { icon: "Compass", label: "Компас", href: "https://даббл-компас.рф" },
  { icon: "CalendarDays", label: "Мерошкинс", href: "/meroshkins" },
  { icon: "Briefcase", label: "Карьера", href: "" },
  { icon: "Building2", label: "О нас", href: "/about" },
  { icon: "Mail", label: "Контакты", href: "#contacts" },
];

export default function Navbar({ menuOpen, scrollTo, setMenuOpen, audience = "Для всех", setAudience }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* ВЕРХНЯЯ ТОНКАЯ ПОЛОСА — аудитории */}
      <div className="hidden md:flex justify-center pt-3 pb-1">
        <ul className="flex items-center gap-8">
          {TOP_AUDIENCES.map((a) => (
            <li key={a}>
              <button className="text-[15px] text-black/55 hover:text-black font-medium transition-colors">
                {a}
              </button>
            </li>
          ))}
          <li>
            <button className="text-[15px] text-black/55 hover:text-black font-medium transition-colors flex items-center gap-1">
              Ещё <Icon name="ChevronDown" size={14} />
            </button>
          </li>
        </ul>
      </div>

      {/* ОСНОВНАЯ ШАПКА — белая пилюля */}
      <div className="sticky top-0 z-50 px-3 md:px-5 pt-2 pb-2 bg-[#f0f0f5]/80 backdrop-blur-md">
        <nav className="bg-white rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] h-[64px] flex items-center px-3 md:px-4 gap-2 md:gap-3">
          {/* LOGO Даббл */}
          <button onClick={() => scrollTo("#hero")} className="shrink-0 flex items-center pl-2">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл"
              className="h-8 w-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
          </button>

          {/* МЕНЮ-кнопка */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hidden md:flex items-center gap-2.5 pl-3 pr-1 shrink-0"
          >
            <div className="relative w-6 h-6 flex flex-col justify-center gap-[5px]">
              <span className="block h-[2.5px] w-6 bg-black rounded-full" />
              <span className="block h-[2.5px] w-6 bg-black rounded-full" />
              <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-full bg-[#FD4160]" />
            </div>
            <span className="text-[15px] font-semibold text-black">Меню</span>
          </button>

          {/* СЕГМЕНТЫ — пилюли */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center bg-[#f5f5f7] rounded-2xl p-1 max-w-md mx-2">
            {SEGMENTS.map((s) => (
              <button
                key={s}
                onClick={() => setAudience?.(s)}
                className={`flex-1 px-4 py-2 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-all ${
                  audience === s ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* ПОИСК */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            {searchOpen ? (
              <div className="flex items-center gap-2 border border-black/10 rounded-2xl px-3 py-2 bg-[#f5f5f7]">
                <Icon name="Search" size={16} className="text-black/40" />
                <input
                  autoFocus
                  placeholder="Поиск..."
                  className="text-sm outline-none bg-transparent w-28 md:w-36 text-black placeholder-black/30"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-2xl hover:bg-black/5 transition-colors text-black/55 hover:text-black"
                title="Поиск"
              >
                <Icon name="Search" size={21} />
              </button>
            )}

            {/* Кабинет/Войти */}
            <Link
              to={user ? "/cabinet" : "/login"}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-[15px] font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(120deg, #1a0a6e 0%, #0077FF 100%)" }}
            >
              {user ? "Кабинет" : "Личный кабинет"}
            </Link>

            {/* GRID — сервисы / иконка профиля */}
            <div className="relative">
              <button
                onClick={() => setGridOpen(!gridOpen)}
                className="w-11 h-11 rounded-2xl border-2 border-[#0077FF]/30 flex items-center justify-center hover:bg-black/3 transition-colors text-black/60"
                title="Сервисы"
              >
                <Icon name="User" size={20} />
              </button>
              {gridOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGridOpen(false)} />
                  <div className="absolute right-0 top-13 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-black/8 p-3 grid grid-cols-3 gap-1.5 z-50">
                    {SERVICES_GRID.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          setGridOpen(false);
                          if (s.href.startsWith("http")) window.open(s.href, "_blank");
                          else if (s.href.startsWith("/")) navigate(s.href);
                          else if (s.href) scrollTo(s.href);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-black/5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#f0f0f5] flex items-center justify-center">
                          <Icon name={s.icon} size={18} className="text-black/60" />
                        </div>
                        <span className="text-[11px] text-black/55 font-medium leading-tight text-center">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* MOBILE MENU */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-2xl hover:bg-black/5 text-black/60"
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </nav>
      </div>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-[90px] md:hidden">
          <div className="flex flex-col p-6 gap-1">
            {TOP_AUDIENCES.map((a) => (
              <button
                key={a}
                className="text-left px-4 py-3 text-lg font-medium text-black/70 hover:text-black hover:bg-black/4 rounded-xl transition-colors"
              >
                {a}
              </button>
            ))}
            <div className="h-px bg-black/8 my-3" />
            {SEGMENTS.map((s) => (
              <button
                key={s}
                onClick={() => { setAudience?.(s); setMenuOpen(false); }}
                className={`text-left px-4 py-3 text-lg rounded-xl transition-colors ${
                  audience === s ? "bg-[#0077FF]/10 text-[#0077FF] font-semibold" : "text-black/60"
                }`}
              >
                {s}
              </button>
            ))}
            <Link
              to={user ? "/cabinet" : "/login"}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-white text-lg font-semibold"
              style={{ background: "linear-gradient(120deg, #1a0a6e 0%, #0077FF 100%)" }}
            >
              {user ? "Личный кабинет" : "Войти"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}