import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";

const QUICK_LINKS = [
  { icon: "Newspaper", label: "Новости", href: "/director" },
  { icon: "LineChart", label: "Инвесторам", href: "/about" },
  { icon: "FileText", label: "Документы", href: "/privacy" },
  { icon: "ClipboardList", label: "Реквизиты", href: "/legal" },
  { icon: "Sparkles", label: "Бренд", href: "/vibe" },
];

const DISABLED = true;

export default function QuickLinksBar() {
  return (
    <div className="px-3 md:px-5 pt-4 pb-2">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 md:px-8 py-5 overflow-x-auto">
            <div className="flex items-center gap-6 md:gap-10 min-w-max md:justify-center">
              {QUICK_LINKS.map((q) => (
                <div
                  key={q.label}
                  className={`flex flex-col items-center gap-2 group shrink-0 ${
                    DISABLED ? "opacity-40 cursor-not-allowed select-none" : ""
                  }`}
                  title={DISABLED ? "Скоро будет доступно" : undefined}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f0f8e8] flex items-center justify-center transition-all duration-300 group-hover:bg-[#C1F089] group-hover:-translate-y-1 group-hover:shadow-md">
                    <Icon
                      name={q.icon}
                      size={20}
                      className="text-[#5a9a2a] transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-black/70 group-hover:text-black transition-colors whitespace-nowrap">
                    {q.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
