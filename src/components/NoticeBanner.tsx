import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";

export default function NoticeBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border-2 border-[#F5C518] bg-[#FFF8E1] p-5 md:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F5C518]/25 flex items-center justify-center shrink-0">
          <Icon name="TriangleAlert" size={18} className="text-[#B8860B]" />
        </div>
        <div className="text-sm md:text-[15px] text-[#5c4a00] leading-relaxed">
          <div className="font-bold text-[#7a5c00] mb-1.5 text-base">Важное объявление</div>
          <p className="mb-2">
            В ближайшее время состоится <b>смена юридического лица</b>. По решению учредителя
            введён <b>мораторий на расчёты</b>.
          </p>
          <p>
            По всем вопросам обращайтесь через{" "}
            <Link to="/#contacts" className="font-semibold text-[#B8860B] underline underline-offset-2 hover:text-[#8a6500]">
              форму обратной связи
            </Link>{" "}
            и следите за обновлениями.
          </p>
        </div>
      </div>
    </div>
  );
}
