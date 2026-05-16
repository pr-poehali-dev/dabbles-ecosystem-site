import Icon from "@/components/ui/icon";
import { FadeIn, BLOG_POSTS, NAV_LINKS, FormType } from "@/components/shared";

interface BlogContactsFooterProps {
  activeForm: FormType;
  setActiveForm: (form: FormType) => void;
  formData: { name: string; email: string; phone: string; company: string; message: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; company: string; message: string }>>;
  submitted: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  scrollTo: (href: string) => void;
}

const FORM_TABS: { key: FormType; label: string }[] = [
  { key: "request", label: "Заявка" },
  { key: "partner", label: "Партнёрство" },
  { key: "feedback", label: "Обратная связь" },
];

export default function BlogContactsFooter({
  activeForm,
  setActiveForm,
  formData,
  setFormData,
  submitted,
  handleSubmit,
  scrollTo,
}: BlogContactsFooterProps) {
  return (
    <>
      {/* BLOG */}
      <section id="blog" className="py-24 px-6 md:px-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#0077FF]/8 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <FadeIn className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[#C1F089] text-sm font-semibold tracking-widest uppercase mb-4 block">
                Блог
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-black">
                Идеи и инсайты
              </h2>
            </div>
            <a
              href="#"
              className="hidden md:flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
            >
              Все статьи <Icon name="ArrowRight" size={14} />
            </a>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, i) => (
              <FadeIn key={i} delay={i * 100}>
                <article className="group cursor-pointer rounded-3xl border border-white/8 bg-white/3 hover:bg-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-2 bg-gradient-to-r ${post.color}`} />
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${post.color} text-white`}
                      >
                        {post.tag}
                      </span>
                      <span className="text-white/30 text-xs">{post.date}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold mb-3 group-hover:text-violet-300 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">{post.desc}</p>
                    <div className="mt-5 flex items-center gap-2 text-white/25 group-hover:text-white/50 transition-colors text-sm">
                      <span>Читать</span>
                      <Icon name="ArrowRight" size={13} />
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <FadeIn className="text-center mb-12">
          <span className="text-[#FD4160] text-sm font-semibold tracking-widest uppercase mb-4 block">
            Контакты
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
            Напиши нам
          </h2>
          <p className="text-white/40 text-lg">
            Выбери тему — ответим в течение рабочего дня.
          </p>
        </FadeIn>

        <FadeIn delay={100} className="flex justify-center mb-8">
          <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-white/5 border border-white/8">
            {FORM_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveForm(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeForm === tab.key
                    ? "bg-gradient-to-r from-[#FD4160] to-[#0077FF] text-white shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="p-8 md:p-12 rounded-3xl border border-white/8 bg-white/3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#FD4160]/5 blur-3xl rounded-full pointer-events-none" />
            {submitted ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center gap-4"
                style={{ animation: "fadeSlideIn 0.5s ease" }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center mb-2">
                  <Icon name="Check" size={28} className="text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold">Отправлено!</h3>
                <p className="text-white/40">
                  Мы получили ваше сообщение и свяжемся с вами в ближайшее время.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative grid gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Имя *</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Как вас зовут?"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#0077FF]/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-sm mb-2 block">Email *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#0077FF]/60 transition-all"
                    />
                  </div>
                </div>
                {activeForm !== "feedback" && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/50 text-sm mb-2 block">Телефон</label>
                      <input
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+7 (999) 000-00-00"
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#0077FF]/60 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-sm mb-2 block">
                        {activeForm === "partner" ? "Название компании" : "Компания"}
                      </label>
                      <input
                        value={formData.company}
                        onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                        placeholder="ООО «Пример»"
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#0077FF]/60 transition-all"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-white/50 text-sm mb-2 block">
                    {activeForm === "request"
                      ? "Расскажите о задаче"
                      : activeForm === "partner"
                      ? "Предложение по партнёрству"
                      : "Ваш отзыв"}
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    placeholder="Напишите здесь..."
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#0077FF]/60 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FD4160] to-[#0077FF] text-white font-semibold text-lg hover:opacity-90 hover:scale-[1.01] transition-all duration-200 shadow-lg shadow-[#FD4160]/20"
                >
                  {activeForm === "request"
                    ? "Отправить заявку"
                    : activeForm === "partner"
                    ? "Предложить партнёрство"
                    : "Отправить отзыв"}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <img
            src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
            alt="Даббл"
            className="h-7 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
          />
          <div className="flex flex-wrap justify-center gap-6 text-white/30 text-sm">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="hover:text-white/60 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-white/20 text-sm">© 2026 Даббл. Все права защищены.</p>
        </div>
      </footer>
    </>
  );
}