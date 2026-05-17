import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { MENU_CATEGORIES, VIBES } from "./constants";

interface VibeConceptMenuProps {
  openCat: number;
  setOpenCat: (i: number) => void;
}

export default function VibeConceptMenu({ openCat, setOpenCat }: VibeConceptMenuProps) {
  return (
    <>
      {/* CONCEPT */}
      <section id="concept" className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-xs uppercase tracking-[0.25em] text-black/40 font-semibold mb-3">
              Наша концепция
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black mb-5 max-w-3xl leading-tight">
              Третье место. Не дом, не работа — а где-то посередине.
            </h2>
            <p className="text-black/55 text-base md:text-lg max-w-2xl leading-relaxed mb-12">
              Мы создаём пространство, в котором хочется задержаться. Без спешки,
              без снобизма, без громкой музыки. С хорошим кофе и тёплой выпечкой.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: "Sparkles",
                title: "Спешелти-кофе",
                desc: "Зерно от локальных обжарщиков. Бариста, которые знают каждое зерно по имени.",
                bg: "#F4ECDD",
              },
              {
                icon: "Wheat",
                title: "Своя пекарня",
                desc: "Печём круассаны, бриоши, хлеб на закваске. Каждое утро в 5 утра у плиты — Денис.",
                bg: "#E8DCC4",
              },
              {
                icon: "Heart",
                title: "Своя комьюнити",
                desc: "Лекции, кинопоказы, маркеты местных мастеров. И постоянные гости, которых мы знаем по именам.",
                bg: "#FFD9A8",
              },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 90}>
                <div
                  className="p-7 rounded-3xl h-full hover:-translate-y-1 transition-transform"
                  style={{ background: c.bg }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center mb-5">
                    <Icon name={c.icon} size={22} className="text-[#1a1410]" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{c.title}</h3>
                  <p className="text-black/60 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="px-5 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-xs uppercase tracking-[0.25em] text-black/40 font-semibold mb-3">
              Что попробовать
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black mb-12 leading-tight">
              Меню, в которое влюбляются
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {MENU_CATEGORIES.map((cat, i) => (
              <FadeIn key={cat.title} delay={i * 90}>
                <div
                  className={`rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                    openCat === i ? "border-[#1a1410] bg-[#FBF6EE]" : "border-black/10 hover:border-black/25"
                  }`}
                  onClick={() => setOpenCat(i)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#1a1410] text-white flex items-center justify-center">
                        <Icon name={cat.icon} size={20} />
                      </div>
                      <div>
                        <div className="font-display text-lg font-bold">{cat.title}</div>
                        <div className="text-xs text-black/45">{cat.desc}</div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {cat.items.map((it) => (
                        <div key={it.name} className="flex items-baseline gap-3">
                          <span className="text-sm text-black/75">{it.name}</span>
                          <span className="flex-1 border-b border-dotted border-black/15" />
                          <span className="text-sm font-semibold text-[#1a1410]">{it.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="mt-10 p-6 md:p-8 rounded-3xl bg-[#FBF6EE] flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB562] flex items-center justify-center shrink-0">
                <Icon name="Leaf" size={22} className="text-[#1a1410]" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg md:text-xl font-bold mb-1">Растительное молоко — бесплатно</div>
                <div className="text-sm text-black/55">
                  Овсяное, миндальное, кокосовое. Без наценки, потому что заботиться о себе — не должно быть дорого.
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* VIBE / ATMOSPHERE */}
      <section id="vibe" className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn>
              <div className="text-xs uppercase tracking-[0.25em] text-black/40 font-semibold mb-3">
                Атмосфера
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black mb-6 leading-tight">
                Зайдёшь за кофе — останешься на час
              </h2>
              <p className="text-black/55 text-base md:text-lg leading-relaxed mb-8">
                Мы продумали каждую деталь: от температуры света до тёплого
                дерева под рукой. Здесь хочется работать, читать, разговаривать
                и&nbsp;ничего не делать.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map((v) => (
                  <div key={v.title} className="p-4 rounded-2xl bg-white border border-black/5">
                    <Icon name={v.icon} size={18} className="text-[#1a1410] mb-2" />
                    <div className="font-semibold text-sm mb-1">{v.title}</div>
                    <div className="text-xs text-black/45 leading-relaxed">{v.desc}</div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-gradient-to-br from-[#FFB562] to-[#E89B5A] aspect-[4/5] p-6 flex flex-col justify-between">
                  <Icon name="Coffee" size={28} className="text-white/70" />
                  <div>
                    <div className="font-display text-2xl font-black text-white">Утро</div>
                    <div className="text-white/80 text-sm">с 8:00</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-[#1a1410] aspect-[4/5] p-6 flex flex-col justify-between mt-8">
                  <Icon name="Moon" size={28} className="text-white/40" />
                  <div>
                    <div className="font-display text-2xl font-black text-white">Вечер</div>
                    <div className="text-white/50 text-sm">до 22:00</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-[#E8DCC4] aspect-[4/5] p-6 flex flex-col justify-between -mt-4">
                  <Icon name="Croissant" size={28} className="text-[#8a6a3a]" />
                  <div>
                    <div className="font-display text-2xl font-black text-[#1a1410]">120+</div>
                    <div className="text-black/55 text-sm">позиций меню</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-[#FBF6EE] border border-black/8 aspect-[4/5] p-6 flex flex-col justify-between mt-4">
                  <Icon name="Star" size={28} className="text-[#E89B5A]" />
                  <div>
                    <div className="font-display text-2xl font-black text-[#1a1410]">4.9</div>
                    <div className="text-black/55 text-sm">на 2ГИС и Яндексе</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
