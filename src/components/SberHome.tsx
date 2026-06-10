import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { request } from "@/lib/api";

const IMG = {
  piggy: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/925b0945-cd91-4b71-bda9-73b998c95cc9.jpg",
  sticker: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/c09f3176-2ad6-453a-b6b5-3059ac510b72.jpg",
  gift: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/31839e79-4a8f-4cfb-87d2-511fdc8408c9.jpg",
  phone: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/f822c5b6-73ce-4bad-a85c-e2a598dc89cd.jpg",
};

type HomeCard = {
  id: number;
  card_type: string;
  title: string;
  subtitle: string;
  icon: string;
  image_url: string;
  gradient: string;
  href: string;
  is_light: boolean;
  is_feature: boolean;
  sort_order: number;
};

// ── Fallback-данные (если бэкенд недоступен) ──
const FB_FINANCE: HomeCard[] = [
  { id: 11, card_type: "finance", title: "Управление задачами\nи проектами", subtitle: "", icon: "", image_url: IMG.piggy, gradient: "", href: "", is_light: false, is_feature: false, sort_order: 1 },
  { id: 12, card_type: "finance", title: "Конструктор форм\nс дизайном на выбор", subtitle: "", icon: "", image_url: IMG.sticker, gradient: "", href: "https://forms-dubble.ru", is_light: false, is_feature: false, sort_order: 2 },
  { id: 13, card_type: "finance", title: "Попробуй Даббл Про\nза 1 ₽", subtitle: "", icon: "", image_url: "", gradient: "", href: "/about", is_light: false, is_feature: true, sort_order: 3 },
  { id: 14, card_type: "finance", title: "Витрина сервисов\nот Даббл", subtitle: "", icon: "", image_url: IMG.gift, gradient: "", href: "/about", is_light: false, is_feature: false, sort_order: 4 },
];
const FB_LIFE: HomeCard[] = [
  { id: 21, card_type: "life", title: "Путешествия\nс Компасом", subtitle: "", icon: "", image_url: IMG.phone, gradient: "", href: "https://даббл-компас.рф", is_light: true, is_feature: false, sort_order: 1 },
  { id: 22, card_type: "life", title: "Стань частью\nсообщества", subtitle: "", icon: "", image_url: "", gradient: "", href: "/about", is_light: false, is_feature: true, sort_order: 2 },
];
const FB_BANNER: HomeCard = { id: 31, card_type: "banner", title: "Выиграйте\n120 000 бонусов", subtitle: "Подключите Даббл Про и участвуйте в розыгрыше для команд", icon: "", image_url: IMG.gift, gradient: "", href: "/about", is_light: false, is_feature: false, sort_order: 1 };

function go(href: string, navigate: ReturnType<typeof useNavigate>) {
  if (!href) return;
  if (href.startsWith("http")) window.open(href, "_blank");
  else navigate(href);
}

