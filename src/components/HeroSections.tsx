import { useRef, useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { FadeIn, FormType } from "@/components/shared";
import { request } from "@/lib/api";

interface HeroSectionsProps {
  scrollTo: (href: string) => void;
  setActiveForm: (form: FormType) => void;
  hoveredProduct: number | null;
  setHoveredProduct: (i: number | null) => void;
}

const FALLBACK_SLIDES = [
  {
    id: 0,
    title: "Даббл Про —\nинструмент роста",
    subtitle: "Автоматизация, аналитика и масштаб для бизнеса любого размера",
    bg: "linear-gradient(135deg, #0a0535 0%, #1a0a6e 45%, #2d0060 100%)",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/629ac74e-9ae3-40e8-9edd-436184c71ca2.jpg",
    accent: "#C1F089",
    tag: "Даббл Про",
  },
  {
    id: 1,
    title: "Новый партнёр\nв вашем бизнесе",
    subtitle: "Даббл Нетворк объединяет лучших игроков рынка в одну экосистему",
    bg: "linear-gradient(135deg, #001a3a 0%, #003080 45%, #0a1a50 100%)",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/a14049b4-f5a1-4865-830d-03e8873b15b7.jpg",
    accent: "#0077FF",
    tag: "Нетворк",
  },
  {
    id: 2,
    title: "ИИ-аналитика\nдля роста ×3",
    subtitle: "Реальные данные в реальном времени — принимайте решения быстрее конкурентов",
    bg: "linear-gradient(135deg, #1a0010 0%, #4a0020 45%, #2a0040 100%)",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/d6ebc285-9c49-4230-92c3-6d233f410578.jpg",
    accent: "#FD4160",
    tag: "Аналитика",
  },
];

const HERO_TAGS = [
  { label: "Даббл Про", bg: "#FD4160", textColor: "#fff", thumbBg: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg" },
  { label: "Нетворк", bg: "#222", textColor: "#fff", thumbBg: null },
  { label: "Инициативы", bg: "#0077FF", textColor: "#fff", thumbBg: null },
  { label: "AI Studio", bg: "#C1F089", textColor: "#000", thumbBg: null },
  { label: "Карьера", bg: "#555", textColor: "#fff", thumbBg: null },
];

const FALLBACK_NEWS_CARDS = [
  {
    id: 1,
    colSpan: 1,
    rowSpan: 1,
    bg: "bg-white",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg",
    imagePosition: "top",
    tag: "Автономный транспорт",
    tagIcon: "Car",
    title: "Роботы Даббл появились в новых городах. Уже четвёртый миллион доставок",
    light: false,
  },
  {
    id: 2,
    colSpan: 1,
    rowSpan: 1,
    bg: "bg-[#6B4FBB]",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/a716bdd3-a613-4e25-9502-5a090b4daa82.jpg",
    imagePosition: "center",
    tag: "Даббл",
    tagIcon: "Zap",
    title: "Как используют Даббл Про в работе",
    light: true,
  },
  {
    id: 3,
    colSpan: 1,
    rowSpan: 1,
    bg: "bg-white",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/d6ebc285-9c49-4230-92c3-6d233f410578.jpg",
    imagePosition: "top",
    tag: "Музыка",
    tagIcon: "Music",
    title: "Как устроены рекомендации Даббл нового поколения",
    video: "1:25:25",
    light: false,
  },
  {
    id: 4,
    colSpan: 1,
    rowSpan: 1,
    bg: "bg-[#2a2018]",
    image: null,
    imagePosition: null,
    tag: "Устройства",
    tagIcon: "Monitor",
    title: "Нетворк или Про?\nВсё сразу",
    light: true,
    tall: true,
  },
  {
    id: 5,
    colSpan: 1,
    rowSpan: 1,
    bg: "bg-white",
    image: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/eaefd714-ab4f-4158-a1b7-7e4338893ed4.jpg",
    imagePosition: "center",
    tag: "Кейс",
    tagIcon: "Briefcase",
    title: "Рост ×3 за полгода",
    light: false,
    tall: true,
  },
  {
    id: 6,
    colSpan: 1,
    rowSpan: 1,
    bg: "bg-[#5a0090]",
    image: null,
    imagePosition: null,
    tag: "Инфраструктура",
    tagIcon: "Server",
    title: "Инфраструктура будущего",
    light: true,
    tall: true,
  },
];

type SlideShape = { title: string; subtitle: string; bg: string; image: string; accent: string };
type NewsShape = typeof FALLBACK_NEWS_CARDS[0];

export default function HeroSections({ scrollTo, setActiveForm }: HeroSectionsProps) {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slides, setSlides] = useState<SlideShape[]>(FALLBACK_SLIDES);
  const [newsCards, setNewsCards] = useState<NewsShape[]>(FALLBACK_NEWS_CARDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    request<{ items: Array<{ title: string; subtitle: string; bg_gradient: string; image_url: string; accent_color: string }> }>(
      "content",
      { query: { kind: "hero" }, auth: false },
    )
      .then(({ items }) => {
        if (items.length) {
          setSlides(items.map((i) => ({
            title: i.title,
            subtitle: i.subtitle,
            bg: i.bg_gradient,
            image: i.image_url,
            accent: i.accent_color,
          })));
        }
      })
      .catch(() => {});

    request<{ items: Array<{ id: number; title: string; tag: string; tag_icon: string; image_url: string; image_position: string; bg_color: string; is_light: boolean }> }>(
      "content",
      { query: { kind: "news" }, auth: false },
    )
      .then(({ items }) => {
        if (items.length) {
          setNewsCards(items.map((i) => ({
            id: i.id,
            colSpan: 1,
            rowSpan: 1,
            bg: `bg-[${i.bg_color}]`,
            image: i.image_url || null,
            imagePosition: i.image_position,
            tag: i.tag,
            tagIcon: i.tag_icon,
            title: i.title,
            light: i.is_light,
            tall: false,
          })) as NewsShape[]);
        }
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setSlide(idx);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const next = useCallback(() => goTo((slide + 1) % slides.length), [slide, goTo, slides.length]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  const resetTimer = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo(idx);
  };

  const current = slides[Math.min(slide, slides.length - 1)];

  return (
    <>
      {/* ═══ HERO SLIDER ═══ */}
      {/* Обёртка: задаёт отступ-перекрытие на следующий блок */}
      <div className="relative z-10" style={{ paddingTop: "68px", marginBottom: "-48px" }}>
        <section
          id="hero"
          className="relative mx-3 md:mx-5"
          style={{
            minHeight: "calc(100vh - 68px - 20px)",
            maxHeight: "800px",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          {/* BG IMAGE */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: animating ? 0 : 1 }}
          >
            <img
              src={current.image}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.45)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: current.bg, opacity: 0.75 }}
            />
          </div>

          {/* CONTENT */}
          <div
            className="relative z-10 flex flex-col justify-end h-full px-8 md:px-14 pb-16"
            style={{ minHeight: "calc(100vh - 68px - 20px)", maxHeight: "800px" }}
          >
            {/* TEXT BLOCK */}
            <div
              className="max-w-xl mb-8 transition-all duration-500"
              style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(16px)" : "translateY(0)" }}
            >
              <h1
                className="font-display text-4xl md:text-6xl font-black text-white leading-tight mb-4 whitespace-pre-line"
              >
                {current.title}
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-7 max-w-md">
                {current.subtitle}
              </p>
              <button
                onClick={() => scrollTo("#products")}
                className="px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: current.accent, color: current.accent === "#C1F089" ? "#000" : "#fff" }}
              >
                Узнать больше
              </button>
            </div>

            {/* SLIDER DOTS + ARROWS */}
            <div className="flex items-center gap-4 mb-5">
              <button
                onClick={() => resetTimer((slide - 1 + slides.length) % slides.length)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="ChevronLeft" size={18} className="text-white" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => resetTimer(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === slide ? 28 : 8,
                      height: 8,
                      background: i === slide ? current.accent : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => resetTimer((slide + 1) % slides.length)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="ChevronRight" size={18} className="text-white" />
              </button>
            </div>

            {/* TAGS PILLS — вынесены за пределы section, чтобы не обрезались */}
          </div>
        </section>

        {/* TAGS PILLS — снаружи section, поверх следующего блока */}
        <div
          className="flex gap-2.5 px-8 md:px-10 pt-4 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {HERO_TAGS.map((tag, i) => (
            <button
              key={i}
              onClick={() => scrollTo("#products")}
              className="flex items-center gap-2 shrink-0 pl-1.5 pr-4 py-1.5 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{
                background: "rgba(30,20,60,0.75)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="w-6 h-6 rounded-full shrink-0 overflow-hidden"
                style={{ background: tag.bg }}
              >
                {tag.thumbBg && (
                  <img src={tag.thumbBg} alt="" className="w-full h-full object-cover" />
                )}
              </span>
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ ЧТО НОВОГО ═══ */}
      <section id="products" className="bg-[#f0f0f5] px-6 md:px-10 pb-16" style={{ paddingTop: "72px" }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-7">
            <h2 className="font-display text-[28px] md:text-[36px] font-black text-black">Что нового</h2>
          </FadeIn>

          {/* TOP ROW: 3 columns equal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {newsCards.slice(0, 3).map((card, i) => (
              <FadeIn key={card.id} delay={i * 70}>
                <NewsCard card={card} scrollTo={scrollTo} />
              </FadeIn>
            ))}
          </div>

          {/* BOTTOM ROW: 2/5 + 1/5 + 2/5  */}
          {newsCards.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <FadeIn delay={210}>
                  <NewsCard card={newsCards[3]} scrollTo={scrollTo} tall />
                </FadeIn>
              </div>
              {newsCards[4] && (
                <div className="md:col-span-2">
                  <FadeIn delay={280}>
                    <NewsCard card={newsCards[4]} scrollTo={scrollTo} tall />
                  </FadeIn>
                </div>
              )}
              {newsCards[5] && (
                <div className="md:col-span-1">
                  <FadeIn delay={350}>
                    <NewsCard card={newsCards[5]} scrollTo={scrollTo} tall />
                  </FadeIn>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══ О КОМПАНИИ + ИНИЦИАТИВЫ ═══ */}
      <section id="about" className="bg-white px-6 md:px-10 py-14">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-10">
            <h2 className="font-display text-[28px] md:text-[36px] font-black text-black mb-3">О компании</h2>
            <p className="text-black/50 text-lg max-w-2xl">
              Даббл — команда инженеров, стратегов и мечтателей, которые верят: лучшие решения рождаются на стыке технологий и человечности.
            </p>
          </FadeIn>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {[
              { num: "150+", label: "Клиентов по всему миру" },
              { num: "×3.2", label: "Средний рост выручки" },
              { num: "47", label: "Стран присутствия" },
              { num: "98%", label: "Удовлетворённость" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 80} className="p-6 bg-[#f0f0f5] rounded-2xl">
                <div className="font-display text-4xl font-black text-black mb-1">{s.num}</div>
                <div className="text-black/45 text-sm">{s.label}</div>
              </FadeIn>
            ))}
          </div>

          {/* INITIATIVES */}
          <div id="initiatives" className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { emoji: "🌱", title: "Зелёный курс", desc: "Сокращаем углеродный след и инвестируем в устойчивое будущее." },
              { emoji: "🤝", title: "Сообщество", desc: "Поддерживаем стартапы, образование и социальные проекты." },
              { emoji: "🔬", title: "R&D Лаборатория", desc: "Исследуем технологии будущего: ИИ, квантовые вычисления, биотех." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-7 rounded-3xl bg-[#f0f0f5] hover:bg-[#e8e8ef] transition-colors">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="font-display text-xl font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-black/50 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div
              className="p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              style={{ background: "#111" }}
            >
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-white mb-2">Стань частью движения</h3>
                <p className="text-white/45">Присоединяйся к партнёрской сети Даббл</p>
              </div>
              <button
                onClick={() => { scrollTo("#contacts"); setActiveForm("partner"); }}
                className="shrink-0 px-7 py-3.5 rounded-2xl bg-[#FD4160] text-white font-semibold hover:bg-[#e0324f] transition-colors"
              >
                Стать партнёром
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function NewsCard({ card, scrollTo, tall }: {
  card: NewsShape;
  scrollTo: (href: string) => void;
  tall?: boolean;
}) {
  const isLight = card.light;
  const titleColor = isLight ? "text-white" : "text-black";
  const tagColor = isLight ? "text-white/55" : "text-black/40";
  // Извлекаем HEX из bg-[#XXXXXX] для инлайн-стиля
  const bgMatch = typeof card.bg === "string" ? card.bg.match(/#[0-9A-Fa-f]{3,8}/) : null;
  const bgColor = bgMatch ? bgMatch[0] : "#FFFFFF";

  return (
    <div
      className="rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
      style={{ minHeight: tall ? 240 : 300, background: bgColor }}
      onClick={() => scrollTo("#contacts")}
    >
      {card.imagePosition === "top" && card.image && (
        <div className="w-full overflow-hidden" style={{ height: 180 }}>
          <img
            src={card.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {card.imagePosition === "center" && card.image && (
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 140 }}>
          <img
            src={card.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-500"
          />
          {card.video && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-white/70 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Icon name="Play" size={11} />
              {card.video}
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${tagColor}`}>
          <Icon name={card.tagIcon ?? "Tag"} size={11} />
          {card.tag}
        </div>
        <h3 className={`font-display text-base font-bold leading-snug whitespace-pre-line ${titleColor} group-hover:opacity-80 transition-opacity`}>
          {card.title}
        </h3>
        <div className={`mt-auto pt-1 flex items-center justify-between`}>
          <span className={`text-[11px] ${tagColor}`}>Даббл</span>
          {card.imagePosition === "center" && (
            <Icon name="ExternalLink" size={13} className={tagColor} />
          )}
        </div>
      </div>
    </div>
  );
}