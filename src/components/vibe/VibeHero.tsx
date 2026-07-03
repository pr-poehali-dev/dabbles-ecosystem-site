import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { LOGO_URL, NAV, HERO_DECOR_URL } from "./constants";

interface VibeHeroProps {
  scrollTo: (href: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export default function VibeHero({ scrollTo, cartCount, onCartClick }: VibeHeroProps) {
  return (
    <>
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-black/6">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("#hero")} className="flex items-center gap-2">
            <img src={LOGO_URL} alt="ВАЙБ" className="h-7 md:h-8 w-auto" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-black/40 font-semibold">
              мерч
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.href}
                onClick={() => scrollTo(n.href)}
                className="px-3.5 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
              >
                {n.label}
              </button>
            ))}
          </div>

          <button
            onClick={onCartClick}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-black hover:bg-black/85 text-white text-sm font-semibold transition-colors"
          >
            <Icon name="ShoppingBag" size={15} />
            <span className="hidden sm:inline">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EBD047] text-black text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-10">
          {/* верхняя плашка автора/бейдж — как в референсе */}
          <FadeIn>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
                >
                  <Icon name="Sparkles" size={16} className="text-black" />
                </div>
                <div className="leading-tight">
                  <div className="text-[13px] font-bold text-black">@vibe.brand</div>
                  <div className="text-[11px] text-black/40">Создано с вайбом</div>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#EBD047] text-black text-[11px] font-bold">
                Новинки
              </span>
            </div>
          </FadeIn>

          {/* декоративная композиция */}
          <FadeIn delay={100}>
            <div className="relative h-[180px] md:h-[260px] mb-2 flex items-center justify-center">
              <img
                src={HERO_DECOR_URL}
                alt=""
                className="h-full w-auto object-contain"
              />
            </div>
          </FadeIn>

          {/* текстовый блок слева + кнопка справа, как в референсе */}
          <FadeIn delay={200}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div className="max-w-sm">
                <div className="inline-flex items-center gap-1.5 text-[#DAB332] text-[13px] font-bold mb-2">
                  <Icon name="Sparkles" size={13} />
                  Взрослая жизнь и так серьёзная
                </div>
                <p className="text-black/55 text-[14px] leading-relaxed">
                  Мы — небольшой бренд мерча для тех, кто с нами.{" "}
                  <span className="font-bold text-black">И мы верим, что вайб создаётся в мелочах.</span>
                </p>
              </div>
              <button
                onClick={() => scrollTo("#catalog")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-[14px] text-black transition-all hover:opacity-90 hover:-translate-y-0.5 shrink-0 self-start md:self-end"
                style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
              >
                Каталог
                <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <Icon name="ArrowRight" size={13} className="text-white" />
                </span>
              </button>
            </div>
          </FadeIn>

          {/* гигантский wordmark */}
          <FadeIn delay={300}>
            <h1 className="font-display font-black text-black leading-[0.85] tracking-tight text-[64px] sm:text-[90px] md:text-[130px] lg:text-[150px] select-none -mx-1">
              ВАЙБ
            </h1>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
