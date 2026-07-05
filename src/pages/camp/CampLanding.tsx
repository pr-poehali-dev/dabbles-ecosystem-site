import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { campApi, CampProgram } from "@/lib/camp-api";

const LOGO = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/a4c91874-6ec5-442c-be38-6a949286b9b1.png";

const FEATURES = [
  { icon: "BookOpen", title: "Только текст — без видео", desc: "Читай материалы в своём темпе, без длинных лекций и потерянного времени" },
  { icon: "ListChecks", title: "Тесты по модулям", desc: "Проверяй знания после каждого модуля перед переходом дальше" },
  { icon: "Award", title: "Сертификат", desc: "Получи именной сертификат после успешного прохождения итогового теста" },
];

const LEVELS = ["Все", "Начальный", "Средний", "Продвинутый"];

const CARD_BG = [
  "linear-gradient(160deg, #EBD047 0%, #DAB332 100%)",
  "linear-gradient(160deg, #2d2d2d 0%, #000 100%)",
  "linear-gradient(160deg, #DAB332 0%, #8a6d1e 100%)",
];

export default function CampLanding() {
  const [programs, setPrograms] = useState<CampProgram[]>([]);
  const [level, setLevel] = useState("Все");

  useEffect(() => {
    campApi.programs().then((r) => setPrograms(r.programs)).catch(() => {});
  }, []);

  const filtered = level === "Все" ? programs : programs.filter((p) => p.level === level);

  return (
    <div className="min-h-screen bg-white text-black font-body">
      {/* ── ШАПКА ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/6">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/camp" className="flex items-center gap-2.5">
            <img src={LOGO} alt="Кэмп" className="h-9 w-9 rounded-xl" />
            <span className="font-display font-black text-xl tracking-tight">Кэмп</span>
          </Link>
          <Link
            to="/camp/login"
            className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-black transition-all hover:opacity-90"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
          >
            Войти
          </Link>
        </div>
      </header>

      {/* ── HERO ОБЛОЖКА ── */}
      <section className="px-3 md:px-5 pt-4">
        <div
          className="relative max-w-6xl mx-auto rounded-[40px] overflow-hidden px-6 md:px-10 pt-14 pb-16 md:pt-20 md:pb-20 text-center"
          style={{ background: "linear-gradient(135deg, #F6DE6A 0%, #DAB332 55%, #C79B26 100%)" }}
        >
          {/* декоративные эмодзи */}
          <span className="absolute left-[6%] top-[14%] text-[52px] md:text-[64px] rotate-[-12deg] select-none pointer-events-none drop-shadow-sm">📚</span>
          <span className="absolute right-[8%] top-[10%] text-[46px] md:text-[58px] rotate-[14deg] select-none pointer-events-none drop-shadow-sm">🎓</span>
          <span className="absolute left-[10%] bottom-[16%] text-[38px] md:text-[46px] rotate-[8deg] select-none pointer-events-none drop-shadow-sm hidden sm:block">✨</span>
          <span className="absolute right-[12%] bottom-[12%] text-[42px] md:text-[52px] rotate-[-10deg] select-none pointer-events-none drop-shadow-sm hidden sm:block">💡</span>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="font-display text-white text-[32px] md:text-[52px] font-black leading-[1.1] mb-6">
              Найди новую профессию<br />в Кэмпе
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link
                to="/camp/login?mode=register"
                className="py-3.5 px-7 rounded-2xl bg-black text-white font-bold text-[15px] text-center transition-all hover:opacity-90 hover:-translate-y-0.5"
              >
                Начать обучение
              </Link>
              <a
                href="#programs"
                className="py-3.5 px-7 rounded-2xl bg-white/90 text-black font-bold text-[15px] text-center transition-all hover:bg-white"
              >
                Смотреть программы
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6">
              <div>
                <p className="text-white font-display text-xl md:text-3xl font-black leading-tight">100%</p>
                <p className="text-white/70 text-[11px] md:text-[13px] mt-1">в текстовом формате</p>
              </div>
              <div>
                <p className="text-white font-display text-xl md:text-3xl font-black leading-tight">0</p>
                <p className="text-white/70 text-[11px] md:text-[13px] mt-1">видеолекций — только текст</p>
              </div>
              <div>
                <p className="text-white font-display text-xl md:text-3xl font-black leading-tight">1</p>
                <p className="text-white/70 text-[11px] md:text-[13px] mt-1">именной сертификат в конце</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── ПИЛЮЛИ-ФИЛЬТРЫ ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-6 md:-mt-7 relative z-10 flex items-center justify-center gap-2 flex-wrap">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-md ${
              level === l ? "bg-black text-white" : "bg-white text-black/70 hover:bg-black/5"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── ГОРИЗОНТАЛЬНАЯ ЛЕНТА ОБЛОЖЕК ── */}
      {programs.length > 0 && (
        <section className="pb-16 md:pb-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex gap-4 md:gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
              {programs.map((p, i) => (
                <Link
                  key={p.id}
                  to="/camp/login"
                  className="relative shrink-0 w-[210px] md:w-[260px] h-[320px] md:h-[380px] rounded-[28px] overflow-hidden snap-start group"
                  style={{ background: p.image_url ? undefined : CARD_BG[i % CARD_BG.length] }}
                >
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-black text-[11px] font-bold flex items-center gap-1">
                    <Icon name="BookOpenText" size={12} />
                    {p.duration_label || "Текстовый курс"}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="text-white/70 text-[11px] font-bold uppercase tracking-wider">{p.level}</span>
                    <h3 className="font-display text-white text-[18px] md:text-[20px] font-black leading-tight mt-1">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ПРЕИМУЩЕСТВА ── */}
      <section className="bg-black text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="font-display text-2xl md:text-3xl font-black mb-10 text-center">Как устроено обучение</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/5 rounded-3xl p-7">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
                >
                  <Icon name={f.icon} size={22} className="text-black" />
                </div>
                <h3 className="font-black text-lg mb-2">{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПРОГРАММЫ ── */}
      <section id="programs" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <h2 className="font-display text-2xl md:text-3xl font-black mb-3 text-center">
          {programs.length > 0 ? `${programs.length}+ программ для карьеры и жизни` : "Программы обучения"}
        </h2>
        <p className="text-black/45 text-center mb-8">Выбирай уровень и начинай прямо сегодня</p>

        {/* фильтр по уровню */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                level === l ? "bg-black text-white" : "bg-black/5 text-black/60 hover:bg-black/10"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-black/40">Программы скоро появятся</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to="/camp/login"
                className="rounded-3xl overflow-hidden border border-black/8 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className="relative h-40"
                  style={{ background: p.image_url ? undefined : "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="BookOpen" size={36} className="text-black/70" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-black text-[10px] font-bold">
                    Программа
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/50">{p.level}</span>
                    {p.duration_label && <span className="text-[10px] text-black/35">{p.duration_label}</span>}
                  </div>
                  <h3 className="font-black text-black text-[16px] mb-1.5">{p.title}</h3>
                  <p className="text-black/50 text-[13px] leading-relaxed line-clamp-2">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── ФУТЕР ── */}
      <footer className="border-t border-black/6 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="Кэмп" className="h-6 w-6 rounded-lg" />
            <span className="font-bold text-sm">Кэмп от Даббл.Образования</span>
          </div>
          <Link to="/" className="text-black/40 text-[13px] hover:text-black transition-colors">
            На главную Даббл →
          </Link>
        </div>
      </footer>
    </div>
  );
}