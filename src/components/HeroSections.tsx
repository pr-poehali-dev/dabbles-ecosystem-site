import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { FadeIn, FormType } from "@/components/shared";

interface HeroSectionsProps {
  scrollTo: (href: string) => void;
  setActiveForm: (form: FormType) => void;
  hoveredProduct: number | null;
  setHoveredProduct: (i: number | null) => void;
}

const HERO_TAGS = [
  { label: "Даббл Про", color: "bg-[#FD4160]", icon: "Zap" },
  { label: "Нетворк", color: "bg-black", icon: "Globe" },
  { label: "Инициативы", color: "bg-[#0077FF]", icon: "Heart" },
  { label: "AI Studio", color: "bg-[#C1F089]", textColor: "text-black", icon: "Sparkles" },
  { label: "Карьера", color: "bg-gray-700", icon: "Briefcase" },
];

const NEWS_CARDS = [
  {
    id: 1,
    size: "tall",
    bg: "bg-white",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg",
    tag: "Продукты",
    tagIcon: "Package",
    title: "Даббл Аналитика: умные данные для вашего роста",
    imageTop: true,
  },
  {
    id: 2,
    size: "tall",
    bg: "bg-[#0077FF]",
    image: null,
    tag: "Партнёрство",
    tagIcon: "Handshake",
    title: "Как Даббл Нетворк меняет экосистему бизнеса",
    desc: "Рассказываем о первых результатах и новых участниках платформы",
    imageIllustration: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/a716bdd3-a613-4e25-9502-5a090b4daa82.jpg",
    light: true,
  },
  {
    id: 3,
    size: "wide",
    bg: "bg-white",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/d6ebc285-9c49-4230-92c3-6d233f410578.jpg",
    tag: "Технологии",
    tagIcon: "Cpu",
    title: "ИИ в центре всего: новая стратегия Даббл на 2026 год",
    imageTop: false,
    video: "1:25:25",
    light: true,
  },
  {
    id: 4,
    size: "normal",
    bg: "bg-[#1a1a1a]",
    image: null,
    tag: "Устройства",
    tagIcon: "Monitor",
    title: "Даббл Стэк или Даббл Про? Всё сразу",
    light: true,
  },
  {
    id: 5,
    size: "normal",
    bg: "bg-white",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg",
    tag: "Кейсы",
    tagIcon: "TrendingUp",
    title: "Рост ×3 за полгода: история клиента",
    imageTop: true,
  },
  {
    id: 6,
    size: "normal",
    bg: "bg-[#C1F089]",
    image: null,
    tag: "Инфраструктура",
    tagIcon: "Server",
    title: "R&D: что мы исследуем прямо сейчас",
    textColor: "text-black",
  },
];

const STATS = [
  { num: "150+", label: "Клиентов" },
  { num: "×3.2", label: "Рост выручки" },
  { num: "47", label: "Стран" },
  { num: "98%", label: "Удовлетворённость" },
];

