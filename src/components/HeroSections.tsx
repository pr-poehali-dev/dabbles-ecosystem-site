import Icon from "@/components/ui/icon";
import { FadeIn, PRODUCTS, INITIATIVES, FormType } from "@/components/shared";

interface HeroSectionsProps {
  scrollTo: (href: string) => void;
  setActiveForm: (form: FormType) => void;
  hoveredProduct: number | null;
  setHoveredProduct: (i: number | null) => void;
}

export default function HeroSections({
  scrollTo,
  setActiveForm,
  hoveredProduct,
  setHoveredProduct,
}: HeroSectionsProps) {
  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#FD4160]/15 blur-[120px] animate-pulse" />
          <div
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#0077FF]/12 blur-[100px]"
            style={{ animation: "pulse 4s ease-in-out 1s infinite" }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-[#C1F089]/8 blur-[80px]"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FD4160]/30 bg-[#FD4160]/10 text-[#FD4160] text-sm mb-8"
            style={{ opacity: 0, animation: "fadeSlideIn 0.8s ease 0.2s forwards" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#FD4160] animate-pulse" />
            Новая эра возможностей
          </div>
          <h1
            className="font-display text-5xl md:text-7xl xl:text-8xl font-black leading-none mb-6 tracking-tight"
            style={{ opacity: 0, animation: "fadeSlideIn 0.9s ease 0.4s forwards" }}
          >
            Двигаться вперёд —<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD4160] via-[#0077FF] to-[#C1F089]">
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
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FD4160] to-[#0077FF] text-white font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-[#FD4160]/25"
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
            <span className="text-[#FD4160] text-sm font-semibold tracking-widest uppercase mb-4 block">
              О компании
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black leading-tight mb-6">
              Мы строим<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD4160] to-[#0077FF]">
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
                <div className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FD4160] to-[#0077FF] mb-1 group-hover:scale-110 transition-transform origin-left">
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#0077FF]/8 blur-[150px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <FadeIn className="text-center mb-16">
            <span className="text-[#0077FF] text-sm font-semibold tracking-widest uppercase mb-4 block">
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
          <span className="text-[#C1F089] text-sm font-semibold tracking-widest uppercase mb-4 block">
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
              <div className="p-8 rounded-3xl border border-white/8 bg-white/3 hover:bg-[#C1F089]/5 hover:border-[#C1F089]/20 transition-all duration-300 group text-center">
                <div className="text-5xl mb-6">{item.emoji}</div>
                <h3 className="font-display text-xl font-bold mb-3 group-hover:text-[#C1F089] transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn
          delay={400}
          className="mt-12 p-8 md:p-12 rounded-3xl relative overflow-hidden border border-[#FD4160]/20 bg-gradient-to-br from-[#FD4160]/10 to-[#0077FF]/10"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#0077FF]/10 blur-3xl rounded-full pointer-events-none" />
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FD4160] to-[#0077FF] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Стать партнёром
            </button>
          </div>
        </FadeIn>
      </section>
    </>
  );
}