export default function SberHome() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"finance" | "life">("finance");
  const [allCards, setAllCards] = useState<HomeCard[]>([]);

  useEffect(() => {
    request<{ items: HomeCard[] }>("content", { query: { kind: "home" }, auth: false })
      .then(({ items }) => { if (items?.length) setAllCards(items); })
      .catch(() => {});
  }, []);

  const byType = (tp: string, fb: HomeCard[]) => {
    const list = allCards.filter((c) => c.card_type === tp).sort((a, b) => a.sort_order - b.sort_order);
    return list.length ? list : fb;
  };

  const banner = allCards.find((c) => c.card_type === "banner") || FB_BANNER;
  const cards = tab === "finance" ? byType("finance", FB_FINANCE) : byType("life", FB_LIFE);
  const bannerLines = banner.title.split("\n");

  return (
    <div className="px-3 md:px-5 pb-10">
      {/* ═══ ГЛАВНЫЙ БАННЕР ═══ */}
      <FadeIn>
        <section
          className="relative rounded-[28px] overflow-hidden p-7 md:p-12"
          style={{ background: "linear-gradient(120deg, #eef4ff 0%, #e4ecff 45%, #f2f8e6 100%)", minHeight: 420 }}
        >
          <div className="relative z-10 max-w-md">
            <div className="inline-block bg-white rounded-3xl px-6 py-5 md:px-8 md:py-7 shadow-sm">
              <h1 className="font-display text-3xl md:text-5xl font-black text-black leading-[1.05] mb-3">
                {bannerLines.map((ln, i) => (
                  <span key={i}>{ln}{i < bannerLines.length - 1 && <br />}</span>
                ))}
              </h1>
              <p className="text-black/55 text-base md:text-lg leading-snug mb-5 max-w-xs">
                {banner.subtitle}
              </p>
              <button
                onClick={() => go(banner.href, navigate)}
                className="inline-flex items-center gap-1.5 text-[#0077FF] font-bold text-lg hover:gap-2.5 transition-all"
              >
                Подробнее <Icon name="ChevronRight" size={20} />
              </button>
            </div>
          </div>

          {/* Декоративная картинка справа */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
            {banner.image_url && (
              <img src={banner.image_url} alt="" className="absolute right-8 top-1/2 -translate-y-1/2 w-72 h-72 object-contain drop-shadow-2xl" />
            )}
            <div className="absolute right-48 top-16 w-24 h-24 rounded-full bg-gradient-to-br from-[#56CCF2] to-[#0077FF] blur-sm opacity-50" />
            <div className="absolute right-12 bottom-16 w-20 h-20 rounded-full bg-gradient-to-br from-[#FD4160] to-[#FF8A5B] blur-sm opacity-45" />
          </div>
        </section>
      </FadeIn>

      {/* ═══ ТАБЫ + СЕТКА КАРТОЧЕК ═══ */}
      <div id="products" className="mt-8">
        {/* Табы */}
        <FadeIn>
          <div className="bg-white rounded-[26px] p-1.5 flex shadow-sm mb-6">
            <button
              onClick={() => setTab("finance")}
              className={`flex-1 py-4 rounded-[22px] text-lg font-bold transition-all ${
                tab === "finance" ? "bg-[#f0f0f5] text-black shadow-sm" : "text-black/40 hover:text-black/60"
              }`}
            >
              Сервисы
            </button>
            <button
              onClick={() => setTab("life")}
              className={`flex-1 py-4 rounded-[22px] text-lg font-bold transition-all ${
                tab === "life" ? "bg-[#f0f0f5] text-black shadow-sm" : "text-black/40 hover:text-black/60"
              }`}
            >
              Для жизни
            </button>
          </div>
        </FadeIn>

        {/* Карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <FadeIn key={tab + card.id} delay={i * 60}>
              <SberCard card={card} onClick={() => go(card.href, navigate)} />
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ═══ БЛОК ВИДЖЕТОВ ═══ */}
      <WidgetsSection />
    </div>
  );
}

function SberCard({ card, onClick }: { card: HomeCard; onClick: () => void }) {
  // Фичевая брендовая карточка
  if (card.is_feature) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-[24px] overflow-hidden group relative h-full min-h-[300px] flex items-end p-7 transition-transform hover:-translate-y-1"
        style={{ background: "linear-gradient(135deg, #0077FF 0%, #1a0a6e 60%, #2d0060 100%)" }}
      >
        <div className="absolute top-7 right-7 w-20 h-20 rounded-2xl bg-white/90 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform shadow-lg">
          <Icon name={card.icon || "Sparkles"} size={40} className="text-[#0077FF]" />
        </div>
        <h3 className="relative z-10 font-display text-2xl font-black text-white leading-tight whitespace-pre-line">
          {card.title}
        </h3>
      </button>
    );
  }

  // Тёмная карточка
  if (card.is_light) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-[24px] overflow-hidden group relative h-full min-h-[300px] bg-[#1a1a1a] transition-transform hover:-translate-y-1"
      >
        {card.image_url && (
          <img src={card.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h3 className="relative z-10 p-7 font-display text-2xl font-black text-white leading-tight whitespace-pre-line">
          {card.title}
        </h3>
      </button>
    );
  }

  // Обычная белая карточка
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[24px] overflow-hidden group bg-white h-full min-h-[300px] flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg"
    >
      <h3 className="px-7 pt-7 pb-4 font-display text-2xl font-black text-black leading-tight whitespace-pre-line">
        {card.title}
      </h3>
      {card.image_url && (
        <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden bg-[#f5f5f7]">
          <img src={card.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ minHeight: 160 }} />
        </div>
      )}
    </button>
  );
}

