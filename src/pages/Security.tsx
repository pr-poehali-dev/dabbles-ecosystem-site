import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";

const LOGO_URL = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/2ede612a-f390-4cb5-ba31-5fe12cd283c1.png";
const NEURAL_BG = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/21df7a33-73dd-4e18-a8b2-eadb81d1272a.jpg";
const FACE_SCAN = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/20124642-3bda-4783-bb98-c1c3da01782d.jpg";
const SHIELD_NODES = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/642f972d-c45b-4d1a-a1b8-767763fa06cf.jpg";
const HERO_ILLUSTRATION = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/30cc5606-4eae-40b0-8f39-3660c6aa14a8.jpg";

const ORANGE = "#F2A672";

const SINC_STEPS = [
  {
    icon: "UserPlus",
    title: "Регистрация участника",
    desc: "Гость оставляет заявку на аккредитацию — вводит базовые данные для участия в мероприятии.",
  },
  {
    icon: "ScanFace",
    title: "Формирование цифрового портрета",
    desc: "Нейросеть Sinc.all анализирует данные и создаёт цифровой профиль потенциального участника.",
  },
  {
    icon: "Globe",
    title: "Сверка с открытыми источниками",
    desc: "Система сопоставляет портрет с открытыми данными из интернета и публичных баз.",
  },
  {
    icon: "AlertTriangle",
    title: "Оценка уровня риска",
    desc: "Алгоритм вычисляет потенциально опасных участников по совокупности признаков.",
  },
  {
    icon: "ShieldOff",
    title: "Решение по аккредитации",
    desc: "Участники с высоким риском не допускаются до аккредитации на мероприятие.",
  },
];

const DIRECTIONS = [
  {
    icon: "Fingerprint",
    title: "Контроль доступа и аккредитация",
    desc: "Многоуровневая проверка гостей, спикеров и подрядчиков перед допуском на площадку.",
  },
  {
    icon: "Camera",
    title: "Видеонаблюдение и мониторинг",
    desc: "Круглосуточный контроль периметра и ключевых зон на всех объектах компании.",
  },
  {
    icon: "Lock",
    title: "Защита данных",
    desc: "Шифрование, разграничение доступа и регулярный аудит информационных систем.",
  },
  {
    icon: "SearchCheck",
    title: "Проверка контрагентов",
    desc: "Due diligence партнёров и подрядчиков перед началом сотрудничества.",
  },
  {
    icon: "Siren",
    title: "Реагирование на инциденты",
    desc: "Отработанные регламенты и дежурная служба для быстрой реакции на любые угрозы.",
  },
  {
    icon: "GraduationCap",
    title: "Обучение персонала",
    desc: "Регулярные тренинги по кибергигиене и действиям в нештатных ситуациях.",
  },
  {
    icon: "Handshake",
    title: "Взаимодействие с органами",
    desc: "Отлаженная координация с правоохранительными и профильными государственными структурами.",
  },
  {
    icon: "FileCheck2",
    title: "Соответствие 152-ФЗ",
    desc: "Обработка персональных данных строго в рамках требований российского законодательства.",
  },
  {
    icon: "ShieldCheck",
    title: "Антифрод-мониторинг",
    desc: "Автоматическое выявление подозрительной активности и мошеннических схем.",
  },
];

const STATS = [
  { value: "50+", label: "крупных мероприятий" },
  { value: "120 000+", label: "проверенных участников" },
  { value: "24/7", label: "мониторинг безопасности" },
  { value: "99.9%", label: "точность выявления рисков" },
];

