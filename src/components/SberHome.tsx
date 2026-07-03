import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/shared";
import { request } from "@/lib/api";
import Icon from "@/components/ui/icon";

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
  is_active?: boolean;
  button1_text: string;
  button1_href: string;
  button2_text: string;
  button2_href: string;
};

const FB_BANNER: HomeCard = {
  id: -1,
  card_type: "banner",
  title: "Каждый день лучше\nс нами",
  subtitle: "Образование, сервисы и инструменты для роста — всё в одном месте",
  icon: "",
  image_url: "",
  gradient: "",
  href: "",
  is_light: false,
  is_feature: false,
  sort_order: 1,
  button1_text: "Обучайся с нами!",
  button1_href: "/login",
  button2_text: "Узнать больше",
  button2_href: "/login",
};

function go(href: string, navigate: ReturnType<typeof useNavigate>) {
  if (!href) return;
  if (href.startsWith("http")) window.open(href, "_blank");
  else navigate(href);
}

export default function SberHome() {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<HomeCard[]>([]);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    request<{ items: HomeCard[] }>("content", { query: { kind: "home" }, auth: false })
      .then(({ items }) => { if (items?.length) setAllCards(items); })
      .catch(() => {});
  }, []);

  const banners = allCards
    .filter((c) => c.card_type === "banner" && c.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order);
  const slides = banners.length > 0 ? banners : [FB_BANNER];

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [slides.length, active]);

  const banner = slides[active] || FB_BANNER;
  const bannerLines = banner.title.split("\n");
  const hasButtons = !!banner.button1_text || !!banner.button2_text;

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  return (
    <div className="px-3 md:px-5 pb-10">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <section
            className="relative rounded-[28px] overflow-hidden"
            style={{
              background: "linear-gradient(140deg, #d4edaa 0%, #C1F089 50%, #9FC96D 100%)",
              minHeight: 420,
            }}
          >
            <div className="flex items-center h-full min-h-[420px] px-6 md:px-10 py-9">
              {/* ЛЕВАЯ ЧАСТЬ — белая пилюля */}
              <div className="relative z-10 w-full md:max-w-[400px]">
                <div className="bg-white rounded-[24px] px-6 py-7 md:px-9 md:py-9 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                  <h1 className="font-display text-2xl md:text-[36px] font-black text-black leading-[1.1] mb-3">
                    {bannerLines.map((ln, i) => (
                      <span key={i}>{ln}{i < bannerLines.length - 1 && <br />}</span>
                    ))}
                  </h1>
                  {banner.subtitle && (
                    <p className="text-black/55 text-[14px] md:text-[15px] leading-relaxed mb-6 max-w-[300px]">
                      {banner.subtitle}
                    </p>
                  )}
                  {hasButtons && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {banner.button1_text && (
                        <button
                          onClick={() => go(banner.button1_href, navigate)}
                          className="flex-1 py-3.5 px-6 rounded-[16px] text-black font-bold text-[15px] transition-all hover:opacity-90 hover:-translate-y-0.5"
                          style={{ background: "linear-gradient(120deg, #9FC96D 0%, #C1F089 100%)" }}
                        >
                          {banner.button1_text}
                        </button>
                      )}
                      {banner.button2_text && (
                        <button
                          onClick={() => go(banner.button2_href, navigate)}
                          className="flex-1 py-3.5 px-6 rounded-[16px] bg-[#f5f5f7] text-black font-bold text-[15px] transition-all hover:bg-[#ebebef]"
                        >
                          {banner.button2_text}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ПРАВАЯ ЧАСТЬ — картинка */}
              {banner.image_url && (
                <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-1/2 items-center justify-center pr-8">
                  <img
                    src={banner.image_url}
                    alt=""
                    className="max-h-[360px] w-auto object-contain drop-shadow-2xl"
                  />
                </div>
              )}

              {/* Декоративные круги (если нет картинки) */}
              {!banner.image_url && (
                <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
                  <div className="absolute right-24 top-14 w-36 h-36 rounded-full bg-white/25 blur-2xl" />
                  <div className="absolute right-8 bottom-10 w-24 h-24 rounded-full bg-[#9FC96D]/40 blur-xl" />
                  <div className="absolute right-44 bottom-20 w-16 h-16 rounded-full bg-white/30 blur-lg" />
                </div>
              )}
            </div>

            {/* Стрелки и точки — только если обложек больше одной */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors z-20"
                >
                  <Icon name="ChevronLeft" size={18} className="text-black" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors z-20"
                >
                  <Icon name="ChevronRight" size={18} className="text-black" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </FadeIn>
      </div>
    </div>
  );
}