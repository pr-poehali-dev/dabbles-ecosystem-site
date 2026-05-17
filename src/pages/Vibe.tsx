import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";

const LOGO_URL = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/e4d62d23-6573-4358-9c1f-692248126380.png";

const NAV = [
  { label: "Концепция", href: "#concept" },
  { label: "Меню", href: "#menu" },
  { label: "Атмосфера", href: "#vibe" },
  { label: "Сотрудничество", href: "#partners" },
  { label: "Контакты", href: "#contacts" },
];

const MENU_CATEGORIES = [
  {
    icon: "Coffee",
    title: "Кофе",
    desc: "Спешелти-зерно местной обжарки",
    items: [
      { name: "Эспрессо", price: "180 ₽" },
      { name: "Капучино", price: "260 ₽" },
      { name: "Раф ванильный", price: "320 ₽" },
      { name: "Флэт уайт", price: "280 ₽" },
      { name: "Фильтр-кофе дня", price: "240 ₽" },
    ],
  },
  {
    icon: "Croissant",
    title: "Свежая выпечка",
    desc: "Каждое утро из печи",
    items: [
      { name: "Круассан классический", price: "180 ₽" },
      { name: "Улитка с корицей", price: "210 ₽" },
      { name: "Хлеб на закваске", price: "240 ₽" },
      { name: "Чизкейк нью-йорк", price: "320 ₽" },
      { name: "Морковный торт", price: "340 ₽" },
    ],
  },
  {
    icon: "GlassWater",
    title: "Напитки",
    desc: "Лимонады, матча, какао",
    items: [
      { name: "Матча латте", price: "320 ₽" },
      { name: "Какао бельгийское", price: "280 ₽" },
      { name: "Лимонад облепиха", price: "260 ₽" },
      { name: "Чай улун / сенча", price: "220 ₽" },
    ],
  },
];

const VIBES = [
  { icon: "Music", title: "Lo-fi плейлисты", desc: "Атмосферный фон для работы и встреч" },
  { icon: "Wifi", title: "Бесплатный Wi-Fi", desc: "Быстрый интернет, удобные розетки у каждого стола" },
  { icon: "Sun", title: "Много света", desc: "Большие окна, живые растения, тёплое дерево" },
  { icon: "BookOpen", title: "Книжная полка", desc: "Бери, читай, оставляй свою — у нас буккроссинг" },
];

const PACKAGES = [
  {
    name: "Партнёрка",
    price: "от 0 ₽",
    period: "вход",
    desc: "Приведи гостей — получай процент",
    features: [
      "Личный промокод и QR-материалы",
      "10% с каждого чека по вашему коду",
      "Доступ к личному кабинету с аналитикой",
      "Выплаты раз в месяц на карту или счёт",
      "Без обязательств и минимального оборота",
    ],
    accent: false,
    badge: "",
    cta: "Стать партнёром",
  },
  {
    name: "Франшиза",
    price: "от 1 200 000 ₽",
    period: "паушальный взнос",
    desc: "Откройте свою ВАЙБ в своём городе",
    features: [
      "Готовый бренд-бук и дизайн-проект",
      "Обучение команды и шеф-бариста",
      "Технологические карты и поставщики",
      "Маркетинговая поддержка с открытия",
      "Роялти 4% от выручки",
      "Окупаемость от 14 месяцев",
    ],
    accent: true,
    badge: "Хит сезона",
    cta: "Получить презентацию",
  },
  {
    name: "Корпоративный\u00A0договор",
    price: "индивидуально",
    period: "",
    desc: "Для бизнес-центров и компаний",
    features: [
      "Корпоративные карты со скидкой 10–20%",
      "Поставка кофе и выпечки в офис",
      "Кофе-брейки на ваших мероприятиях",
      "Брендированные позиции для команды",
      "Безналичная оплата и закрывающие документы",
    ],
    accent: false,
    badge: "",
    cta: "Обсудить условия",
  },
];

const STEPS = [
  { num: "01", title: "Оставляете заявку", desc: "Заполняете форму или пишете в Telegram — отвечаем в течение дня." },
  { num: "02", title: "Созваниваемся", desc: "Знакомимся, отвечаем на вопросы, высылаем подробную презентацию." },
  { num: "03", title: "Подписываем договор", desc: "Финализируем условия, оформляем документы, фиксируем стартовую дату." },
  { num: "04", title: "Запускаемся", desc: "Помогаем со стартом: материалы, обучение, поддержка на старте." },
];

