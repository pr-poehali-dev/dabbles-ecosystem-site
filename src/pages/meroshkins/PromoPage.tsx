import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Icon from "@/components/ui/icon";
import MeroshkinsFooter from "@/components/MeroshkinsFooter";

const FEATURES = [
  { icon: "CalendarDays", title: "Единый календарь", desc: "Все мероприятия в одном месте. Месячный, недельный и дневной вид." },
  { icon: "MapPin", title: "Площадки и залы", desc: "Управляйте всеми площадками и залами. Вместимость, статус — всё под рукой." },
  { icon: "Users", title: "Командный доступ", desc: "Приглашайте коллег как соавторов. Совместное редактирование без конфликтов." },
  { icon: "FileText", title: "Пресс-релизы", desc: "Автоматическая генерация постов на основе описания мероприятия." },
  { icon: "Share2", title: "Публичные ссылки", desc: "Поделитесь расписанием с партнёрами. Гость видит календарь только для чтения." },
  { icon: "FileDown", title: "Экспорт в PDF", desc: "Выгрузите расписание мероприятий за месяц или неделю одним нажатием." },
];

const STEPS = [
  { n: "01", title: "Войдите через Даббл ID", desc: "Единая учётная запись для всех сервисов экосистемы Даббл." },
  { n: "02", title: "Добавьте площадки и залы", desc: "Один раз настройте список ваших пространств." },
  { n: "03", title: "Создайте мероприятие", desc: "Кликните на день в календаре и заполните карточку." },
  { n: "04", title: "Управляйте командой", desc: "Пригласите коллег и распределите ответственность." },
];

