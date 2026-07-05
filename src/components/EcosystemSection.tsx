import { Link } from "react-router-dom";
import { FadeIn } from "@/components/shared";

const ECOSYSTEM = [
  {
    title: "Необанкинг",
    desc: "Мы создали крутой необанк, который помещает в себя не только переводы, но и развлечения",
    logo: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/570ac7ff-3ee5-4052-bede-b694d0d83acf.png",
    bg: "#EBF6D6",
    href: "",
  },
  {
    title: "Кэмп",
    desc: "Образовательный центр для молодых и предприимчивых",
    logo: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/83f38ca5-335d-4937-b8fb-95919dc27a5f.png",
    bg: "#FBF0D6",
    href: "/camp",
  },
  {
    title: "Даббл.Бизнес",
    desc: "Сервисы для предпринимателей, которые знают больше",
    logo: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/47bd8514-d757-4224-aed9-db44f6d16dbf.png",
    bg: "#FBE9DE",
    href: "",
  },
  {
    title: "Даббл.Технологии безопасности",
    desc: "Создаём безопасность для себя и партнёров",
    logo: "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/3598a651-3d89-45a7-965c-6cd903831a0c.png",
    bg: "#EDEDF0",
    href: "/security",
  },
];

function EcosystemCard({ item, delay }: { item: (typeof ECOSYSTEM)[number]; delay: number }) {
  const content = (
    <div
      className="rounded-[24px] p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] cursor-pointer"
      style={{ background: item.bg }}
    >
      <div className="w-24 h-24 md:w-28 md:h-28 mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
        <img src={item.logo} alt={item.title} className="w-full h-full object-contain drop-shadow-md" />
      </div>
      <h3 className="font-display text-lg md:text-xl font-black text-black mb-2 leading-tight">
        {item.title}
      </h3>
      <p className="text-black/50 text-sm leading-relaxed">{item.desc}</p>
    </div>
  );

  return (
    <FadeIn delay={delay}>
      <div className="group h-full">
        {item.href ? (
          <Link to={item.href} className="block h-full">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </FadeIn>
  );
}

export default function EcosystemSection() {
  return (
    <div className="px-3 md:px-5 py-10 md:py-14">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-2xl md:text-[32px] font-black text-black mb-6 md:mb-8 text-center md:text-left">
            Экосистема «Даббл»
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {ECOSYSTEM.map((item, i) => (
            <EcosystemCard key={item.title} item={item} delay={i * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}