// ═══ ВИДЖЕТЫ (3-й скрин) ═══
function WidgetsSection() {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
      {/* Калькулятор */}
      <FadeIn>
        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-sm rounded-[28px] p-8 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, #1a0a6e 0%, #0a0535 100%)", minHeight: 300 }}
          >
            <div className="text-white/70 text-sm mb-2">К 31 декабря накопите</div>
            <div className="font-display text-4xl md:text-5xl font-black text-white mb-6">1 109 726 ₽</div>
            <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 flex items-center justify-between">
              <span className="text-white/60 text-sm">Заработали</span>
              <span className="text-white font-bold">54 526 ₽</span>
            </div>
          </div>
          <h3 className="mt-5 font-display text-2xl font-black text-black">Калькулятор процентов</h3>
        </div>
      </FadeIn>

      {/* Мини-приложение */}
      <FadeIn delay={100}>
        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-sm rounded-[28px] p-7 relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, #dce8ff 0%, #b8d4ff 100%)", minHeight: 300 }}
          >
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Search" size={14} className="text-black/30" />
                <span className="text-black/30 text-xs">Поиск</span>
              </div>
              <div className="font-display text-3xl font-black text-black mb-4">12 000,00 ₽</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#f0f0f5] rounded-xl p-3">
                  <div className="text-black/40 text-[10px] mb-1">Visa Digital</div>
                  <div className="font-bold text-sm">12 000 ₽</div>
                </div>
                <div className="bg-[#f0f0f5] rounded-xl p-3">
                  <div className="text-black/40 text-[10px] mb-1">Счёт ·· 2677</div>
                  <div className="font-bold text-sm">0,00 ₽</div>
                </div>
              </div>
            </div>
          </div>
          <h3 className="mt-5 font-display text-2xl font-black text-black">Личный кабинет</h3>
        </div>
      </FadeIn>

      {/* Карта офисов */}
      <FadeIn>
        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-sm rounded-[28px] p-7 relative overflow-hidden flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #eef0e8 0%, #dde0d4 100%)", minHeight: 300 }}
          >
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-3xl bg-[#e4e6da] rotate-3" style={{
                backgroundImage: "repeating-linear-gradient(45deg, #d8dccd 0 2px, transparent 2px 16px), repeating-linear-gradient(-45deg, #d8dccd 0 2px, transparent 2px 16px)"
              }} />
              <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-black flex items-center justify-center shadow-lg">
                <Icon name="MapPin" size={24} className="text-white" />
              </div>
              <div className="absolute bottom-8 left-8 w-11 h-11 rounded-full bg-[#0077FF] flex items-center justify-center shadow-lg">
                <Icon name="MapPin" size={22} className="text-white" />
              </div>
            </div>
          </div>
          <h3 className="mt-5 font-display text-2xl font-black text-black">Офисы и поддержка</h3>
        </div>
      </FadeIn>

      {/* Курсы валют */}
      <FadeIn delay={100}>
        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-sm rounded-[28px] p-7 relative overflow-hidden flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #2d0060 0%, #1a0a3a 100%)", minHeight: 300 }}
          >
            <div className="bg-white rounded-3xl px-8 py-7 shadow-2xl">
              <div className="text-black/50 text-sm mb-4 text-center">Сейчас в офисе</div>
              <div className="space-y-2">
                <div className="flex items-center gap-6 text-2xl font-black text-black">
                  <span className="text-black/40">EUR</span> <span>91.3</span>
                </div>
                <div className="flex items-center gap-6 text-2xl font-black text-black">
                  <span className="text-black/40">USD</span> <span>77.3</span>
                </div>
              </div>
            </div>
          </div>
          <h3 className="mt-5 font-display text-2xl font-black text-black">Курсы валют</h3>
        </div>
      </FadeIn>
    </div>
  );
}