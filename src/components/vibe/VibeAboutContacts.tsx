import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";

const VALUES = [
  { icon: "Layers", title: "Плотный хлопок", desc: "240+ г/м² — держит форму и не теряет цвет после стирок" },
  { icon: "Truck", title: "Быстрая доставка", desc: "По России 2-5 дней, самовывоз в день заказа" },
  { icon: "ShieldCheck", title: "Гарантия качества", desc: "Не подошёл размер — обменяем в течение 14 дней" },
  { icon: "Heart", title: "Сделано с любовью", desc: "Каждая вещь проходит контроль перед отправкой" },
];

export default function VibeAboutContacts() {
  return (
    <>
      {/* О БРЕНДЕ */}
      <section id="about" className="px-5 md:px-8 py-14 md:py-20 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="font-display text-3xl md:text-5xl font-black text-black">О бренде</h2>
              <Icon name="Heart" size={20} className="text-[#DAB332] -mt-4" />
            </div>
            <p className="text-black/55 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
              ВАЙБ — это не просто одежда. Это способ показать свою принадлежность к комьюнити.{" "}
              <span className="font-bold text-black">Мы создаём вещи, которые хочется носить каждый день.</span>
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <FadeIn key={v.title} delay={i * 90}>
                <div className="p-6 rounded-3xl bg-white border border-black/6 h-full hover:-translate-y-1 transition-transform">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
                  >
                    <Icon name={v.icon} size={20} className="text-black" />
                  </div>
                  <h3 className="font-bold text-black text-[15px] mb-1.5">{v.title}</h3>
                  <p className="text-black/45 text-[13px] leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ДОСТАВКА */}
      <section id="delivery" className="px-5 md:px-8 py-14 md:py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="font-display text-2xl md:text-4xl font-black">Как получить заказ</h2>
              <Icon name="Truck" size={18} className="text-[#EBD047] -mt-3" />
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "Package", title: "Оформите заказ", desc: "Добавьте товары в корзину и заполните форму" },
              { icon: "PhoneCall", title: "Мы позвоним", desc: "Уточним детали доставки и подтвердим заказ" },
              { icon: "Truck", title: "Получите мерч", desc: "Доставка курьером, почтой или самовывоз" },
            ].map((s, i) => (
              <FadeIn key={s.title} delay={i * 100}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
                  >
                    <Icon name={s.icon} size={20} className="text-black" />
                  </div>
                  <h3 className="font-bold text-[15px] mb-1.5">{s.title}</h3>
                  <p className="text-white/50 text-[13px] leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* КОНТАКТЫ */}
      <section id="contacts" className="px-5 md:px-8 py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <FadeIn>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="font-display text-2xl md:text-4xl font-black text-black">Остались вопросы?</h2>
              <Icon name="MessageCircle" size={18} className="text-[#DAB332] -mt-3" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                  <Icon name="Phone" size={15} className="text-black/50" />
                </div>
                <span className="text-black/70 text-sm font-medium">+7 (900) 000-00-00</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                  <Icon name="Mail" size={15} className="text-black/50" />
                </div>
                <span className="text-black/70 text-sm font-medium">shop@vibe-brand.ru</span>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div
              className="rounded-3xl p-8 flex items-center justify-center"
              style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)", minHeight: 160 }}
            >
              <span className="font-display font-black text-black text-4xl md:text-5xl">ВАЙБ</span>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
