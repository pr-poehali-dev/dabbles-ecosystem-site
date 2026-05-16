import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const NAV_LINKS = [
  { label: "Главная", href: "#hero" },
  { label: "О компании", href: "#about" },
  { label: "Продукты", href: "#products" },
  { label: "Инициативы", href: "#initiatives" },
  { label: "Блог", href: "#blog" },
  { label: "Контакты", href: "#contacts" },
];

const PRODUCTS = [
  {
    icon: "Zap",
    title: "Даббл Про",
    desc: "Флагманское решение для бизнеса любого масштаба. Автоматизация, аналитика и рост.",
    tag: "Популярное",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "Globe",
    title: "Даббл Нетворк",
    desc: "Экосистема партнёрств и коллабораций. Расширяй горизонты вместе с сообществом.",
    tag: "Новинка",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: "Layers",
    title: "Даббл Стэк",
    desc: "Интеграционная платформа для объединения инструментов в единый рабочий поток.",
    tag: "Бета",
    color: "from-orange-400 to-rose-500",
  },
  {
    icon: "BarChart3",
    title: "Даббл Аналитика",
    desc: "Умная аналитика в реальном времени. Данные — это топливо вашего роста.",
    tag: "Скоро",
    color: "from-emerald-400 to-teal-500",
  },
];

const INITIATIVES = [
  {
    emoji: "🌱",
    title: "Зелёный курс",
    desc: "Сокращаем углеродный след и инвестируем в устойчивое будущее.",
  },
  {
    emoji: "🤝",
    title: "Даббл Сообщество",
    desc: "Поддерживаем стартапы, образование и социальные проекты.",
  },
  {
    emoji: "🔬",
    title: "R&D Лаборатория",
    desc: "Исследуем технологии будущего: ИИ, квантовые вычисления, биотех.",
  },
];

