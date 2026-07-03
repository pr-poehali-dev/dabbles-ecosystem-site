import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { LOGO_URL, NAV } from "./constants";

interface VibeHeroProps {
  scrollTo: (href: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export default function VibeHero({ scrollTo, cartCount, onCartClick }: VibeHeroProps) {
  return (
    <>
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("#hero")} className="flex items-center gap-2">
            <img src={LOGO_URL} alt="ВАЙБ" className="h-7 md:h-8 w-auto" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">
              мерч
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.href}
                onClick={() => scrollTo(n.href)}
                className="px-3.5 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {n.label}
              </button>
            ))}
          </div>

          <button
            onClick={onCartClick}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-white/90 text-black text-sm font-semibold transition-colors"
          >
            <Icon name="ShoppingBag" size={15} />
            <span className="hidden sm:inline">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#DAB332] text-black text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative overflow-hidden bg-black text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-16 md:pb-24 relative">
          <div className="absolute -top-10 right-10 w-72 h-72 rounded-full bg-[#EBD047]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#DAB332]/10 blur-3xl pointer-events-none" />

          <FadeIn delay={100}>
            <div className="flex items-center gap-4 mb-8">
              <img src={LOGO_URL} alt="ВАЙБ" className="h-14 md:h-20 w-auto" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/40 font-semibold">
                Официальный мерч
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="font-display text-[40px] md:text-[76px] leading-[0.98] font-black tracking-tight max-w-3xl mb-6">
              Носи <span style={{ color: "#EBD047" }}>ВАЙБ</span><br />
              с собой
            </h1>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="text-base md:text-lg text-white/55 max-w-xl mb-10 leading-relaxed">
              Одежда и аксессуары для тех, кто разделяет наши ценности. Плотный хлопок, честные цены, быстрая доставка.
            </p>
          </FadeIn>

          <FadeIn delay={400}>
            <button
              onClick={() => scrollTo("#catalog")}
              className="px-7 py-3.5 rounded-full font-bold text-[15px] transition-all hover:opacity-90 hover:-translate-y-0.5 flex items-center gap-2"
              style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)", color: "#000" }}
            >
              Смотреть каталог
              <Icon name="ArrowRight" size={16} />
            </button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
