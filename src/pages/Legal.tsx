import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import NoticeBanner from "@/components/NoticeBanner";

const DETAILS = [
  { label: "Полное наименование", value: "Общество с ограниченной ответственностью «ДАББЛ РУС»" },
  { label: "Краткое наименование", value: "ООО «ДАББЛ РУС»" },
  { label: "Дата регистрации", value: "15 января 2025 г." },
  { label: "ОГРН", value: "1258900000050" },
  { label: "ИНН", value: "8905069677" },
  { label: "КПП", value: "890501001" },
  { label: "Юридический адрес", value: "629808, Ямало-Ненецкий автономный округ, г. Ноябрьск, ул. Магистральная, д. 119, кв. 212" },
];

export default function Legal() {
  const [params] = useSearchParams();
  const fromMeroshkins = params.get("from") === "meroshkins";
  const backTo = fromMeroshkins ? "/meroshkins/promo" : "/";
  const backLabel = fromMeroshkins ? "Вернуться в Мерошкинс" : "На главную";

  return (
    <div className="min-h-screen bg-white font-body">
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white border-b border-black/8 flex items-center px-6 md:px-10">
        <Link to={backTo} className="flex items-center gap-2 text-black/50 hover:text-black transition-colors text-sm font-medium">
          <Icon name="ArrowLeft" size={16} />
          {backLabel}
        </Link>
      </nav>
      <div className="pt-[68px] max-w-3xl mx-auto px-5 md:px-6 py-10 md:py-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f0f5] text-black/50 text-xs font-semibold mb-4">
          <Icon name="Building2" size={13} />
          Юридическая информация
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-black text-black mb-6">Реквизиты организации</h1>

        <NoticeBanner className="mb-8" />

        <div className="bg-[#f5f5f7] rounded-3xl overflow-hidden mb-8">
          {DETAILS.map((row, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row gap-1 sm:gap-6 px-5 py-4 md:px-7 md:py-5 ${i < DETAILS.length - 1 ? "border-b border-black/6" : ""}`}
            >
              <div className="text-black/40 text-sm font-medium sm:w-48 shrink-0">{row.label}</div>
              <div className="text-black font-semibold text-sm">{row.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a0a6e]/5 border border-[#1a0a6e]/15 rounded-2xl p-5 md:p-6 text-sm text-black/60 leading-relaxed">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={16} className="text-[#1a0a6e] mt-0.5 shrink-0" />
            <p>
              Настоящие сведения размещены в соответствии с требованиями законодательства Российской Федерации. 
              ООО «ДАББЛ РУС» зарегистрировано в Едином государственном реестре юридических лиц (ЕГРЮЛ).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
          <Link to="/privacy" className="text-[#0077FF] hover:underline">Политика конфиденциальности</Link>
          <Link to="/offer" className="text-[#0077FF] hover:underline">Публичная оферта на оказание услуг</Link>
        </div>
      </div>
      <footer className="bg-black px-6 py-6 mt-10">
        <p className="text-center text-white/20 text-sm">© 2025 ООО «ДАББЛ РУС»</p>
      </footer>
    </div>
  );
}