const MOCK_EVENTS: Record<number, { label: string; color: string }[]> = {
  3:  [{ label: "Конференция", color: "#0077FF" }],
  10: [{ label: "Тренинг", color: "#10b981" }, { label: "Выставка", color: "#f59e0b" }],
  15: [{ label: "Корпоратив", color: "#FD4160" }],
  22: [{ label: "Мастер-класс", color: "#7c3aed" }],
  28: [{ label: "Выставка", color: "#f59e0b" }],
};

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
      <nav className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center px-4 md:px-12"
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
      <section className="pt-[80px] md:pt-[100px] pb-10 md:pb-20 px-4 md:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-[12px] font-semibold mb-5">
          <Icon name="Sparkles" size={12} />
          Система управления мероприятиями
        </div>
        <h1 className="text-[36px] md:text-[72px] font-black text-black leading-[1.05] tracking-[-1.5px] md:tracking-[-2px] mb-4 md:mb-6 max-w-4xl mx-auto">
          Управляйте<br className="md:hidden" /> мероприятиями<br />
          <span className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] bg-clip-text text-transparent">профессионально</span>
        </h1>
        <p className="text-[16px] md:text-[22px] text-black/55 max-w-xl mx-auto leading-relaxed mb-8 md:mb-10 px-2">
          Единый центр для всех ваших событий, площадок и команды.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 md:mb-6 px-4">
          <button
            onClick={handleOpen}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#7c3aed] text-white font-semibold text-[16px] md:text-[17px] hover:bg-[#6d28d9] transition-all active:scale-[0.98] shadow-lg shadow-[#7c3aed]/30">
            {user ? "Открыть Мерошкинс" : "Начать бесплатно"}
          </button>
          <a href="#features"
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full bg-black/6 text-black font-semibold text-[16px] md:text-[17px] hover:bg-black/10 transition-colors">
            Узнать больше
          </a>
        </div>
      </section>

      {/* PREVIEW MOCKUP */}
      <section className="px-4 md:px-6 pb-16 md:pb-24 max-w-5xl mx-auto">
        <div className="rounded-[20px] md:rounded-[24px] overflow-hidden shadow-2xl shadow-black/15 border border-black/5"
          style={{ background: "linear-gradient(135deg, #1a0a6e 0%, #4f46e5 50%, #7c3aed 100%)" }}>

          {/* Browser bar — только на десктопе */}
          <div className="hidden md:flex bg-white/8 backdrop-blur-sm p-4 items-center gap-2 border-b border-white/10">
            <div className="flex gap-1.5">
              {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/15 rounded-md px-4 py-1 text-white/60 text-[11px]">dabbl.ru/meroshkins</div>
            </div>
          </div>

          <div className="p-4 md:p-10">
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="text-white font-black text-base md:text-xl">Июнь 2026</div>
              <div className="flex gap-1.5 md:gap-2">
                {["Месяц","Неделя","День"].map(v => (
                  <div key={v} className={`px-2 md:px-3 py-1 rounded-lg text-[11px] md:text-xs font-semibold ${v === "Месяц" ? "bg-white text-[#7c3aed]" : "text-white/50"}`}>{v}</div>
                ))}
              </div>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-0.5 md:mb-1">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => (
                <div key={d} className="text-center text-white/40 text-[9px] md:text-[10px] font-semibold py-1">{d}</div>
              ))}
            </div>

            {/* Сетка дней */}
            <div className="grid grid-cols-7 gap-0.5 md:gap-1">
              {[
                null,null,1,2,3,4,5,
                6,7,8,9,10,11,12,
                13,14,15,16,17,18,19,
                20,21,22,23,24,25,26,
                27,28,29,30,null,null,null,
              ].map((d, i) => (
                <div key={i} className={`rounded-lg md:rounded-xl p-1 md:p-1.5 min-h-[40px] md:min-h-[52px] ${d ? "bg-white/8" : ""}`}>
                  {d && (
                    <>
                      <div className={`text-[9px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full mb-0.5 md:mb-1 ${d === 4 ? "bg-white text-[#7c3aed]" : "text-white/60"}`}>{d}</div>
                      {/* На мобилке только точки, на десктопе — названия */}
                      <div className="flex flex-wrap gap-0.5 md:hidden">
                        {(MOCK_EVENTS[d] || []).map((ev, j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: ev.color }} />
                        ))}
                      </div>
                      <div className="hidden md:block">
                        {(MOCK_EVENTS[d] || []).map((ev, j) => (
                          <div key={j} className="text-[8px] text-white font-semibold px-1 py-0.5 rounded mb-0.5 truncate" style={{ background: ev.color + "99" }}>{ev.label}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* На мобилке — легенда событий под календарём */}
            <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {Object.entries(MOCK_EVENTS).flatMap(([, evs]) => evs).filter((ev, i, arr) => arr.findIndex(e => e.label === ev.label) === i).map((ev, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
                  <span className="text-white/70 text-[12px] font-medium">{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <div className="text-[#7c3aed] text-[12px] md:text-[13px] font-semibold uppercase tracking-widest mb-3">Возможности</div>
            <h2 className="text-[32px] md:text-[52px] font-black text-black tracking-[-1.5px] leading-tight">
              Всё нужное —<br />ничего лишнего
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-5 md:p-6 rounded-[18px] md:rounded-[20px] bg-[#f5f5f7] hover:bg-[#ede9ff] transition-colors group">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#7c3aed]/20 transition-colors">
                  <Icon name={f.icon} size={18} className="text-[#7c3aed]" />
                </div>
                <h3 className="font-bold text-black text-[15px] md:text-[17px] mb-1.5 md:mb-2 tracking-[-0.3px]">{f.title}</h3>
                <p className="text-black/50 text-[14px] md:text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <div className="text-[#7c3aed] text-[12px] md:text-[13px] font-semibold uppercase tracking-widest mb-3">Быстрый старт</div>
            <h2 className="text-[32px] md:text-[48px] font-black text-black tracking-[-1.5px]">Начните за 4 шага</h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-4 md:gap-6 p-5 md:p-6 rounded-[18px] md:rounded-[20px] bg-white border border-black/5 hover:border-[#7c3aed]/20 transition-colors">
                <div className="text-[#7c3aed]/30 font-black text-[24px] md:text-[28px] leading-none w-10 md:w-12 shrink-0">{s.n}</div>
                <div className="min-w-0">
                  <div className="font-bold text-black text-[15px] md:text-[17px] mb-1 tracking-[-0.3px]">{s.title}</div>
                  <div className="text-black/50 text-[14px] md:text-[15px]">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1a0a6e] to-[#7c3aed] rounded-[24px] md:rounded-[32px] p-8 md:p-12">
          <h2 className="text-[28px] md:text-[48px] font-black text-white tracking-[-1.5px] mb-3 md:mb-4">
            Готовы начать?
          </h2>
          <p className="text-white/60 text-[15px] md:text-[17px] mb-6 md:mb-8 leading-relaxed">
            Войдите через Даббл ID и создайте своё первое мероприятие прямо сейчас.
          </p>
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-2 px-7 md:px-8 py-3 md:py-3.5 rounded-full bg-white text-[#7c3aed] font-semibold text-[16px] md:text-[17px] hover:bg-white/90 transition-all active:scale-[0.98]">
            <Icon name="CalendarDays" size={18} />
            {user ? "Открыть Мерошкинс" : "Войти и начать"}
          </button>
        </div>
      </section>

      <MeroshkinsFooter />
    </div>
  );
}