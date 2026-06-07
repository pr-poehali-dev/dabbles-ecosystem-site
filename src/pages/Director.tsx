import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHOTO = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/2a281114-efe8-4e7f-a35b-4fced26c2d80.jpg";

const BIOGRAPHY = [
  {
    year: "2002–2010",
    title: "Начало карьеры",
    text: "Окончил Московский государственный университет по специальности «Экономика и управление». Начал карьеру в крупной консалтинговой компании, где прошёл путь от аналитика до руководителя проектного офиса.",
  },
  {
    year: "2010–2018",
    title: "Управление и рост",
    text: "Занимал руководящие позиции в ведущих технологических компаниях России. Специализировался на построении цифровых экосистем и трансформации бизнес-процессов. Под его руководством реализованы проекты с совокупным оборотом свыше 5 млрд рублей.",
  },
  {
    year: "2018–2023",
    title: "Предпринимательство",
    text: "Основал и вывел на рынок несколько успешных цифровых продуктов в сфере B2B-сервисов. Стал партнёром венчурного фонда, специализирующегося на инвестициях в технологические стартапы.",
  },
  {
    year: "2025 — н.в.",
    title: "«Даббл»",
    text: "Основал корпорацию экосистемных проектов «Даббл». Сформировал команду и стратегию компании, направленную на создание единой инфраструктуры цифровых сервисов для бизнеса и частных пользователей.",
  },
];

const PRIORITIES = [
  {
    icon: "Layers",
    title: "Единая экосистема",
    text: "Строить бесшовную среду, где каждый сервис усиливает другой — без лишних переключений и потерь.",
  },
  {
    icon: "Users",
    title: "Команда",
    text: "Создавать условия, в которых талантливые люди могут реализовывать самые смелые идеи.",
  },
  {
    icon: "Globe",
    title: "Масштаб",
    text: "Выйти на федеральный уровень с сервисами, которые изменят стандарты отрасли.",
  },
  {
    icon: "Shield",
    title: "Доверие",
    text: "Строить долгосрочные отношения с партнёрами и пользователями на основе прозрачности и качества.",
  },
];

