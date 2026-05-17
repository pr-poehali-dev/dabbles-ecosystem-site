import { FormEvent } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { LOGO_URL, NAV, PACKAGES, STEPS } from "./constants";

interface VibePartnersContactsProps {
  scrollTo: (href: string) => void;
  form: { name: string; contact: string; message: string };
  setForm: (f: { name: string; contact: string; message: string }) => void;
  sent: boolean;
  submit: (e: FormEvent) => void;
}

export default function VibePartnersContacts({
  scrollTo,
  form,
  setForm,
  sent,
  submit,
}: VibePartnersContactsProps) {
  return (
    <>
      {/* PARTNERS / PACKAGES */}
      <section id="partners" className="px-5 md:px-8 py-16 md:py-24 bg-[#1a1410] text-white relative overflow-hidden">
        <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-[#FFB562]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-[#A77B5A]/20 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40 font-semibold mb-3">
              Сотрудничество
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black mb-5 leading-tight max-w-3xl">
              Зарабатывайте вместе с&nbsp;ВАЙБ
            </h2>
            <p className="text-white/55 text-base md:text-lg max-w-2xl leading-relaxed mb-12">
              Три формата: лёгкая партнёрка с процентом от чека, полноценная франшиза
              с открытием своей точки и корпоративные договоры для бизнеса.
              Выбирайте, что вам ближе.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {PACKAGES.map((p, i) => (
              <FadeIn key={p.name} delay={i * 100}>
                <div
                  className={`relative p-7 rounded-3xl h-full flex flex-col ${
                    p.accent
                      ? "bg-[#FFB562] text-[#1a1410]"
                      : "bg-white/5 border border-white/10 text-white"
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-[#1a1410] text-white text-[11px] font-bold uppercase tracking-wider">
                      {p.badge}
                    </div>
                  )}
                  <div className="font-display text-xl font-black mb-1">{p.name}</div>
                  <div className={`text-sm mb-5 ${p.accent ? "text-[#1a1410]/65" : "text-white/55"}`}>
                    {p.desc}
                  </div>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-black">{p.price}</span>
                    {p.period && (
                      <span className={`text-sm ${p.accent ? "text-[#1a1410]/60" : "text-white/50"}`}>
                        {p.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Icon
                          name="Check"
                          size={16}
                          className={`mt-0.5 shrink-0 ${p.accent ? "text-[#1a1410]" : "text-[#FFB562]"}`}
                        />
                        <span className={p.accent ? "text-[#1a1410]/85" : "text-white/80"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => scrollTo("#contacts")}
                    className={`w-full py-3 rounded-full font-semibold text-sm transition-colors ${
                      p.accent
                        ? "bg-[#1a1410] text-white hover:bg-black"
                        : "bg-white text-[#1a1410] hover:bg-[#FFB562]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Steps */}
          <FadeIn>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-10">
              <h3 className="font-display text-xl md:text-2xl font-black mb-7">Как мы работаем</h3>
              <div className="grid md:grid-cols-4 gap-5">
                {STEPS.map((s) => (
                  <div key={s.num}>
                    <div className="font-display text-3xl font-black text-[#FFB562] mb-2">{s.num}</div>
                    <div className="font-semibold mb-1.5">{s.title}</div>
                    <div className="text-sm text-white/55 leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="px-5 md:px-8 py-16 md:py-24 bg-[#FBF6EE]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <FadeIn>
              <div className="text-xs uppercase tracking-[0.25em] text-black/40 font-semibold mb-3">
                Контакты
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black mb-6 leading-tight">
                Заходите в гости или пишите
              </h2>

              <div className="space-y-4 mb-8">
                <ContactRow icon="MapPin" title="ул. Кофейная, 10" sub="Центр города, 2 минуты от метро" />
                <ContactRow icon="Clock" title="Каждый день · 8:00 – 22:00" sub="В выходные — до 23:00" />
                <ContactRow icon="Phone" title="+7 (900) 000-00-00" sub="Звоните по любым вопросам" />
                <ContactRow icon="Mail" title="hello@vibe-cafe.ru" sub="Для сотрудничества и предложений" />
              </div>

              <div className="flex gap-2">
                {[
                  { icon: "Send", label: "Telegram" },
                  { icon: "Instagram", label: "Instagram" },
                  { icon: "MessageCircle", label: "WhatsApp" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    className="w-11 h-11 rounded-full bg-white hover:bg-[#1a1410] hover:text-white border border-black/10 flex items-center justify-center transition-colors"
                    title={s.label}
                  >
                    <Icon name={s.icon} size={17} />
                  </a>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <form onSubmit={submit} className="bg-white rounded-3xl p-7 md:p-9 border border-black/5">
                <div className="font-display text-xl md:text-2xl font-black mb-1">Оставьте сообщение</div>
                <div className="text-sm text-black/50 mb-6">Ответим в течение рабочего дня</div>

                <div className="space-y-3">
                  <Input label="Как вас зовут?" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Input
                    label="Телефон или email"
                    value={form.contact}
                    onChange={(v) => setForm({ ...form, contact: v })}
                  />
                  <div>
                    <label className="text-xs text-black/50 mb-1.5 block font-medium">Сообщение</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Хочу обсудить сотрудничество..."
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:border-black/30 outline-none text-black resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#1a1410] hover:bg-black text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {sent ? (
                      <>
                        <Icon name="CheckCircle2" size={18} /> Отправлено
                      </>
                    ) : (
                      <>
                        Отправить <Icon name="ArrowRight" size={16} />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-black/40 text-center pt-1">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </div>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1410] text-white px-5 md:px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ВАЙБ" className="h-8 w-auto invert" />
            <div className="text-xs text-white/40">кофейня · пекарня · 2026</div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-white/55">
            {NAV.map((n) => (
              <button key={n.href} onClick={() => scrollTo(n.href)} className="hover:text-white">
                {n.label}
              </button>
            ))}
          </div>
          <Link to="/" className="text-xs text-white/35 hover:text-white">
            ← Основной сайт
          </Link>
        </div>
      </footer>
    </>
  );
}

function ContactRow({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-2xl bg-white border border-black/8 flex items-center justify-center shrink-0">
        <Icon name={icon} size={17} className="text-[#1a1410]" />
      </div>
      <div>
        <div className="font-semibold text-[#1a1410]">{title}</div>
        <div className="text-sm text-black/45">{sub}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:border-black/30 outline-none text-black transition-colors"
      />
    </div>
  );
}
