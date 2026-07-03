import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { campApi, CampProgram } from "@/lib/camp-api";

const LOGO = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/a4c91874-6ec5-442c-be38-6a949286b9b1.png";

const FEATURES = [
  { icon: "BookOpen", title: "Лекции и материалы", desc: "Структурированные модули с текстом, видео и файлами для изучения" },
  { icon: "ListChecks", title: "Тесты по модулям", desc: "Проверяй знания после каждого модуля перед переходом дальше" },
  { icon: "Award", title: "Сертификат", desc: "Получи именной сертификат после успешного прохождения итогового теста" },
];

export default function CampLanding() {
  const [programs, setPrograms] = useState<CampProgram[]>([]);

  useEffect(() => {
    campApi.programs().then((r) => setPrograms(r.programs)).catch(() => {});
  }, []);

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

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-[12px] font-bold mb-5">
              <Icon name="GraduationCap" size={14} />
              Даббл.Образование
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black leading-[1.08] mb-5">
              Кэмп — учись,<br />
              проходи тесты,<br />
              <span style={{ color: "#DAB332" }}>получай сертификат</span>
            </h1>
            <p className="text-black/55 text-[16px] md:text-[18px] leading-relaxed mb-8 max-w-md">
              Образовательная платформа Даббл. Изучай программы, проверяй себя тестами и подтверждай навыки сертификатом.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/camp/login?mode=register"
                className="py-3.5 px-7 rounded-2xl text-black font-bold text-[15px] text-center transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
              >
                Начать обучение
              </Link>
              <a
                href="#programs"
                className="py-3.5 px-7 rounded-2xl bg-black/5 text-black font-bold text-[15px] text-center transition-all hover:bg-black/10"
              >
                Смотреть программы
              </a>
            </div>
          </div>
          <div className="relative">
            <div
              className="rounded-[32px] p-10 md:p-14 flex items-center justify-center"
              style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)", minHeight: 320 }}
            >
              <img src={LOGO} alt="Кэмп" className="w-40 h-40 md:w-48 md:h-48 rounded-[28px] shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

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
        <h2 className="font-display text-2xl md:text-3xl font-black mb-10 text-center">Программы обучения</h2>
        {programs.length === 0 ? (
          <p className="text-center text-black/40">Программы скоро появятся</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {programs.map((p) => (
              <Link
                key={p.id}
                to="/camp/login"
                className="rounded-3xl overflow-hidden border border-black/8 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ background: p.image_url ? undefined : "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="BookOpen" size={36} className="text-black/70" />
                  )}
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
