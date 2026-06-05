import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FadeIn, NAV_LINKS, FormType } from "@/components/shared";
import { request } from "@/lib/api";

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

const FOOTER_LINKS = [
  {
    title: "Компания",
    links: [
      { label: "О компании", to: "/about" },
      { label: "Инвесторам", href: "#initiatives" },
      { label: "Контакты", href: "#contacts" },
    ],
  },
  {
    title: "Сервисы",
    links: [
      { label: "Даббл.Трекер", to: null },
      { label: "Формус", external: "https://forms-dubble.ru" },
      { label: "Компас", external: "https://даббл-компас.рф" },
      { label: "Карьера", to: null },
    ],
  },
  {
    title: "Документы",
    links: [
      { label: "Политика конфиденциальности", to: "/privacy" },
    ],
  },
];

type FooterLink = { label: string; to?: string | null; href?: string; external?: string };
type FooterCol = { title: string; links: FooterLink[] };

function FooterAccordion({ col, scrollTo }: { col: FooterCol; scrollTo: (href: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/8 md:border-none">
      {/* Заголовок — кликабельный только на мобиле */}
      <button
        className="w-full flex items-center justify-between py-3.5 md:py-0 md:cursor-default"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-white/30 text-xs font-bold uppercase tracking-widest md:mb-4 block">
          {col.title}
        </span>
        <Icon
          name="ChevronDown"
          size={14}
          className={`text-white/30 transition-transform md:hidden ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Список — всегда виден на десктопе, раскрывается на мобиле */}
      <ul className={`space-y-2.5 overflow-hidden transition-all duration-200 md:block pb-3.5 md:pb-0 ${open ? "block" : "hidden"}`}>
        {col.links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="text-white/55 hover:text-white text-sm transition-colors">
                {l.label}
              </Link>
            ) : l.external ? (
              <a href={l.external} target="_blank" rel="noreferrer" className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1">
                {l.label} <Icon name="ExternalLink" size={11} className="opacity-50" />
              </a>
            ) : l.href ? (
              <button onClick={() => scrollTo(l.href as string)} className="text-white/55 hover:text-white text-sm transition-colors">
                {l.label}
              </button>
            ) : (
              <span className="text-white/25 text-sm">{l.label} <span className="text-[10px]">(скоро)</span></span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BlogContactsFooter({
  activeForm,
  setActiveForm,
  formData,
  setFormData,
  scrollTo,
}: BlogContactsFooterProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setError("Необходимо согласие на обработку персональных данных"); return; }
    setSubmitting(true);
    setError("");
    try {
      await request("public-data", {
        method: "POST",
        query: { action: "contact" },
        auth: false,
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: formData.message,
          form_type: activeForm,
        },
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      setConsent(false);
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setError("Ошибка отправки. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
                      {activeForm === "request" ? "Расскажите о задаче" : activeForm === "partner" ? "Предложение по партнёрству" : "Ваш отзыв"}
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

                  {/* CONSENT */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        consent ? "bg-[#1a0a6e] border-[#1a0a6e]" : "border-black/20 group-hover:border-black/40"
                      }`}
                      onClick={() => setConsent(!consent)}
                    >
                      {consent && <Icon name="Check" size={12} className="text-white" />}
                    </div>
                    <input type="checkbox" className="sr-only" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span className="text-xs text-black/45 leading-relaxed">
                      Я даю согласие на обработку персональных данных в соответствии с{" "}
                      <Link to="/privacy" className="text-[#0077FF] hover:underline" target="_blank">
                        Политикой конфиденциальности
                      </Link>{" "}
                      ООО «ДАББЛ РУС»
                    </span>
                  </label>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                      <Icon name="AlertCircle" size={15} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-[#FD4160] text-white font-semibold text-base hover:bg-[#e0324f] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && <Icon name="Loader" size={16} className="animate-spin" />}
                    {activeForm === "request" ? "Отправить заявку" : activeForm === "partner" ? "Предложить партнёрство" : "Отправить отзыв"}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0535] text-white">
        {/* TOP */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* BRAND */}
            <div className="md:col-span-2">
              <img
                src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
                alt="Даббл"
                className="h-8 w-auto object-contain mb-4"
              />
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-5">
                Экосистема сервисов для бизнеса и повседневной жизни. Единая точка доступа к инструментам роста.
              </p>
              <div className="flex gap-2">
                {[
                  { icon: "Send", label: "Telegram" },
                  { icon: "MessageCircle", label: "ВКонтакте" },
                ].map((s) => (
                  <button
                    key={s.label}
                    title={s.label}
                    className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                  >
                    <Icon name={s.icon} size={16} className="text-white/60" />
                  </button>
                ))}
              </div>
            </div>

            {/* LINKS */}
            {FOOTER_LINKS.map((col) => (
              <FooterAccordion key={col.title} col={col} scrollTo={scrollTo} />
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/8" />

        {/* BOTTOM */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">© 2026 ООО «ДАББЛ РУС» · ОГРН 1258900000050 · ИНН 8905069677</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-white/25 hover:text-white/50 text-xs transition-colors">Политика конфиденциальности</Link>
          </div>
        </div>
      </footer>
    </>
  );
}