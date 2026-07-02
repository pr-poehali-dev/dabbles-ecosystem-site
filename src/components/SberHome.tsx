import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/shared";
import { request } from "@/lib/api";

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

const FB_BANNER: HomeCard = {
  id: 31,
  card_type: "banner",
  title: "Каждый день лучше\nс нами",
  subtitle: "Образование, сервисы и инструменты для роста — всё в одном месте",
  icon: "",
  image_url: "",
  gradient: "",
  href: "/login",
  is_light: false,
  is_feature: false,
  sort_order: 1,
};

function go(href: string, navigate: ReturnType<typeof useNavigate>) {
  if (!href) return;
  if (href.startsWith("http")) window.open(href, "_blank");
  else navigate(href);
}

export default function SberHome() {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<HomeCard[]>([]);

  useEffect(() => {
    request<{ items: HomeCard[] }>("content", { query: { kind: "home" }, auth: false })
      .then(({ items }) => { if (items?.length) setAllCards(items); })
      .catch(() => {});
  }, []);

  const banner = allCards.find((c) => c.card_type === "banner") || FB_BANNER;
  const bannerLines = banner.title.split("\n");

  return (
    <div className="px-3 md:px-5 pb-10">
      <FadeIn>
        <section
          className="relative rounded-[28px] overflow-hidden"
          style={{
            background: "linear-gradient(140deg, #d4edaa 0%, #C1F089 50%, #9FC96D 100%)",
            minHeight: 480,
          }}
        >
          <div className="flex items-center h-full min-h-[480px] px-7 md:px-12 py-10">
            {/* ЛЕВАЯ ЧАСТЬ — белая пилюля */}
            <div className="relative z-10 w-full md:max-w-[420px]">
              <div className="bg-white rounded-[28px] px-7 py-8 md:px-10 md:py-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                <h1 className="font-display text-3xl md:text-[42px] font-black text-black leading-[1.08] mb-4">
                  {bannerLines.map((ln, i) => (
                    <span key={i}>{ln}{i < bannerLines.length - 1 && <br />}</span>
                  ))}
                </h1>
                {banner.subtitle && (
                  <p className="text-black/55 text-[15px] md:text-base leading-relaxed mb-7 max-w-[320px]">
                    {banner.subtitle}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => go(banner.href || "/login", navigate)}
                    className="flex-1 py-3.5 px-6 rounded-[16px] text-black font-bold text-[15px] transition-all hover:opacity-90 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(120deg, #9FC96D 0%, #C1F089 100%)" }}
                  >
                    Обучайся с нами!
                  </button>
                  <button
                    onClick={() => go(banner.href || "/login", navigate)}
                    className="flex-1 py-3.5 px-6 rounded-[16px] bg-[#f5f5f7] text-black font-bold text-[15px] transition-all hover:bg-[#ebebef]"
                  >
                    Узнать больше
                  </button>
                </div>
              </div>
            </div>

            {/* ПРАВАЯ ЧАСТЬ — картинка */}
            {banner.image_url && (
              <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-1/2 items-center justify-center pr-10">
                <img
                  src={banner.image_url}
                  alt=""
                  className="max-h-[420px] w-auto object-contain drop-shadow-2xl"
                />
              </div>
            )}

            {/* Декоративные круги (если нет картинки) */}
            {!banner.image_url && (
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
                <div className="absolute right-24 top-16 w-40 h-40 rounded-full bg-white/25 blur-2xl" />
                <div className="absolute right-8 bottom-12 w-28 h-28 rounded-full bg-[#9FC96D]/40 blur-xl" />
                <div className="absolute right-48 bottom-24 w-20 h-20 rounded-full bg-white/30 blur-lg" />
              </div>
            )}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