export default function Vibe() {
  const [openCat, setOpenCat] = useState(0);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", contact: "", message: "" });
  };

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#1a1410] font-body">
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

      {/* PARTNERS / PACKAGES */}
      <section id="partners" className="px-5 md:px-8 py-16 md:py-24 bg-[#1a1410] text-white relative overflow-hidden">
        <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-[#FFB562]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-[#A77B5A]/20 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40 font-semibold mb-3">
              Сотрудничество
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black mb-5 leading-tight max-w-3xl">
              Зарабатывайте вместе с&nbsp;ВАЙБ
            </h2>
            <p className="text-white/55 text-base md:text-lg max-w-2xl leading-relaxed mb-12">
              Три формата: лёгкая партнёрка с процентом от чека, полноценная франшиза
              с открытием своей точки и корпоративные договоры для бизнеса.
              Выбирайте, что вам ближе.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {PACKAGES.map((p, i) => (
              <FadeIn key={p.name} delay={i * 100}>
                <div
                  className={`relative p-7 rounded-3xl h-full flex flex-col ${
                    p.accent
                      ? "bg-[#FFB562] text-[#1a1410]"
                      : "bg-white/5 border border-white/10 text-white"
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-[#1a1410] text-white text-[11px] font-bold uppercase tracking-wider">
                      {p.badge}
                    </div>
                  )}
                  <div className="font-display text-xl font-black mb-1">{p.name}</div>
                  <div className={`text-sm mb-5 ${p.accent ? "text-[#1a1410]/65" : "text-white/55"}`}>
                    {p.desc}
                  </div>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-black">{p.price}</span>
                    {p.period && (
                      <span className={`text-sm ${p.accent ? "text-[#1a1410]/60" : "text-white/50"}`}>
                        {p.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Icon
                          name="Check"
                          size={16}
                          className={`mt-0.5 shrink-0 ${p.accent ? "text-[#1a1410]" : "text-[#FFB562]"}`}
                        />
                        <span className={p.accent ? "text-[#1a1410]/85" : "text-white/80"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => scrollTo("#contacts")}
                    className={`w-full py-3 rounded-full font-semibold text-sm transition-colors ${
                      p.accent
                        ? "bg-[#1a1410] text-white hover:bg-black"
                        : "bg-white text-[#1a1410] hover:bg-[#FFB562]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Steps */}
          <FadeIn>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-10">
              <h3 className="font-display text-xl md:text-2xl font-black mb-7">Как мы работаем</h3>
              <div className="grid md:grid-cols-4 gap-5">
                {STEPS.map((s) => (
                  <div key={s.num}>
                    <div className="font-display text-3xl font-black text-[#FFB562] mb-2">{s.num}</div>
                    <div className="font-semibold mb-1.5">{s.title}</div>
                    <div className="text-sm text-white/55 leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="px-5 md:px-8 py-16 md:py-24 bg-[#FBF6EE]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <FadeIn>
              <div className="text-xs uppercase tracking-[0.25em] text-black/40 font-semibold mb-3">
                Контакты
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black mb-6 leading-tight">
                Заходите в гости или пишите
              </h2>

              <div className="space-y-4 mb-8">
                <ContactRow icon="MapPin" title="ул. Кофейная, 10" sub="Центр города, 2 минуты от метро" />
                <ContactRow icon="Clock" title="Каждый день · 8:00 – 22:00" sub="В выходные — до 23:00" />
                <ContactRow icon="Phone" title="+7 (900) 000-00-00" sub="Звоните по любым вопросам" />
                <ContactRow icon="Mail" title="hello@vibe-cafe.ru" sub="Для сотрудничества и предложений" />
              </div>

              <div className="flex gap-2">
                {[
                  { icon: "Send", label: "Telegram" },
                  { icon: "Instagram", label: "Instagram" },
                  { icon: "MessageCircle", label: "WhatsApp" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    className="w-11 h-11 rounded-full bg-white hover:bg-[#1a1410] hover:text-white border border-black/10 flex items-center justify-center transition-colors"
                    title={s.label}
                  >
                    <Icon name={s.icon} size={17} />
                  </a>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <form onSubmit={submit} className="bg-white rounded-3xl p-7 md:p-9 border border-black/5">
                <div className="font-display text-xl md:text-2xl font-black mb-1">Оставьте сообщение</div>
                <div className="text-sm text-black/50 mb-6">Ответим в течение рабочего дня</div>

                <div className="space-y-3">
                  <Input label="Как вас зовут?" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Input
                    label="Телефон или email"
                    value={form.contact}
                    onChange={(v) => setForm({ ...form, contact: v })}
                  />
                  <div>
                    <label className="text-xs text-black/50 mb-1.5 block font-medium">Сообщение</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Хочу обсудить сотрудничество..."
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:border-black/30 outline-none text-black resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#1a1410] hover:bg-black text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {sent ? (
                      <>
                        <Icon name="CheckCircle2" size={18} /> Отправлено
                      </>
                    ) : (
                      <>
                        Отправить <Icon name="ArrowRight" size={16} />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-black/40 text-center pt-1">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </div>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1410] text-white px-5 md:px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ВАЙБ" className="h-8 w-auto invert" />
            <div className="text-xs text-white/40">кофейня · пекарня · 2026</div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-white/55">
            {NAV.map((n) => (
              <button key={n.href} onClick={() => scrollTo(n.href)} className="hover:text-white">
                {n.label}
              </button>
            ))}
          </div>
          <Link to="/" className="text-xs text-white/35 hover:text-white">
            ← Основной сайт
          </Link>
        </div>
      </footer>
    </div>
  );
}

function ContactRow({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-2xl bg-white border border-black/8 flex items-center justify-center shrink-0">
        <Icon name={icon} size={17} className="text-[#1a1410]" />
      </div>
      <div>
        <div className="font-semibold text-[#1a1410]">{title}</div>
        <div className="text-sm text-black/45">{sub}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:border-black/30 outline-none text-black transition-colors"
      />
    </div>
  );
}