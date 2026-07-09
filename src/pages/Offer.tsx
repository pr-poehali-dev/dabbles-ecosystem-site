import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Offer() {
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
        <h1 className="font-display text-3xl md:text-4xl font-black text-black mb-2">Публичная оферта на оказание услуг</h1>
        <p className="text-black/40 text-sm mb-10">Последнее обновление: 09 июля 2026 г.</p>

        <div className="prose prose-neutral max-w-none text-black/70 leading-relaxed space-y-8">

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">1. Общие положения</h2>
            <p>Настоящий документ является публичной офертой (далее — «Оферта») Индивидуального предпринимателя Серебренниковой Галины Сергеевны (далее — «Исполнитель») в адрес любого дееспособного физического или юридического лица (далее — «Заказчик») и содержит все существенные условия оказания услуг.</p>
            <p className="mt-3">В соответствии со ст. 437 Гражданского кодекса РФ данный документ является официальным и публичным предложением Исполнителя заключить договор оказания услуг на условиях, изложенных ниже.</p>
            <p className="mt-3">Акцептом (полным и безоговорочным принятием условий) настоящей Оферты считается совершение Заказчиком одного из следующих действий: регистрация личного кабинета на сайте, оплата выставленного счёта, подписание документов через сервис либо иное фактическое использование услуг Исполнителя.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">2. Исполнитель</h2>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 md:p-6 text-sm space-y-1.5">
              <div><span className="text-black/45">ИП:</span> <strong className="text-black">Серебренникова Галина Сергеевна</strong></div>
              <div><span className="text-black/45">ОГРНИП:</span> 325890000028798</div>
              <div><span className="text-black/45">ИНН:</span> 890500558522</div>
              <div><span className="text-black/45">Регион регистрации:</span> Ямало-Ненецкий автономный округ, г. Ноябрьск</div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">3. Предмет договора</h2>
            <p>Исполнитель обязуется оказать Заказчику услуги в соответствии с выбранным тарифом/перечнем, размещённым в личном кабинете или согласованным сторонами иным образом, а Заказчик обязуется оплатить эти услуги в порядке и на условиях, предусмотренных настоящей Офертой.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">4. Порядок оказания услуг</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/65">
              <li>Услуги оказываются дистанционно, в том числе через личный кабинет на сайте</li>
              <li>Состав и стоимость услуг определяются выставленным счётом или согласованным заданием</li>
              <li>Результат оказания услуг фиксируется в личном кабинете Заказчика (статусы дел, документы, акты)</li>
              <li>Заказчик обязан предоставлять достоверные данные, необходимые для оказания услуг</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">5. Стоимость услуг и порядок оплаты</h2>
            <p>Стоимость услуг определяется индивидуально и указывается в выставленном счёте в личном кабинете Заказчика. Оплата производится безналичным переводом на реквизиты Исполнителя либо через встроенные платёжные инструменты сайта. Обязательства Заказчика по оплате считаются исполненными с момента поступления денежных средств.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">6. Права и обязанности сторон</h2>
            <p className="font-semibold text-black/80 mb-1.5">Исполнитель обязан:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/65 mb-3">
              <li>Оказывать услуги качественно и в согласованные сроки</li>
              <li>Информировать Заказчика о ходе оказания услуг через личный кабинет</li>
              <li>Обеспечивать сохранность и конфиденциальность полученных данных</li>
            </ul>
            <p className="font-semibold text-black/80 mb-1.5">Заказчик обязан:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/65">
              <li>Своевременно оплачивать оказанные услуги</li>
              <li>Предоставлять достоверную информацию и документы</li>
              <li>Не использовать сервис в противоправных целях</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">7. Ответственность сторон</h2>
            <p>Стороны несут ответственность за неисполнение или ненадлежащее исполнение своих обязательств в соответствии с действующим законодательством Российской Федерации. Исполнитель не несёт ответственности за убытки Заказчика, возникшие вследствие предоставления недостоверных данных.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">8. Персональные данные</h2>
            <p>Заключая договор на условиях настоящей Оферты, Заказчик даёт согласие на обработку своих персональных данных в объёме и порядке, предусмотренных <Link to="/privacy" className="text-[#0077FF] hover:underline">Политикой конфиденциальности</Link>.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">9. Срок действия и изменение оферты</h2>
            <p>Оферта действует бессрочно и может быть изменена Исполнителем в одностороннем порядке путём публикации новой редакции на сайте. Изменения вступают в силу с момента их публикации.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">10. Порядок расторжения</h2>
            <p>Договор может быть расторгнут по соглашению сторон, а также в одностороннем порядке при существенном нарушении условий Оферты другой стороной, с уведомлением через личный кабинет или по email.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">11. Разрешение споров</h2>
            <p>Все споры и разногласия разрешаются путём переговоров, а при недостижении согласия — в судебном порядке в соответствии с законодательством Российской Федерации.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">12. Контакты</h2>
            <p>По вопросам оказания услуг обращайтесь: <a href="mailto:info@dabbl.ru" className="text-[#0077FF] hover:underline">info@dabbl.ru</a></p>
          </section>
        </div>
      </div>
      <footer className="bg-black px-6 py-6">
        <p className="text-center text-white/20 text-sm">© 2026 ИП Серебренникова Г.С. · ОГРНИП 325890000028798</p>
      </footer>
    </div>
  );
}
