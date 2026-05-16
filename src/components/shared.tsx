import { useState, useEffect, useRef } from "react";

export const NAV_LINKS = [
  { label: "Главная", href: "#hero" },
  { label: "О компании", href: "#about" },
  { label: "Продукты", href: "#products" },
  { label: "Инициативы", href: "#initiatives" },
  { label: "Блог", href: "#blog" },
  { label: "Контакты", href: "#contacts" },
];

export const PRODUCTS = [
  {
    icon: "Zap",
    title: "Даббл Про",
    desc: "Флагманское решение для бизнеса любого масштаба. Автоматизация, аналитика и рост.",
    tag: "Популярное",
    color: "from-[#FD4160] to-[#0077FF]",
  },
  {
    icon: "Globe",
    title: "Даббл Нетворк",
    desc: "Экосистема партнёрств и коллабораций. Расширяй горизонты вместе с сообществом.",
    tag: "Новинка",
    color: "from-[#0077FF] to-[#C1F089]",
  },
  {
    icon: "Layers",
    title: "Даббл Стэк",
    desc: "Интеграционная платформа для объединения инструментов в единый рабочий поток.",
    tag: "Бета",
    color: "from-[#C1F089] to-[#0077FF]",
  },
  {
    icon: "BarChart3",
    title: "Даббл Аналитика",
    desc: "Умная аналитика в реальном времени. Данные — это топливо вашего роста.",
    tag: "Скоро",
    color: "from-[#FD4160] to-[#C1F089]",
  },
];

export const INITIATIVES = [
  {
    emoji: "🌱",
    title: "Зелёный курс",
    desc: "Сокращаем углеродный след и инвестируем в устойчивое будущее.",
  },
  {
    emoji: "🤝",
    title: "Даббл Сообщество",
    desc: "Поддерживаем стартапы, образование и социальные проекты.",
  },
  {
    emoji: "🔬",
    title: "R&D Лаборатория",
    desc: "Исследуем технологии будущего: ИИ, квантовые вычисления, биотех.",
  },
];

export const BLOG_POSTS = [
  {
    date: "12 мая 2026",
    tag: "Тренды",
    title: "Как ИИ меняет правила игры в бизнесе",
    desc: "Разбираем ключевые трансформации, которые уже происходят прямо сейчас.",
    color: "from-[#FD4160] to-[#0077FF]",
  },
  {
    date: "5 мая 2026",
    tag: "Кейс",
    title: "История успеха: рост ×3 за полгода",
    desc: "Как наш клиент утроил выручку, внедрив Даббл Про в свои процессы.",
    color: "from-[#0077FF] to-[#C1F089]",
  },
  {
    date: "28 апреля 2026",
    tag: "Продукт",
    title: "Даббл Нетворк: первые 1000 участников",
    desc: "Делимся инсайтами и данными из первых месяцев работы платформы.",
    color: "from-[#FD4160] to-[#C1F089]",
  },
];

export type FormType = "request" | "partner" | "feedback";

export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}