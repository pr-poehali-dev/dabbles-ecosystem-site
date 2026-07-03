import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";

const FEATURES = [
  {
    icon: "LayoutGrid",
    title: "Экосистема сервисов\nдля жизни",
    desc: "Всё необходимое в одном пространстве — работа, учёба, отдых",
    size: "large",
  },
  {
    icon: "Gift",
    title: "Бонусы\nза участие",
    desc: "Получай награды за активность в проектах Даббл",
    size: "small",
  },
  {
    icon: "Briefcase",
    title: "Стажировки\nи карьера",
    desc: "Начни путь в компании прямо со студенческой скамьи",
    size: "small",
  },
  {
    icon: "GraduationCap",
    title: "Обучение\nи новые скилы",
    desc: "Курсы и программы развития для роста в любой сфере",
    size: "small",
  },
  {
    icon: "Landmark",
    title: "Скоро запустим\nнеобанк",
    desc: "Финансовые сервисы нового поколения уже на подходе",
    size: "small",
    accent: true,
  },
];

export default function DabblDiscover() {
  return (
    <div className="px-3 md:px-5 pb-10">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-2xl md:text-[32px] font-black text-black mb-5 text-center md:text-left">
            Откройте для себя Даббл
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Большая карточка */}
            <div className="col-span-2 row-span-2 bg-white rounded-[24px] p-6 md:p-7 flex flex-col justify-between min-h-[220px] md:min-h-[260px]">
              <div className="w-14 h-14 rounded-2xl bg-[#eef8de] flex items-center justify-center mb-4">
                <Icon name={FEATURES[0].icon} size={26} className="text-[#5a9a2a]" />
              </div>
              <div>
                <h3 className="font-black text-black text-xl md:text-2xl leading-tight mb-2 whitespace-pre-line">
                  {FEATURES[0].title}
                </h3>
                <p className="text-black/50 text-sm leading-relaxed max-w-[280px]">
                  {FEATURES[0].desc}
                </p>
              </div>
            </div>

            {/* Малые карточки */}
            {FEATURES.slice(1).map((f) => (
              <div
                key={f.title}
                className={`rounded-[24px] p-5 flex flex-col justify-between min-h-[125px] ${
                  f.accent
                    ? "text-white"
                    : "bg-white"
                }`}
                style={f.accent ? { background: "linear-gradient(140deg, #2d6a0a 0%, #5a9a2a 100%)" } : undefined}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  f.accent ? "bg-white/20" : "bg-[#eef8de]"
                }`}>
                  <Icon name={f.icon} size={18} className={f.accent ? "text-white" : "text-[#5a9a2a]"} />
                </div>
                <div>
                  <h3 className={`font-black text-sm leading-snug mb-1 whitespace-pre-line ${f.accent ? "text-white" : "text-black"}`}>
                    {f.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${f.accent ? "text-white/70" : "text-black/45"}`}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