function FloatingOrbs() {
  return (
    <>
      <div
        className="absolute top-10 right-[8%] w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${ORANGE}22`, animation: "floatSlow 9s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-0 left-[5%] w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${ORANGE}18`, animation: "floatSlow 11s ease-in-out infinite reverse" }}
      />
    </>
  );
}

export default function Security() {
  return (
    <div className="min-h-screen bg-white text-black font-body overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-black/95 backdrop-blur-lg border-b border-white/10 flex items-center px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>
        <div className="flex-1 flex justify-center items-center gap-2.5">
          <div className="bg-white rounded-xl p-1.5 flex items-center justify-center">
            <img src={LOGO_URL} alt="Корпоративная безопасность" className="h-6 w-auto object-contain" />
          </div>
          <span className="hidden sm:inline text-white/70 text-xs font-semibold uppercase tracking-[0.2em]">
            Корпоративная безопасность
          </span>
        </div>
        <div className="w-24" />
      </nav>

      <div className="pt-[68px]">
        {/* HERO */}
        <section className="relative bg-black overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src={NEURAL_BG} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
          <FloatingOrbs />

          <div className="relative max-w-5xl mx-auto px-5 md:px-10 pt-14 md:pt-20 pb-0">
            <FadeIn>
              <div className="flex items-center gap-2 text-white/35 text-sm mb-8">
                <span>Даббл — технологии для бизнеса</span>
                <Icon name="ChevronRight" size={14} />
                <span>Департамент корпоративной безопасности</span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-[1.08] mb-6 max-w-3xl">
                Безопасность, которая влияет на доверие, репутацию и рост компании
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="text-white/55 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
                Технологические системы на основе нейросетей. Проверяем участников, партнёров и данные на каждом
                этапе. Оперативно реагируем, если узнали об угрозе.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <a
                href="#sinc-all"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl font-bold text-[15px] transition-all hover:-translate-y-0.5"
                style={{ background: ORANGE, color: "#1a1210" }}
              >
                Узнать про Sinc.all
              </a>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="relative mt-14 md:mt-16 -mb-1 flex justify-center">
                <img
                  src={HERO_ILLUSTRATION}
                  alt=""
                  className="w-full max-w-2xl object-contain"
                  style={{ animation: "floatSlow 7s ease-in-out infinite" }}
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* СТАТИСТИКА */}
        <section className="bg-white px-5 md:px-10 py-10 md:py-14 border-b border-black/6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 90}>
                <div className="text-center md:text-left">
                  <div className="font-display text-3xl md:text-4xl font-black text-black mb-1">{s.value}</div>
                  <div className="text-black/45 text-xs md:text-sm leading-snug">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ПОДХОД */}
        <section className="bg-[#fafafa] px-5 md:px-10 py-14 md:py-20">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#c97a3d" }}>
                <Icon name="Target" size={16} />
                Наш подход
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-10 max-w-2xl">
                Технологии на службе безопасности людей
              </h2>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: "Cpu",
                  title: "Технологический контур",
                  text: "Собственные системы мониторинга и анализа данных работают на всех проектах компании без исключений.",
                },
                {
                  icon: "Users",
                  title: "Забота об участниках",
                  text: "Каждый гость мероприятия проходит проверку — это защищает и его, и остальных участников события.",
                },
                {
                  icon: "TrendingUp",
                  title: "Постоянное развитие",
                  text: "Алгоритмы обучаются на новых данных и с каждым мероприятием становятся точнее.",
                },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 90}>
                  <div className="p-6 bg-white rounded-3xl border border-black/6 h-full hover:-translate-y-1 transition-transform">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: `${ORANGE}22` }}
                    >
                      <Icon name={item.icon} size={20} style={{ color: "#c97a3d" }} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-black mb-2">{item.title}</h3>
                    <p className="text-black/50 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* SINC.ALL */}
        <section id="sinc-all" className="relative bg-black px-5 md:px-10 py-16 md:py-24 overflow-hidden">
          <FloatingOrbs />
          <div className="relative max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-14">
              <div>
                <FadeIn>
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5"
                    style={{ background: `${ORANGE}20`, color: ORANGE }}
                  >
                    <Icon name="Sparkles" size={13} />
                    Внутренняя разработка
                  </div>
                  <h2 className="font-display text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
                    Система «Sinc.all»
                  </h2>
                  <p className="text-white/55 text-base md:text-lg leading-relaxed mb-6">
                    Собственная система «Даббл», работающая в интеграции с нейросетью. Она создаёт цифровой портрет
                    потенциального участника мероприятия ещё на этапе регистрации и выявляет потенциально опасных лиц
                    до их допуска к аккредитации.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <Icon name="BadgeCheck" size={16} style={{ color: ORANGE }} />
                    Уже используется организаторами крупных событий
                  </div>
                </FadeIn>
              </div>
              <FadeIn delay={150}>
                <div className="relative rounded-3xl overflow-hidden border border-white/10">
                  <img src={FACE_SCAN} alt="Цифровой портрет участника" className="w-full h-full object-cover" />
                  <div
                    className="absolute left-0 right-0 h-1/3 pointer-events-none"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${ORANGE}40, transparent)`,
                      animation: "scanLine 3.5s linear infinite",
                    }}
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
                </div>
              </FadeIn>
            </div>

            {/* Пайплайн Sinc.all */}
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-2.5 md:left-3.5 top-2 bottom-2 w-px bg-white/10" />
              <div className="space-y-8">
                {SINC_STEPS.map((step, i) => (
                  <FadeIn key={step.title} delay={i * 100}>
                    <div className="relative flex gap-5 items-start">
                      <div
                        className="absolute -left-6 md:-left-8 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: ORANGE, background: "#0a0a0a" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ORANGE }} />
                      </div>
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: `${ORANGE}18` }}
                      >
                        <Icon name={step.icon} size={20} style={{ color: ORANGE }} />
                      </div>
                      <div className="pt-1.5">
                        <div className="text-white/25 text-xs font-bold mb-1">Шаг {i + 1}</div>
                        <h3 className="font-bold text-white text-[15px] md:text-base mb-1">{step.title}</h3>
                        <p className="text-white/45 text-sm leading-relaxed max-w-lg">{step.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* НАПРАВЛЕНИЯ БЕЗОПАСНОСТИ */}
        <section className="bg-[#fafafa] px-5 md:px-10 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#c97a3d" }}>
                <Icon name="LayoutGrid" size={16} />
                Направления работы
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-10 max-w-2xl">
                Комплексная система защиты компании
              </h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {DIRECTIONS.map((d, i) => (
                <FadeIn key={d.title} delay={i * 60}>
                  <div className="p-5 bg-white rounded-2xl border border-black/6 h-full hover:border-black/15 hover:-translate-y-0.5 transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5"
                      style={{ background: `${ORANGE}20` }}
                    >
                      <Icon name={d.icon} size={18} style={{ color: "#c97a3d" }} />
                    </div>
                    <h3 className="font-bold text-black text-[14px] mb-1.5 leading-snug">{d.title}</h3>
                    <p className="text-black/45 text-[13px] leading-relaxed">{d.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ДОВЕРИЕ / ГЕРОИЧЕСКИЙ БЛОК */}
        <section className="relative bg-black px-5 md:px-10 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src={SHIELD_NODES} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
          <FloatingOrbs />
          <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <FadeIn>
              <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                Нам доверяют организаторы крупнейших мероприятий
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-8">
                Наши технологии безопасности прошли проверку на реальных событиях с тысячами участников и продолжают
                развиваться вместе с масштабом задач.
              </p>
              <div
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm"
                style={{ background: `linear-gradient(120deg, ${ORANGE} 0%, #d98a52 100%)`, color: "#1a1210" }}
              >
                <Icon name="ShieldCheck" size={16} />
                Проверено на практике
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "Building2", label: "Крупные компании" },
                  { icon: "Users2", label: "Массовые события" },
                  { icon: "Calendar", label: "Регулярные проекты" },
                  { icon: "Globe2", label: "Федеральный масштаб" },
                ].map((item) => (
                  <div key={item.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <Icon name={item.icon} size={22} className="mx-auto mb-2.5" style={{ color: ORANGE }} />
                    <div className="text-white/60 text-xs font-medium leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* КОНТАКТЫ */}
        <section className="bg-white px-5 md:px-10 py-16 md:py-20 border-t border-black/6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <FadeIn>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-black mb-2">
                  Вопросы по безопасности мероприятия?
                </h2>
                <p className="text-black/45 text-sm md:text-base">
                  Департамент корпоративной безопасности готов проконсультировать по интеграции Sinc.all в ваш проект.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <a
                href="mailto:security@dabbl.ru"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-black shrink-0"
                style={{ background: `linear-gradient(120deg, ${ORANGE} 0%, #d98a52 100%)` }}
              >
                <Icon name="Mail" size={16} />
                Написать в департамент
              </a>
            </FadeIn>
          </div>
        </section>
      </div>
    </div>
  );
}