export default function Director() {
  return (
    <div className="min-h-screen bg-white text-black font-body">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white/95 backdrop-blur-md border-b border-black/8 flex items-center px-6 md:px-10">
        <Link to="/about" className="flex items-center gap-2 text-black/50 hover:text-black transition-colors text-sm font-medium">
          <Icon name="ArrowLeft" size={16} />
          О компании
        </Link>
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл"
              className="h-7 w-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
          </Link>
        </div>
        <div className="w-24" />
      </nav>

      <div className="pt-[68px]">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0535] via-[#1a0a6e] to-[#2d0060] min-h-[560px] md:min-h-[600px] flex items-end">
          {/* Декоративные круги */}
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-white/3 pointer-events-none" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-[#FD4160]/5 pointer-events-none" />

          <div className="relative w-full max-w-6xl mx-auto px-6 md:px-16 pb-0 pt-16 flex flex-col md:flex-row items-end gap-0 md:gap-12">
            {/* Фото */}
            <div className="shrink-0 self-end">
              <img
                src={PHOTO}
                alt="Сергей Серебренников"
                className="w-[220px] md:w-[300px] h-[280px] md:h-[380px] object-cover object-top rounded-t-[24px] shadow-2xl shadow-black/40"
                style={{ display: "block" }}
              />
            </div>

            {/* Текст */}
            <div className="pb-10 md:pb-16 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/60 text-xs font-semibold mb-4">
                <Icon name="User" size={12} />
                Генеральный директор
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-tight mb-3">
                Сергей<br />Серебренников
              </h1>
              <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-lg">
                Основатель и генеральный директор корпорации экосистемных проектов «Даббл». Предприниматель, стратег, архитектор цифрового будущего.
              </p>

              {/* Соцсети / контакты */}
              <div className="flex gap-3 mt-6">
                <a
                  href="mailto:ceo@dabble.ru"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-medium transition-all"
                >
                  <Icon name="Mail" size={14} />
                  ceo@dabble.ru
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ЦИТАТА */}
        <section className="bg-[#f5f5f7] px-6 md:px-16 py-14 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm"
            >
              <div
                className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl"
                style={{ background: "linear-gradient(to bottom, #FD4160, #1a0a6e)" }}
              />
              <div className="text-6xl font-display text-[#1a0a6e]/8 leading-none mb-4 select-none">"</div>
              <p className="text-black/70 text-lg md:text-2xl leading-relaxed italic font-display font-medium mb-8">
                Когда мы основывали «Даббл», перед нами стоял один вопрос: почему современный человек вынужден тратить силы на рутину вместо того, чтобы создавать? Мы решили дать ответ делом. Технологии должны служить человеку, а не наоборот. Мы строим будущее, в котором каждый инструмент понимает тебя с первого шага. И это только начало.
              </p>
              <div className="flex items-center gap-3 text-sm text-black/40 font-medium">
                <div className="w-8 h-px bg-black/20" />
                Из интервью, январь 2026
              </div>
            </div>
          </div>
        </section>

        {/* БИОГРАФИЯ */}
        <section className="bg-white px-6 md:px-16 py-14 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-[#1a0a6e] text-sm font-bold mb-4">
              <Icon name="BookOpen" size={16} />
              Биография
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-12">
              Путь к «Даббл»
            </h2>

            <div className="relative">
              {/* Вертикальная линия */}
              <div className="absolute left-[68px] md:left-[80px] top-0 bottom-0 w-px bg-black/8" />

              <div className="flex flex-col gap-10">
                {BIOGRAPHY.map((item, i) => (
                  <div key={i} className="flex gap-6 md:gap-8 items-start">
                    {/* Год */}
                    <div className="shrink-0 w-[60px] md:w-[72px] text-right">
                      <span className="text-[11px] font-bold text-[#1a0a6e]/50 leading-tight block">{item.year}</span>
                    </div>

                    {/* Точка */}
                    <div className="shrink-0 mt-1 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-[#1a0a6e] ring-4 ring-white" />
                    </div>

                    {/* Текст */}
                    <div className="flex-1 pb-2">
                      <div className="font-display font-black text-black text-lg mb-1">{item.title}</div>
                      <p className="text-black/55 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ПРИОРИТЕТЫ */}
        <section className="bg-gradient-to-br from-[#0a0535] via-[#1a0a6e] to-[#2d0060] px-6 md:px-16 py-14 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-white/50 text-sm font-bold mb-4">
              <Icon name="Target" size={16} />
              Приоритеты
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-10">
              На чём сфокусирован
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PRIORITIES.map((item, i) => (
                <div key={i} className="bg-white/8 hover:bg-white/12 transition-colors rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Icon name={item.icon} size={20} className="text-white" />
                  </div>
                  <div className="font-display font-black text-white text-lg mb-2">{item.title}</div>
                  <p className="text-white/50 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ФАКТЫ */}
        <section className="bg-white px-6 md:px-16 py-14 md:py-20 border-b border-black/6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "2025", label: "Год основания «Даббл»" },
                { value: "5+", label: "Сервисов в экосистеме" },
                { value: "20+", label: "Лет в индустрии" },
                { value: "100+", label: "Партнёров и клиентов" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-display font-black text-4xl md:text-5xl text-[#1a0a6e] mb-2">{stat.value}</div>
                  <div className="text-black/40 text-sm leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#f5f5f7] px-6 md:px-16 py-14">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display font-black text-2xl text-black mb-1">Хотите узнать больше о «Даббл»?</div>
              <p className="text-black/45 text-sm">Изучите нашу экосистему сервисов и команду</p>
            </div>
            <Link
              to="/about"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#2d0060] transition-colors"
            >
              О компании
              <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
