import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Icon from "@/components/ui/icon";
import CookieBanner from "@/components/CookieBanner";

const FEATURES = [
  {
    icon: "CalendarDays",
    title: "Единый календарь",
    desc: "Все мероприятия в одном месте. Месячный, недельный и дневной вид. Фильтры по залам, типам и ответственным.",
  },
  {
    icon: "MapPin",
    title: "Площадки и залы",
    desc: "Управляйте всеми площадками и залами. Вместимость, оснащение, статус — всё под рукой.",
  },
  {
    icon: "Users",
    title: "Командный доступ",
    desc: "Приглашайте коллег как соавторов. Совместное редактирование без конфликтов.",
  },
  {
    icon: "FileText",
    title: "Пресс-релизы",
    desc: "Автоматическая генерация постов и пресс-релизов на основе описания мероприятия.",
  },
  {
    icon: "Share2",
    title: "Публичные ссылки",
    desc: "Поделитесь расписанием с партнёрами. Гость видит календарь только для чтения.",
  },
  {
    icon: "FileDown",
    title: "Экспорт в PDF",
    desc: "Выгрузите расписание мероприятий за месяц или неделю одним нажатием.",
  },
];

const STEPS = [
  { n: "01", title: "Войдите через Даббл ID", desc: "Единая учётная запись для всех сервисов экосистемы Даббл." },
  { n: "02", title: "Добавьте площадки и залы", desc: "Один раз настройте список ваших пространств." },
  { n: "03", title: "Создайте мероприятие", desc: "Кликните на день в календаре и заполните карточку." },
  { n: "04", title: "Управляйте командой", desc: "Пригласите коллег и распределите ответственность." },
];