export default function HeroSections({
  scrollTo,
  setActiveForm,
}: HeroSectionsProps) {
  const tagsRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
    setScrollLeft(tagsRef.current?.scrollLeft ?? 0);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null || !tagsRef.current) return;
    tagsRef.current.scrollLeft = scrollLeft - (e.clientX - dragStart);
  };
  const onMouseUp = () => setDragStart(null);

  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="relative overflow-hidden pt-[72px]"
        style={{
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a0533 40%, #0c1a4a 70%, #0a2a1a 100%)",
          minHeight: "580px",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[#FD4160]/20 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#0077FF]/20 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center min-h-[480px]">
          <div className="flex-1 py-16 md:py-20 z-10">
            <div
              className="text-white/60 text-sm font-medium mb-4 tracking-wide"
              style={{ opacity: 0, animation: "fadeSlideIn 0.7s ease 0.1s forwards" }}
            >
              Добро пожаловать в Даббл
            </div>
            <h1
              className="font-display text-4xl md:text-6xl font-black text-white leading-tight mb-6"
              style={{ opacity: 0, animation: "fadeSlideIn 0.7s ease 0.25s forwards" }}
            >
              Новые продукты<br />
              <span style={{ color: "#C1F089" }}>для вашего роста</span>
            </h1>
            <p
              className="text-white/55 text-lg max-w-md mb-8 leading-relaxed"
              style={{ opacity: 0, animation: "fadeSlideIn 0.7s ease 0.4s forwards" }}
            >
              Мы создаём инструменты, инициативы и партнёрства — всё, что нужно бизнесу будущего.
            </p>
            <div
              className="flex gap-3"
              style={{ opacity: 0, animation: "fadeSlideIn 0.7s ease 0.55s forwards" }}
            >
              <button
                onClick={() => scrollTo("#products")}
                className="px-6 py-3 rounded-2xl bg-[#FD4160] text-white font-semibold hover:bg-[#e0324f] transition-colors"
              >
                Наши продукты
              </button>
              <button
                onClick={() => scrollTo("#about")}
                className="px-6 py-3 rounded-2xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold transition-all"
              >
                О компании
              </button>
            </div>
          </div>

          <div
            className="hidden md:flex flex-1 items-center justify-center py-8"
            style={{ opacity: 0, animation: "fadeSlideIn 0.9s ease 0.3s forwards" }}
          >
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/d6ebc285-9c49-4230-92c3-6d233f410578.jpg"
              alt="Даббл"
              className="w-full max-w-lg rounded-3xl object-cover shadow-2xl shadow-black/50"
              style={{ maxHeight: "380px" }}
            />
          </div>
        </div>

        {/* TAGS PILLS ROW */}
        <div
          ref={tagsRef}
          className="flex gap-3 px-6 md:px-12 pb-6 overflow-x-auto scrollbar-hide cursor-grab select-none"
          style={{ scrollbarWidth: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {HERO_TAGS.map((tag, i) => (
            <button
              key={i}
              onClick={() => scrollTo("#products")}
              className={`flex items-center gap-2 shrink-0 px-4 py-2 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105 ${tag.color} ${tag.textColor ?? ""}`}
              style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease ${0.6 + i * 0.08}s forwards` }}
            >
              <Icon name={tag.icon} size={14} />
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      {/* ABOUT STATS */}
      <section id="about" className="bg-[#f5f5f7] py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 80} className="text-center">
              <div className="font-display text-4xl font-black text-black mb-1">{s.num}</div>
              <div className="text-black/45 text-sm">{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* NEWS SECTION */}
      <section id="products" className="bg-[#f5f5f7] py-10 px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-black text-black">Что нового</h2>
          </FadeIn>

          {/* MASONRY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">

            {/* ROW 1: tall | tall | wide */}
            <FadeIn delay={0}>
              <NewsCard card={NEWS_CARDS[0]} />
            </FadeIn>
            <FadeIn delay={80}>
              <NewsCard card={NEWS_CARDS[1]} scrollTo={scrollTo} setActiveForm={setActiveForm} />
            </FadeIn>
            <FadeIn delay={160}>
              <NewsCard card={NEWS_CARDS[2]} />
            </FadeIn>

            {/* ROW 2: normal | normal | normal */}
            <FadeIn delay={240}>
              <NewsCard card={NEWS_CARDS[3]} />
            </FadeIn>
            <FadeIn delay={320}>
              <NewsCard card={NEWS_CARDS[4]} />
            </FadeIn>
            <FadeIn delay={400}>
              <NewsCard card={NEWS_CARDS[5]} />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="initiatives" className="bg-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-3">О компании</h2>
            <p className="text-black/50 text-lg max-w-2xl">
              Даббл — команда инженеров, стратегов и мечтателей, которые верят: лучшие решения рождаются на стыке технологий и человечности.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🌱", title: "Зелёный курс", desc: "Сокращаем углеродный след и инвестируем в устойчивое будущее." },
              { emoji: "🤝", title: "Сообщество", desc: "Поддерживаем стартапы, образование и социальные проекты." },
              { emoji: "🔬", title: "R&D Лаборатория", desc: "Исследуем технологии будущего: ИИ, квантовые вычисления, биотех." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-7 rounded-3xl bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors group cursor-default">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="font-display text-xl font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-black/50 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300} className="mt-8 p-8 md:p-12 rounded-3xl bg-black text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-black mb-2">Стань частью движения</h3>
              <p className="text-white/50">Присоединяйся к партнёрской сети Даббл</p>
            </div>
            <button
              onClick={() => { scrollTo("#contacts"); setActiveForm("partner"); }}
              className="shrink-0 px-7 py-3.5 rounded-2xl bg-[#FD4160] text-white font-semibold hover:bg-[#e0324f] transition-colors"
            >
              Стать партнёром
            </button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function NewsCard({ card, scrollTo, setActiveForm }: {
  card: typeof NEWS_CARDS[0];
  scrollTo?: (href: string) => void;
  setActiveForm?: (f: FormType) => void;
}) {
  const isLight = card.light;
  const textColor = card.textColor ?? (isLight ? "text-white" : "text-black");
  const subColor = isLight ? "text-white/60" : "text-black/45";

  return (
    <div
      className={`rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${card.bg}`}
      style={{ minHeight: card.size === "wide" ? 340 : card.size === "tall" ? 400 : 280 }}
      onClick={() => scrollTo && scrollTo("#contacts")}
    >
      {card.imageTop && card.image && (
        <div className="w-full h-44 overflow-hidden">
          <img src={card.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      {card.imageIllustration && (
        <div className="w-full h-44 overflow-hidden">
          <img src={card.imageIllustration} alt="" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      {!card.imageTop && card.image && !card.imageIllustration && (
        <div className="relative w-full" style={{ height: "100%", minHeight: 300 }}>
          <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
          {card.video && (
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 ${subColor} text-xs font-medium`}>
              <Icon name="Play" size={12} />
              {card.video}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className={`flex items-center gap-2 mb-3 ${subColor} text-xs font-semibold uppercase tracking-wider`}>
              <Icon name={card.tagIcon ?? "Tag"} size={12} />
              {card.tag}
            </div>
            <h3 className={`font-display text-xl font-bold leading-snug ${textColor}`}>{card.title}</h3>
          </div>
        </div>
      )}
      {(card.imageTop || card.imageIllustration || (!card.image && !card.imageIllustration)) && (
        <div className="p-6">
          <div className={`flex items-center gap-2 mb-3 ${subColor} text-xs font-semibold uppercase tracking-wider`}>
            <Icon name={card.tagIcon ?? "Tag"} size={12} />
            {card.tag}
          </div>
          <h3 className={`font-display text-lg font-bold leading-snug mb-2 ${textColor}`}>{card.title}</h3>
          {card.desc && <p className={`text-sm leading-relaxed ${subColor}`}>{card.desc}</p>}
        </div>
      )}
    </div>
  );
}
