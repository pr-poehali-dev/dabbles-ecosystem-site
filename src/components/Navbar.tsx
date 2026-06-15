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

// Пилюли-сегменты
const SEGMENTS = ["Для всех", "Для бизнеса", "Для грантополучателей"];

// Сетка сервисов (правая иконка)
const SERVICES_GRID = [
  { icon: "CheckSquare", label: "Трекер", href: "" },
  { icon: "Compass", label: "Компас", href: "https://даббл-компас.рф" },
  { icon: "CalendarDays", label: "Мерошкинс", href: "/meroshkins" },
  { icon: "IdCard", label: "Даббл ID", href: "/id" },
];

// Главное меню разделов сайта
type MenuSection = {
  title: string;
  items: { label: string; href: string; icon: string; desc?: string }[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Компания",
    items: [
      { label: "О компании", href: "/about", icon: "Building2", desc: "Миссия и экосистема" },
      { label: "Организационная структура", href: "/about#structure", icon: "Network", desc: "Как устроена корпорация" },
      { label: "Генеральный директор", href: "/director", icon: "UserCog", desc: "Обращение руководителя" },
      { label: "Реквизиты", href: "/legal", icon: "Scale", desc: "Юридическая информация" },
    ],
  },
  {
    title: "Сервисы",
    items: [
      { label: "Мерошкинс", href: "/meroshkins", icon: "CalendarDays", desc: "Управление событиями" },
      { label: "Компас", href: "https://даббл-компас.рф", icon: "Compass", desc: "Путешествия" },
    ],
  },
  {
    title: "Ещё",
    items: [
      { label: "Партнёрам", href: "/vibe", icon: "Handshake", desc: "Сотрудничество" },
      { label: "Контакты", href: "#contacts", icon: "Mail", desc: "Связаться с нами" },
      { label: "Политика конфиденциальности", href: "/privacy", icon: "ShieldCheck" },
    ],
  },
];

export default function Navbar({ menuOpen, scrollTo, setMenuOpen, audience = "Для всех", setAudience }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const goLink = (href: string) => {
    setMenuOpen(false);
    setGridOpen(false);
    if (href.startsWith("http")) window.open(href, "_blank");
    else if (href.startsWith("#")) scrollTo(href);
    else if (href.includes("#")) {
      const [path, hash] = href.split("#");
      navigate(path);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else navigate(href);
  };

  return (
    <>
      {/* ОСНОВНАЯ ШАПКА — белая пилюля */}
      <div className="sticky top-0 z-50 px-3 md:px-5 pt-3 pb-2 bg-[#f0f0f5]/80 backdrop-blur-md">
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

          {/* МЕНЮ-кнопка (раскрывает меню разделов) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hidden md:flex items-center gap-2.5 pl-3 pr-1 shrink-0"
          >
            <div className="relative w-6 h-6 flex flex-col justify-center gap-[5px]">
              <span className={`block h-[2.5px] w-6 bg-black rounded-full transition-transform ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`block h-[2.5px] w-6 bg-black rounded-full transition-all ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`} />
              {!menuOpen && <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-full bg-[#FD4160]" />}
            </div>
            <span className="text-[15px] font-semibold text-black">Меню</span>
          </button>

          {/* СЕГМЕНТЫ — пилюли */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center bg-[#f5f5f7] rounded-2xl p-1 max-w-lg mx-2">
            {SEGMENTS.map((s) => (
              <button
                key={s}
                onClick={() => setAudience?.(s)}
                className={`flex-1 px-3 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                  audience === s ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* ПОИСК + КАБИНЕТ + СЕРВИСЫ */}
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

            {/* GRID — сервисы (4 квадратика) */}
            <div className="relative">
              <button
                onClick={() => setGridOpen(!gridOpen)}
                className="w-11 h-11 rounded-2xl border-2 border-[#0077FF]/30 flex items-center justify-center hover:bg-[#0077FF]/5 transition-colors text-[#0077FF]"
                title="Сервисы"
              >
                <Icon name="LayoutGrid" size={20} />
              </button>
              {gridOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGridOpen(false)} />
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-black/8 p-3 z-50">
                    <p className="text-[11px] font-bold text-black/35 uppercase tracking-wider px-1 mb-2">Сервисы Даббл</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SERVICES_GRID.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => goLink(s.href)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-black/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a0a6e]/10 to-[#0077FF]/10 flex items-center justify-center">
                            <Icon name={s.icon} size={18} className="text-[#0077FF]" />
                          </div>
                          <span className="text-[11px] text-black/55 font-medium leading-tight text-center">{s.label}</span>
                        </button>
                      ))}
                    </div>
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

      {/* ── РАСКРЫВАЮЩЕЕСЯ МЕНЮ РАЗДЕЛОВ ── */}
      {menuOpen && (
        <>
          {/* Затемнение (десктоп) */}
          <div
            className="hidden md:block fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />

          {/* DESKTOP — выпадающая панель */}
          <div className="hidden md:block fixed left-5 right-5 top-[80px] z-50 max-w-5xl mx-auto">
            <div className="bg-white rounded-[28px] shadow-2xl border border-black/6 p-8">
              <div className="grid grid-cols-3 gap-8">
                {MENU_SECTIONS.map((sec) => (
                  <div key={sec.title}>
                    <p className="text-[12px] font-bold text-[#0077FF] uppercase tracking-wider mb-4">{sec.title}</p>
                    <ul className="space-y-1">
                      {sec.items.map((it) => (
                        <li key={it.label}>
                          <button
                            onClick={() => goLink(it.href)}
                            className="w-full flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#f5f5f7] transition-colors text-left group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#f0f0f5] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                              <Icon name={it.icon} size={17} className="text-black/55" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-black leading-tight">{it.label}</div>
                              {it.desc && <div className="text-[12px] text-black/40 leading-tight mt-0.5">{it.desc}</div>}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-[88px] overflow-y-auto md:hidden">
          <div className="flex flex-col p-5 gap-1">
            {/* Сегменты */}
            <div className="flex gap-1 bg-[#f5f5f7] rounded-2xl p-1 mb-4">
              {SEGMENTS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setAudience?.(s); }}
                  className={`flex-1 px-2 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    audience === s ? "bg-white text-black shadow-sm" : "text-black/45"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {MENU_SECTIONS.map((sec) => (
              <div key={sec.title} className="mb-3">
                <p className="text-[11px] font-bold text-[#0077FF] uppercase tracking-wider px-2 mb-1.5">{sec.title}</p>
                {sec.items.map((it) => (
                  <button
                    key={it.label}
                    onClick={() => goLink(it.href)}
                    className="w-full flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-black/4 transition-colors text-left"
                  >
                    <Icon name={it.icon} size={18} className="text-black/45 shrink-0" />
                    <span className="text-[15px] font-medium text-black/80">{it.label}</span>
                  </button>
                ))}
              </div>
            ))}

            <Link
              to={user ? "/cabinet" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-white text-lg font-semibold"
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