const BLOG_POSTS = [
  {
    date: "12 мая 2026",
    tag: "Тренды",
    title: "Как ИИ меняет правила игры в бизнесе",
    desc: "Разбираем ключевые трансформации, которые уже происходят прямо сейчас.",
    color: "from-violet-600 to-fuchsia-600",
  },
  {
    date: "5 мая 2026",
    tag: "Кейс",
    title: "История успеха: рост ×3 за полгода",
    desc: "Как наш клиент утроил выручку, внедрив Даббл Про в свои процессы.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    date: "28 апреля 2026",
    tag: "Продукт",
    title: "Даббл Нетворк: первые 1000 участников",
    desc: "Делимся инсайтами и данными из первых месяцев работы платформы.",
    color: "from-orange-500 to-rose-600",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

type FormType = "request" | "partner" | "feedback";

export default function Index() {
  const [activeNav, setActiveNav] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>("request");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const sections = NAV_LINKS.map((l) => l.href.replace("#", ""));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveNav(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
  };

  const FORM_TABS: { key: FormType; label: string }[] = [
    { key: "request", label: "Заявка" },
    { key: "partner", label: "Партнёрство" },
    { key: "feedback", label: "Обратная связь" },
  ];

  return (
    <div className="min-h-screen bg-[#080810] text-white font-body overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/5 backdrop-blur-xl bg-[#080810]/80">
        <button
          onClick={() => scrollTo("#hero")}
          className="font-display text-xl font-bold tracking-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Даббл
          </span>
        </button>
        <ul className="hidden md:flex gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <button
                onClick={() => scrollTo(l.href)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  activeNav === l.href.replace("#", "")
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => scrollTo("#contacts")}
          className="hidden md:block px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
        >
          Связаться
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/70 hover:text-white"
        >
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#080810]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="font-display text-2xl text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
          <div
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-fuchsia-600/15 blur-[100px]"
            style={{ animation: "pulse 4s ease-in-out 1s infinite" }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px]"
            style={{ animation: "pulse 5s ease-in-out 2s infinite" }}
          />
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8"
            style={{ opacity: 0, animation: "fadeSlideIn 0.8s ease 0.2s forwards" }}
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Новая эра возможностей
          </div>
          <h1
            className="font-display text-5xl md:text-7xl xl:text-8xl font-black leading-none mb-6 tracking-tight"
            style={{ opacity: 0, animation: "fadeSlideIn 0.9s ease 0.4s forwards" }}
          >
            Двигаться вперёд —<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              это Даббл
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10"
            style={{ opacity: 0, animation: "fadeSlideIn 0.9s ease 0.6s forwards" }}
          >
            Мы создаём продукты и инициативы, которые меняют то, как люди работают, думают и строят будущее.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ opacity: 0, animation: "fadeSlideIn 0.9s ease 0.8s forwards" }}
          >
            <button
              onClick={() => scrollTo("#products")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-violet-500/25"
            >
              Наши продукты
            </button>
            <button
              onClick={() => scrollTo("#about")}
              className="px-8 py-4 rounded-2xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold text-lg transition-all hover:bg-white/5"
            >
              О компании
            </button>
          </div>
        </div>
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 text-xs"
          style={{ animation: "bounce 2s infinite" }}
        >
          <span>Прокрути вниз</span>
          <Icon name="ChevronDown" size={16} />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <FadeIn className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
              О компании
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black leading-tight mb-6">
              Мы строим<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                завтра сегодня
              </span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-6">
              Даббл — это команда инженеров, стратегов и мечтателей, которые верят: лучшие решения рождаются на стыке технологий и человечности.
            </p>
            <p className="text-white/40 leading-relaxed">
              С 2019 года мы помогаем бизнесам всех размеров расти быстрее, думать смелее и действовать эффективнее. Каждый продукт — это не просто инструмент, а катализатор изменений.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "150+", label: "Клиентов по всему миру" },
              { num: "×3.2", label: "Средний рост выручки" },
              { num: "47", label: "Стран присутствия" },
              { num: "98%", label: "Уровень удовлетворённости" },
            ].map((s, i) => (
              <FadeIn
                key={i}
                delay={i * 100}
                className="p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors group"
              >
                <div className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-1 group-hover:scale-110 transition-transform origin-left">
                  {s.num}
                </div>
                <div className="text-white/40 text-sm">{s.label}</div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-24 px-6 md:px-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-fuchsia-600/8 blur-[150px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <FadeIn className="text-center mb-16">
            <span className="text-fuchsia-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
              Продукты
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
              Инструменты роста
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Каждый продукт создан с одной целью — дать вашему бизнесу настоящий импульс.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-6">
            {PRODUCTS.map((p, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div
                  className="relative p-8 rounded-3xl border border-white/8 bg-white/3 hover:bg-white/5 transition-all duration-300 cursor-pointer group overflow-hidden"
                  onMouseEnter={() => setHoveredProduct(i)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{
                    transform: hoveredProduct === i ? "translateY(-4px)" : "translateY(0)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${p.color} transition-opacity duration-500`}
                    style={{
                      filter: "blur(60px)",
                      transform: "scale(0.7)",
                      opacity: hoveredProduct === i ? 0.08 : 0,
                    }}
                  />
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${p.color} mb-4`}>
                    <Icon name={p.icon} fallback="Zap" size={22} className="text-white" />
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-xl font-bold">{p.title}</h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${p.color} text-white`}
                    >
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-white/45 leading-relaxed">{p.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors text-sm">
                    <span>Подробнее</span>
                    <Icon name="ArrowRight" size={14} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* INITIATIVES */}
      <section id="initiatives" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
            Инициативы
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
            Больше, чем бизнес
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Мы берём на себя ответственность за мир, в котором работаем.
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {INITIATIVES.map((item, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div className="p-8 rounded-3xl border border-white/8 bg-white/3 hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-all duration-300 group text-center">
                <div className="text-5xl mb-6">{item.emoji}</div>
                <h3 className="font-display text-xl font-bold mb-3 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn
          delay={400}
          className="mt-12 p-8 md:p-12 rounded-3xl relative overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/20"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative max-w-2xl">
            <h3 className="font-display text-2xl md:text-3xl font-black mb-3">
              Стань частью движения
            </h3>
            <p className="text-white/50 mb-6">
              Присоединяйся к сети партнёров, которые меняют правила игры вместе с Даббл.
            </p>
            <button
              onClick={() => {
                scrollTo("#contacts");
                setActiveForm("partner");
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Стать партнёром
            </button>
          </div>
        </FadeIn>
      </section>

      {/* BLOG */}
      <section id="blog" className="py-24 px-6 md:px-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <FadeIn className="flex items-end justify-between mb-16">
            <div>
              <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
                Блог
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-black">
                Идеи и инсайты
              </h2>
            </div>
            <a
              href="#"
              className="hidden md:flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
            >
              Все статьи <Icon name="ArrowRight" size={14} />
            </a>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, i) => (
              <FadeIn key={i} delay={i * 100}>
                <article className="group cursor-pointer rounded-3xl border border-white/8 bg-white/3 hover:bg-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-2 bg-gradient-to-r ${post.color}`} />
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${post.color} text-white`}
                      >
                        {post.tag}
                      </span>
                      <span className="text-white/30 text-xs">{post.date}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold mb-3 group-hover:text-violet-300 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">{post.desc}</p>
                    <div className="mt-5 flex items-center gap-2 text-white/25 group-hover:text-white/50 transition-colors text-sm">
                      <span>Читать</span>
                      <Icon name="ArrowRight" size={13} />
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <FadeIn className="text-center mb-12">
          <span className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
            Контакты
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
            Напиши нам
          </h2>
          <p className="text-white/40 text-lg">
            Выбери тему — ответим в течение рабочего дня.
          </p>
        </FadeIn>

        <FadeIn delay={100} className="flex justify-center mb-8">
          <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-white/5 border border-white/8">
            {FORM_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveForm(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeForm === tab.key
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="p-8 md:p-12 rounded-3xl border border-white/8 bg-white/3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/5 blur-3xl rounded-full pointer-events-none" />
            {submitted ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center gap-4"
                style={{ animation: "fadeSlideIn 0.5s ease" }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-2">
                  <Icon name="Check" size={28} className="text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold">Отправлено!</h3>
                <p className="text-white/40">
                  Мы получили ваше сообщение и свяжемся с вами в ближайшее время.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative grid gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Имя *</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Как вас зовут?"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Email *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-all"
                    />
                  </div>
                </div>
                {activeForm !== "feedback" && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/50 text-sm mb-2 block">Телефон</label>
                      <input
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+7 (999) 000-00-00"
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-sm mb-2 block">
                        {activeForm === "partner" ? "Название компании" : "Компания"}
                      </label>
                      <input
                        value={formData.company}
                        onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                        placeholder="ООО «Пример»"
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-all"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-white/50 text-sm mb-2 block">
                    {activeForm === "request"
                      ? "Расскажите о задаче"
                      : activeForm === "partner"
                      ? "Предложение по партнёрству"
                      : "Ваш отзыв"}
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    placeholder="Напишите здесь..."
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-lg hover:opacity-90 hover:scale-[1.01] transition-all duration-200 shadow-lg shadow-violet-500/20"
                >
                  {activeForm === "request"
                    ? "Отправить заявку"
                    : activeForm === "partner"
                    ? "Предложить партнёрство"
                    : "Отправить отзыв"}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-display text-xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Даббл
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-white/30 text-sm">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="hover:text-white/60 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-white/20 text-sm">© 2026 Даббл. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}