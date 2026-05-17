import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { LOGO_URL, NAV } from "./constants";

interface VibeHeroProps {
  scrollTo: (href: string) => void;
}

export default function VibeHero({ scrollTo }: VibeHeroProps) {
  return (
    <>
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-[#FBF6EE]/85 backdrop-blur-lg border-b border-black/5">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("#hero")} className="flex items-center gap-2">
            <img src={LOGO_URL} alt="ВАЙБ" className="h-7 md:h-8 w-auto" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-black/45 font-semibold">
              кофейня · пекарня
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.href}
                onClick={() => scrollTo(n.href)}
                className="px-3.5 py-2 text-sm font-medium text-black/70 hover:text-black transition-colors"
              >
                {n.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollTo("#contacts")}
            className="px-4 py-2 rounded-full bg-[#1a1410] hover:bg-black text-white text-xs md:text-sm font-semibold transition-colors"
          >
            <span className="hidden sm:inline">Написать нам</span>
            <span className="sm:hidden">Написать</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-16 md:pb-28 relative">
          {/* декор-кружки */}
          <div className="absolute -top-10 right-10 w-44 h-44 rounded-full bg-[#FFB562]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#A77B5A]/15 blur-3xl pointer-events-none" />

          <FadeIn delay={100}>
            <div className="flex items-start gap-6 md:gap-10 mb-8">
              <img
                src={LOGO_URL}
                alt="ВАЙБ"
                className="h-20 md:h-32 w-auto shrink-0 -ml-1"
              />
              <div className="hidden md:block flex-1 max-w-md mt-3 text-black/55 leading-relaxed">
                Кофейня и пекарня в самом сердце города. Место, где утром пахнет
                свежими круассанами, днём вибрирует lo-fi, а вечером звучат разговоры
                о важном.
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="font-display text-[44px] md:text-[88px] leading-[0.95] font-black tracking-tight max-w-4xl mb-6">
              Кофе, выпечка<br />и&nbsp;своя&nbsp;атмосфера
            </h1>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="text-base md:text-lg text-black/55 max-w-xl mb-10 md:hidden">
              Кофейня и пекарня в самом сердце города. Место, где утром пахнет круассанами, а вечером — разговорами.
            </p>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("#menu")}
                className="px-6 py-3.5 rounded-full bg-[#1a1410] hover:bg-black text-white font-semibold text-sm md:text-base transition-colors flex items-center gap-2"
              >
                Посмотреть меню
                <Icon name="ArrowRight" size={16} />
              </button>
              <button
                onClick={() => scrollTo("#partners")}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-[#f4ecdd] text-black font-semibold text-sm md:text-base transition-colors border border-black/10"
              >
                Пакеты сотрудничества
              </button>
            </div>
          </FadeIn>

          {/* быстрые факты */}
          <FadeIn delay={500}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-14 md:mt-20">
              {[
                { num: "4", label: "года на рынке" },
                { num: "120+", label: "позиций в меню" },
                { num: "18 000", label: "гостей в месяц" },
                { num: "4.9", label: "рейтинг на картах" },
              ].map((s) => (
                <div key={s.label} className="p-4 md:p-5 rounded-2xl bg-white border border-black/5">
                  <div className="font-display text-2xl md:text-3xl font-black text-[#1a1410]">{s.num}</div>
                  <div className="text-xs md:text-sm text-black/45 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