export default function PromoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpen = () => {
    if (user) navigate("/meroshkins");
    else navigate("/id/auth?client_id=meroshkins&redirect_uri=/meroshkins");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-body" style={{ fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center px-6 md:px-12"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "saturate(180%) blur(20px)", borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>
        <Link to="/">
          <img src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/459fbb05-4d8d-4609-851d-04611bbbaadc.png" alt="Мерошкинс" className="h-6 w-auto" />
        </Link>
        <div className="flex-1" />
        <button onClick={handleOpen} className="px-4 py-1.5 rounded-full bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] transition-colors">
          {user ? "Открыть" : "Войти"}
        </button>
      </nav>

      {/* HERO */}
      <section className="pt-[100px] pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c3aed]/10 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
          <span className="text-[#7c3aed] text-[12px] font-semibold tracking-wide uppercase">Даббл · Мерошкинс</span>
        </div>

        <h1 className="text-[42px] md:text-[72px] font-black text-black leading-[1.05] tracking-[-2px] mb-6 max-w-4xl mx-auto">
          Управляйте мероприятиями<br />
          <span className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] bg-clip-text text-transparent">профессионально</span>
        </h1>
        <p className="text-[18px] md:text-[22px] text-black/55 max-w-xl mx-auto leading-relaxed mb-10">
          Единый центр для всех ваших событий, площадок и команды. Как личный интерактивный ежедневник профессионала.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
          <button
            onClick={handleOpen}
            className="px-8 py-3.5 rounded-full bg-[#7c3aed] text-white font-semibold text-[17px] hover:bg-[#6d28d9] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#7c3aed]/30">
            {user ? "Открыть Мерошкинс" : "Начать бесплатно"}
          </button>
          <a href="#features"
            className="px-8 py-3.5 rounded-full bg-black/6 text-black font-semibold text-[17px] hover:bg-black/10 transition-colors">
            Узнать больше
          </a>
        </div>

      </section>

      {/* PREVIEW MOCKUP */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="rounded-[24px] overflow-hidden shadow-2xl shadow-black/15 border border-black/5"
          style={{ background: "linear-gradient(135deg, #1a0a6e 0%, #4f46e5 50%, #7c3aed 100%)" }}>
          <div className="bg-white/8 backdrop-blur-sm p-4 flex items-center gap-2 border-b border-white/10">
            <div className="flex gap-1.5">
              {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/15 rounded-md px-4 py-1 text-white/60 text-[11px]">dabbl.ru/meroshkins</div>
            </div>
          </div>
          <div className="p-6 md:p-10">
            {/* Mini calendar mockup */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-white font-black text-xl">Июнь 2026</div>
              <div className="flex gap-2">
                {["Месяц","Неделя","День"].map(v => (
                  <div key={v} className={`px-3 py-1 rounded-lg text-xs font-semibold ${v === "Месяц" ? "bg-white text-[#7c3aed]" : "text-white/50"}`}>{v}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                <div key={d} className="text-center text-white/40 text-[10px] font-semibold py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[
                null,null,1,2,3,4,5,
                6,7,8,9,10,11,12,
                13,14,15,16,17,18,19,
                20,21,22,23,24,25,26,
                27,28,29,30,null,null,null,
              ].map((d, i) => {
                const events: Record<number, { label: string; color: string }[]> = {
                  3: [{ label: "Конференция", color: "#0077FF" }],
                  10: [{ label: "Тренинг", color: "#10b981" }, { label: "Выставка", color: "#f59e0b" }],
                  15: [{ label: "Корпоратив", color: "#FD4160" }],
                  22: [{ label: "Мастер-класс", color: "#7c3aed" }],
                  28: [{ label: "Выставка", color: "#f59e0b" }],
                };
                return (
                  <div key={i} className={`rounded-xl p-1.5 min-h-[52px] ${d ? "bg-white/8 hover:bg-white/15 transition-colors" : ""}`}>
                    {d && (
                      <>
                        <div className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${d === 4 ? "bg-white text-[#7c3aed]" : "text-white/60"}`}>{d}</div>
                        {(events[d] || []).map((ev, j) => (
                          <div key={j} className="text-[8px] text-white font-semibold px-1 py-0.5 rounded mb-0.5 truncate" style={{ background: ev.color + "99" }}>{ev.label}</div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#7c3aed] text-[13px] font-semibold uppercase tracking-widest mb-3">Возможности</div>
            <h2 className="text-[38px] md:text-[52px] font-black text-black tracking-[-1.5px] leading-tight">
              Всё нужное —<br />ничего лишнего
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-[20px] bg-[#f5f5f7] hover:bg-[#ede9ff] transition-colors group">
                <div className="w-11 h-11 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center mb-4 group-hover:bg-[#7c3aed]/20 transition-colors">
                  <Icon name={f.icon} size={20} className="text-[#7c3aed]" />
                </div>
                <h3 className="font-bold text-black text-[17px] mb-2 tracking-[-0.3px]">{f.title}</h3>
                <p className="text-black/50 text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#7c3aed] text-[13px] font-semibold uppercase tracking-widest mb-3">Быстрый старт</div>
            <h2 className="text-[38px] md:text-[48px] font-black text-black tracking-[-1.5px]">Начните за 4 шага</h2>
          </div>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-[20px] bg-white border border-black/5 hover:border-[#7c3aed]/20 transition-colors">
                <div className="text-[#7c3aed]/30 font-black text-[28px] leading-none w-12 shrink-0">{s.n}</div>
                <div>
                  <div className="font-bold text-black text-[17px] mb-1 tracking-[-0.3px]">{s.title}</div>
                  <div className="text-black/50 text-[15px]">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1a0a6e] to-[#7c3aed] rounded-[32px] p-12">
          <h2 className="text-[36px] md:text-[48px] font-black text-white tracking-[-1.5px] mb-4">
            Готовы начать?
          </h2>
          <p className="text-white/60 text-[17px] mb-8">Войдите через Даббл ID и создайте своё первое мероприятие прямо сейчас.</p>
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#7c3aed] font-semibold text-[17px] hover:bg-white/90 transition-all hover:scale-[1.02]">
            <Icon name="CalendarDays" size={18} />
            {user ? "Открыть Мерошкинс" : "Войти и начать"}
          </button>
        </div>
      </section>

      <CookieBanner />

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-black/8">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-5">
          <Link to="/">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/8489822e-aa5c-49c6-a97a-5134c5f5b338.png"
              alt="Даббл Крауд"
              className="h-8 w-auto opacity-50 hover:opacity-80 transition-opacity"
            />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="text-[12px] text-black/35 hover:text-black/60 transition-colors">Политика конфиденциальности</Link>
            <span className="text-black/15 text-[12px]">·</span>
            <Link to="/legal" className="text-[12px] text-black/35 hover:text-black/60 transition-colors">Реквизиты и юридическая информация</Link>
            <span className="text-black/15 text-[12px]">·</span>
            <a href="mailto:info@dabbl.ru" className="text-[12px] text-black/35 hover:text-black/60 transition-colors">info@dabbl.ru</a>
          </div>
          <p className="text-black/20 text-[11px] text-center">
            © 2026 ООО «Даббл Рус». Сервис Мерошкинс входит в экосистему Даббл Крауд.
          </p>
        </div>
      </footer>
    </div>
  );
}

function YandexIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#FC3F1D"/>
      <path d="M13.4 7.2H12.3C11.1 7.2 10.4 7.8 10.4 8.9C10.4 10.1 10.9 10.7 11.9 11.4L13 12.1L10.3 16.8H8.5L11 12.4C9.7 11.5 9 10.5 9 8.9C9 7 10.2 5.8 12.2 5.8H15V16.8H13.4V7.2Z" fill="white"/>
    </svg>
  );
}