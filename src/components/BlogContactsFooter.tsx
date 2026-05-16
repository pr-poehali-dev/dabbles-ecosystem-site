import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { FadeIn, BLOG_POSTS, NAV_LINKS, FormType } from "@/components/shared";
import { request } from "@/lib/api";

type BlogPost = { id?: number; date: string; tag: string; title: string; desc: string; color: string };

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
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);

  useEffect(() => {
    request<{ items: Array<{ id: number; title: string; excerpt: string; tag: string; color: string; published_at: string }> }>(
      "content",
      { query: { kind: "blog" }, auth: false },
    )
      .then(({ items }) => {
        if (items.length) {
          setPosts(items.map((p) => ({
            id: p.id,
            title: p.title,
            desc: p.excerpt,
            tag: p.tag,
            color: p.color,
            date: new Date(p.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* BLOG */}
      <section id="blog" className="bg-[#f0f0f5] py-10 px-6 md:px-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex items-end justify-between mb-7">
            <h2 className="font-display text-[28px] md:text-[36px] font-black text-black">Блог</h2>
            <a href="#" className="hidden md:flex items-center gap-1.5 text-[#0077FF] text-sm font-semibold hover:underline">
              Все статьи <Icon name="ArrowRight" size={14} />
            </a>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <FadeIn key={i} delay={i * 80}>
                <article className="bg-white rounded-3xl overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className={`h-1 bg-gradient-to-r ${post.color}`} />
                  <div className="p-6">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${post.color}`}>
                        {post.tag}
                      </span>
                      <span className="text-black/30 text-xs">{post.date}</span>
                    </div>
                    <h3 className="font-display text-[15px] font-bold text-black mb-2 group-hover:text-[#0077FF] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-black/45 text-sm leading-relaxed">{post.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-[#0077FF] text-sm font-semibold">
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
      <section id="contacts" className="bg-white py-14 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-3">Напишите нам</h2>
            <p className="text-black/45 text-lg">Выберите тему — ответим в течение рабочего дня</p>
          </FadeIn>

          <FadeIn delay={80} className="flex justify-center mb-7">
            <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-[#f5f5f7]">
              {FORM_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveForm(tab.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeForm === tab.key
                      ? "bg-[#FD4160] text-white shadow-sm"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={160}>
            <div className="bg-[#f5f5f7] rounded-3xl p-8 md:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FD4160] flex items-center justify-center mb-2">
                    <Icon name="Check" size={24} className="text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-black">Отправлено!</h3>
                  <p className="text-black/45">Мы получили ваше сообщение и свяжемся с вами.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-black/50 text-sm mb-1.5 block font-medium">Имя *</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Как вас зовут?"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black placeholder-black/25 focus:outline-none focus:border-[#0077FF]/50 focus:ring-2 focus:ring-[#0077FF]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-black/50 text-sm mb-1.5 block font-medium">Email *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black placeholder-black/25 focus:outline-none focus:border-[#0077FF]/50 focus:ring-2 focus:ring-[#0077FF]/10 transition-all"
                      />
                    </div>
                  </div>
                  {activeForm !== "feedback" && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-black/50 text-sm mb-1.5 block font-medium">Телефон</label>
                        <input
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black placeholder-black/25 focus:outline-none focus:border-[#0077FF]/50 focus:ring-2 focus:ring-[#0077FF]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-black/50 text-sm mb-1.5 block font-medium">
                          {activeForm === "partner" ? "Название компании" : "Компания"}
                        </label>
                        <input
                          value={formData.company}
                          onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                          placeholder="ООО «Пример»"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black placeholder-black/25 focus:outline-none focus:border-[#0077FF]/50 focus:ring-2 focus:ring-[#0077FF]/10 transition-all"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-black/50 text-sm mb-1.5 block font-medium">
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
                      className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black placeholder-black/25 focus:outline-none focus:border-[#0077FF]/50 focus:ring-2 focus:ring-[#0077FF]/10 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#FD4160] text-white font-semibold text-base hover:bg-[#e0324f] transition-colors shadow-sm"
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
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <img
            src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
            alt="Даббл"
            className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
          <div className="flex flex-wrap justify-center gap-6 text-white/35 text-sm">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="hover:text-white/70 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-white/20 text-sm">© 2026 Даббл</p>
        </div>
      </footer>
    </>
  );
}