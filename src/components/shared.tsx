import { useState, useEffect, useRef } from "react";

export const NAV_LINKS = [
  { label: "О компании", href: "#about" },
  { label: "Продукты", href: "#products" },
  { label: "Инвесторам", href: "#initiatives" },
  { label: "Контакты", href: "#contacts" },
];

export const PRODUCTS = [
  {
    icon: "CheckSquare",
    title: "Даббл.Трекер",
    desc: "Управление задачами и проектами внутри команды. Просто, быстро, без лишнего.",
    tag: "Сервис",
    color: "from-[#FD4160] to-[#0077FF]",
    href: "",
  },
  {
    icon: "FileText",
    title: "Формус",
    desc: "Онлайн-формы и сбор данных для бизнеса. Опросы, заявки, обратная связь.",
    tag: "Сервис",
    color: "from-[#0077FF] to-[#C1F089]",
    href: "https://forms-dubble.ru",
  },
  {
    icon: "Compass",
    title: "Компас",
    desc: "Поиск дешёвых авиабилетов и организация путешествий. Летите туда, куда мечтали.",
    tag: "Сервис",
    color: "from-[#C1F089] to-[#0077FF]",
    href: "https://даббл-компас.рф",
  },
  {
    icon: "Briefcase",
    title: "Карьера",
    desc: "Открытые вакансии и возможности внутри экосистемы Даббл.",
    tag: "Сервис",
    color: "from-[#FD4160] to-[#C1F089]",
    href: "",
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