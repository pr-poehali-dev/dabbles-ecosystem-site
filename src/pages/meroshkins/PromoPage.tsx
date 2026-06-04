import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Icon from "@/components/ui/icon";

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
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
            <Icon name="CalendarDays" size={13} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-black/80">Мерошкинс</span>
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
        {!user && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[13px] text-black/30">Войти через:</span>
            <button
              onClick={() => navigate("/id/auth?client_id=meroshkins&redirect_uri=/meroshkins")}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 bg-white hover:bg-black/3 transition-colors text-[13px] font-medium text-black/70 shadow-sm"
            >
              <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center">
                <Icon name="LayoutGrid" size={9} className="text-white" />
              </div>
              Даббл ID
            </button>
            <button
              onClick={() => navigate("/id/auth?client_id=meroshkins&redirect_uri=/meroshkins")}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 bg-white hover:bg-black/3 transition-colors text-[13px] font-medium text-black/70 shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12.87 12.44H14.5L17.13 19H14.97L14.46 17.47H10.96L10.43 19H8.32L10.97 12.44H12.87ZM11.54 15.96H13.87L12.71 12.98L11.54 15.96ZM12 5C8.13 5 5 8.13 5 12C5 15.87 8.13 19 12 19C12.17 19 12.34 18.99 12.5 18.98V12.44H10.5V10.5H14.5V17.85C16.56 16.97 18 14.64 18 12C18 8.13 14.87 5 12 5Z" fill="#FF0000"/>
              </svg>
              Яндекс ID
            </button>
          </div>
        )}
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

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-black/8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Link to="/">
            <img src="/dabbl-logo.svg" alt="Даббл" className="h-5 opacity-40 hover:opacity-70 transition-opacity" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </Link>
        </div>
        <p className="text-black/30 text-[13px]">
          Проект входит в экосистему корпорации «Даббл» — 2026
        </p>
      </footer>
    </div>
  );
}