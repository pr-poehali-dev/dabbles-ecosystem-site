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

const SERVICES_GRID = [
  { icon: "CheckSquare", label: "Трекер", href: "" },
  { icon: "Compass", label: "Компас", href: "https://даббл-компас.рф" },
  { icon: "CalendarDays", label: "Мерошкинс", href: "/meroshkins" },
  { icon: "IdCard", label: "Даббл ID", href: "/id" },
  { icon: "Scale", label: "Юр сервис", href: "/client" },
];

type MenuSection = {
  title: string;
  items: { label: string; href: string; icon: string; desc?: string; disabled?: boolean }[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Компания",
    items: [
      { label: "О компании", href: "/about", icon: "Building2", desc: "Миссия и экосистема", disabled: true },
      { label: "Организационная структура", href: "/about#structure", icon: "Network", desc: "Как устроена корпорация", disabled: true },
      { label: "Генеральный директор", href: "/director", icon: "UserCog", desc: "Обращение руководителя", disabled: true },
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

export default function Navbar({ menuOpen, scrollTo, setMenuOpen, setAudience }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const goLink = (href: string) => {
    setMenuOpen(false);
    setGridOpen(false);
    if (!href) return;
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
      {/* ── ШАПКА — центрированная пилюля как на рефе ── */}
      <div className="sticky top-0 z-50 flex justify-center px-4 pt-3 pb-2 bg-[#edf5e0]/80 backdrop-blur-md">
        <nav className="bg-white rounded-[18px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] h-[60px] flex items-center px-4 gap-3 w-full max-w-3xl">

          {/* ЛОГО */}
          <button onClick={() => scrollTo("#hero")} className="shrink-0 flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/3bb7bd0c-31d8-44c0-85ef-0bd65a2a3961.png"
              alt="Даббл"
              className="h-8 w-auto object-contain"
            />
          </button>

          {/* МЕНЮ-кнопка (десктоп) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-black/5 transition-colors shrink-0"
          >
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <span className={`block h-[2px] w-5 bg-black rounded-full transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-[2px] w-5 bg-black rounded-full transition-all duration-200 ${menuOpen ? "-translate-y-[9px] -rotate-45" : ""}`} />
              {!menuOpen && <span className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-[#FD4160]" />}
            </div>
            <span className="text-[14px] font-semibold text-black">Меню</span>
          </button>

          {/* ПОИСК — по центру */}
          <div className="flex-1 mx-2">
            {searchOpen ? (
              <div className="flex items-center gap-2 border border-black/12 rounded-[14px] px-3 py-2 bg-[#f5f5f7]">
                <Icon name="Search" size={15} className="text-black/40 shrink-0" />
                <input
                  autoFocus
                  placeholder="Поиск..."
                  className="text-[14px] outline-none bg-transparent w-full text-black placeholder-black/30"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-[14px] bg-[#f5f5f7] text-black/35 hover:bg-black/8 transition-colors text-[14px]"
              >
                <Icon name="Search" size={15} />
                <span className="hidden sm:inline">Ищете что-то конкретное?</span>
              </button>
            )}
          </div>

          {/* ПРАВАЯ ЧАСТЬ: зелёная кнопка + иконка ЛК */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Зелёная кнопка CTA */}
            <Link
              to={user ? "/cabinet" : "/login"}
              className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-[14px] text-black text-[14px] font-bold transition-all hover:opacity-90 whitespace-nowrap"
              style={{ background: "linear-gradient(120deg, #9FC96D 0%, #C1F089 100%)" }}
            >
              {user ? "Кабинет" : "Обучайся с нами!"}
            </Link>

            {/* Иконка человечка — ЛК */}
            <Link
              to={user ? "/cabinet" : "/login"}
              className="w-10 h-10 rounded-[14px] bg-[#f5f5f7] flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
              title={user ? "Личный кабинет" : "Войти"}
            >
              <Icon name="User" size={18} />
            </Link>

            {/* Сетка сервисов */}
            <div className="relative">
              <button
                onClick={() => setGridOpen(!gridOpen)}
                className="w-10 h-10 rounded-[14px] bg-[#f5f5f7] flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
                title="Сервисы"
              >
                <Icon name="LayoutGrid" size={18} />
              </button>
              {gridOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGridOpen(false)} />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-black/8 p-3 z-50">
                    <p className="text-[11px] font-bold text-black/35 uppercase tracking-wider px-1 mb-2">Сервисы Даббл</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SERVICES_GRID.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => goLink(s.href)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-black/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#f0f8e8] flex items-center justify-center">
                            <Icon name={s.icon} size={18} className="text-[#5a9a2a]" />
                          </div>
                          <span className="text-[11px] text-black/55 font-medium leading-tight text-center">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Бургер мобилка */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 rounded-[14px] bg-[#f5f5f7] flex items-center justify-center text-black/60"
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={18} />
            </button>
          </div>
        </nav>
      </div>

      {/* ── РАСКРЫВАЮЩЕЕСЯ МЕНЮ ── */}
      {menuOpen && (
        <>
          <div
            className="hidden md:block fixed inset-0 z-40 bg-black/15 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />

          {/* DESKTOP — центрированная панель */}
          <div className="hidden md:flex fixed left-0 right-0 top-[76px] z-50 justify-center px-4">
            <div className="bg-white rounded-[24px] shadow-2xl border border-black/6 p-7 w-full max-w-3xl">
              <div className="grid grid-cols-3 gap-6">
                {MENU_SECTIONS.map((sec) => (
                  <div key={sec.title}>
                    <p className="text-[11px] font-bold text-[#5a9a2a] uppercase tracking-wider mb-3">{sec.title}</p>
                    <ul className="space-y-0.5">
                      {sec.items.map((it) => (
                        <li key={it.label}>
                          <button
                            onClick={() => !it.disabled && goLink(it.href)}
                            disabled={it.disabled}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-xl transition-colors text-left group ${it.disabled ? "opacity-35 cursor-not-allowed" : "hover:bg-[#f5f5f7]"}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#f0f8e8] flex items-center justify-center shrink-0">
                              <Icon name={it.icon} size={15} className="text-[#5a9a2a]" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-black leading-tight">{it.label}</div>
                              {it.desc && (
                                <div className="text-[11px] text-black/40 leading-tight mt-0.5">
                                  {it.disabled ? "Скоро" : it.desc}
                                </div>
                              )}
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

          {/* MOBILE */}
          <div className="fixed inset-0 z-40 bg-white flex flex-col pt-[80px] overflow-y-auto md:hidden">
            <div className="flex flex-col p-5 gap-1">
              {MENU_SECTIONS.map((sec) => (
                <div key={sec.title} className="mb-3">
                  <p className="text-[11px] font-bold text-[#5a9a2a] uppercase tracking-wider px-2 mb-1.5">{sec.title}</p>
                  {sec.items.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => !it.disabled && goLink(it.href)}
                      disabled={it.disabled}
                      className={`w-full flex items-center gap-3 px-2 py-3 rounded-xl transition-colors text-left ${it.disabled ? "opacity-35 cursor-not-allowed" : "hover:bg-black/4"}`}
                    >
                      <Icon name={it.icon} size={18} className="text-[#5a9a2a] shrink-0" />
                      <div>
                        <span className="text-[15px] font-medium text-black/80">{it.label}</span>
                        {it.disabled && <span className="ml-2 text-[11px] text-black/30">Скоро</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              <Link
                to={user ? "/cabinet" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-black text-lg font-bold"
                style={{ background: "linear-gradient(120deg, #9FC96D 0%, #C1F089 100%)" }}
              >
                {user ? "Личный кабинет" : "Обучайся с нами!"}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
