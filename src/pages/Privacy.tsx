import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Privacy() {
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
        <h1 className="font-display text-3xl md:text-4xl font-black text-black mb-2">Политика конфиденциальности</h1>
        <p className="text-black/40 text-sm mb-10">Последнее обновление: 15 января 2025 г.</p>

        <div className="prose prose-neutral max-w-none text-black/70 leading-relaxed space-y-8">

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">1. Общие положения</h2>
            <p>Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки персональных данных пользователей сайта, принадлежащего ООО «ДАББЛ РУС» (далее — «Компания», «мы»).</p>
            <p className="mt-3">Компания обрабатывает персональные данные в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">2. Оператор персональных данных</h2>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 md:p-6 text-sm space-y-1.5">
              <div><span className="text-black/45">Наименование:</span> <strong className="text-black">ООО «ДАББЛ РУС»</strong></div>
              <div><span className="text-black/45">ОГРН:</span> 1258900000050</div>
              <div><span className="text-black/45">ИНН:</span> 8905069677</div>
              <div><span className="text-black/45">Адрес:</span> ЯНАО, г. Ноябрьск, ул. Магистральная, д. 119, кв. 212</div>
            </div>
            <p className="mt-4">В части персональных данных, обрабатываемых при оказании услуг через личный кабинет клиента, оператором выступает:</p>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 md:p-6 text-sm space-y-1.5 mt-3">
              <div><span className="text-black/45">ИП:</span> <strong className="text-black">Серебренникова Галина Сергеевна</strong></div>
              <div><span className="text-black/45">ОГРНИП:</span> 325890000028798</div>
              <div><span className="text-black/45">ИНН:</span> 890500558522</div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">3. Какие данные мы собираем</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/65">
              <li>Имя и фамилия</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона (при заполнении форм)</li>
              <li>Название компании (при заполнении форм)</li>
              <li>Технические данные: IP-адрес, тип браузера, данные cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">4. Цели обработки данных</h2>
            <ul className="list-disc list-inside space-y-1.5 text-black/65">
              <li>Обработка обращений и заявок через форму на сайте</li>
              <li>Предоставление доступа к сервисам экосистемы «Даббл»</li>
              <li>Улучшение качества сервисов</li>
              <li>Соблюдение требований законодательства РФ</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">5. Правовые основания обработки</h2>
            <p>Обработка персональных данных осуществляется на основании согласия субъекта персональных данных (ст. 6, ч. 1, п. 1 Федерального закона № 152-ФЗ) и для исполнения договора (п. 5 той же статьи).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">6. Передача данных третьим лицам</h2>
            <p>Компания не передаёт персональные данные третьим лицам без согласия субъекта, за исключением случаев, предусмотренных законодательством Российской Федерации.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">7. Cookies</h2>
            <p>Сайт использует файлы cookie для корректной работы и аналитики. Продолжая использование сайта, вы соглашаетесь с использованием cookie. Вы можете отключить cookie в настройках браузера.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">8. Защита данных</h2>
            <p>Компания принимает необходимые организационные и технические меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">9. Права субъектов персональных данных</h2>
            <p>В соответствии с Федеральным законом № 152-ФЗ вы вправе:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/65 mt-3">
              <li>Получить информацию об обработке ваших персональных данных</li>
              <li>Потребовать уточнения, блокирования или уничтожения данных</li>
              <li>Отозвать согласие на обработку</li>
              <li>Обратиться с жалобой в Роскомнадзор</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-black mb-3">10. Контакты</h2>
            <p>По вопросам обработки персональных данных обращайтесь: <a href="mailto:info@dabbl.ru" className="text-[#0077FF] hover:underline">info@dabbl.ru</a></p>
          </section>

          <section>
            <p className="text-sm text-black/45">
              Условия оказания услуг закреплены в <Link to="/offer" className="text-[#0077FF] hover:underline">Публичной оферте</Link>.
            </p>
          </section>
        </div>
      </div>
      <footer className="bg-black px-6 py-6">
        <p className="text-center text-white/20 text-sm">© 2025 ООО «ДАББЛ РУС»</p>
      </footer>
    </div>
  );
}