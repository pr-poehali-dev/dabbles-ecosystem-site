import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function KPRules() {
  return (
    <div className="min-h-screen bg-[#f0f0f5] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Шапка */}
        <div className="mb-8">
          <Link to="/kp" className="inline-flex items-center gap-1.5 text-black/40 hover:text-black text-sm mb-6 transition-colors">
            <Icon name="ArrowLeft" size={14} /> Назад к форме
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1a0a6e] flex items-center justify-center shrink-0">
              <Icon name="ScrollText" size={22} className="text-white" />
            </div>
            <div>
              <p className="text-black/40 text-xs font-semibold uppercase tracking-wider">Даббл Корпорация</p>
              <h1 className="font-display text-2xl font-black text-black leading-tight">
                Правила сервиса<br />«Коммерческое предложение»
              </h1>
            </div>
          </div>
          <p className="text-black/40 text-sm">
            Редакция от 01.06.2026 · Действует с момента публикации
          </p>
        </div>

        <div className="space-y-4">

          {/* 1 */}
          <div className="bg-white rounded-3xl p-7 shadow-sm">
            <h2 className="font-display text-lg font-black text-black mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a0a6e] text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
              Общие положения
            </h2>
            <div className="space-y-3 text-black/60 text-sm leading-relaxed">
              <p>
                Настоящие Правила регулируют порядок использования сервиса формирования коммерческих предложений (далее — «Сервис КП»), предоставляемого ООО «ДАББЛ РУС» (далее — «Корпорация»).
              </p>
              <p>
                Использование Сервиса означает безоговорочное согласие пользователя с настоящими Правилами, а также с Политикой конфиденциальности Корпорации.
              </p>
              <p>
                Сервис КП предназначен для формирования индикативных коммерческих предложений на услуги Корпорации. Сформированный документ не является офертой и носит исключительно информационный характер.
              </p>
            </div>
          </div>

          {/* 2 */}
          <div className="bg-white rounded-3xl p-7 shadow-sm">
            <h2 className="font-display text-lg font-black text-black mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a0a6e] text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
              Условия предоставления КП
            </h2>
            <div className="space-y-3 text-black/60 text-sm leading-relaxed">
              <p>
                Корпорация формирует коммерческое предложение на основании данных, предоставленных пользователем в форме запроса. Пользователь несёт полную ответственность за достоверность указанных сведений.
              </p>
              <p>
                Корпорация оставляет за собой право проверять предоставленные данные в соответствии с внутренними политиками и требованиями действующего законодательства РФ.
              </p>
              <p>
                Формирование КП осуществляется в автоматическом режиме. Корпорация не гарантирует актуальность цен в момент обращения и вправе изменить условия при заключении договора.
              </p>
            </div>
          </div>

          {/* 3 — Отказ */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border-l-4 border-red-400">
            <h2 className="font-display text-lg font-black text-black mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
              Основания для отказа в предоставлении КП
            </h2>
            <p className="text-black/50 text-sm mb-4 leading-relaxed">
              Корпорация вправе отказать в формировании и предоставлении коммерческого предложения в следующих случаях:
            </p>
            <div className="space-y-3">
              {[
                {
                  icon: "Building2",
                  title: "Несоответствие организации требованиям",
                  desc: "Организация-получатель не соответствует требованиям сервиса или в отношении неё действуют ограничения в соответствии с законодательством Российской Федерации, включая санкционные списки, реестры недобросовестных поставщиков и иные ограничительные перечни.",
                },
                {
                  icon: "UserX",
                  title: "Ограничения в отношении руководителя",
                  desc: "Руководитель организации внесён во внутренний список нежелательных лиц Корпорации, либо в отношении него действуют ограничительные меры, предусмотренные законодательством РФ или внутренними политиками Корпорации.",
                },
                {
                  icon: "FileX",
                  title: "Несоответствие запрошенных позиций ОКВЭД",
                  desc: "Запрошенные услуги или товарные позиции не могут быть предоставлены Корпорацией в связи с отсутствием соответствующих видов экономической деятельности (ОКВЭД) или выходят за рамки операционной деятельности Корпорации.",
                },
                {
                  icon: "ShieldOff",
                  title: "Право на немотивированный отказ",
                  desc: "Корпорация вправе отказать в предоставлении коммерческого предложения без объяснения причин. Такой отказ не является дискриминацией и не влечёт возникновения каких-либо обязательств со стороны Корпорации.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-red-50/60 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name={item.icon} size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-black text-sm mb-1">{item.title}</p>
                    <p className="text-black/55 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-[#1a0a6e]/5 rounded-2xl">
              <p className="text-xs text-[#1a0a6e]/70 leading-relaxed">
                <strong>Важно:</strong> При получении отказа реальная причина не раскрывается в целях защиты внутренних процедур проверки. Перечень оснований, указанный выше, является исчерпывающим. Корпорация не обязана сообщать, какое именно основание применено в конкретном случае.
              </p>
            </div>
          </div>

          {/* 4 */}
          <div className="bg-white rounded-3xl p-7 shadow-sm">
            <h2 className="font-display text-lg font-black text-black mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a0a6e] text-white text-xs font-black flex items-center justify-center shrink-0">4</span>
              Персональные данные
            </h2>
            <div className="space-y-3 text-black/60 text-sm leading-relaxed">
              <p>
                При использовании Сервиса пользователь предоставляет персональные данные (наименование организации, ФИО руководителя), которые обрабатываются в соответствии с{" "}
                <Link to="/privacy" className="text-[#1a0a6e] underline hover:opacity-70">Политикой конфиденциальности</Link>.
              </p>
              <p>
                Данные обрабатываются исключительно в целях формирования коммерческого предложения и не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.
              </p>
            </div>
          </div>

          {/* 5 */}
          <div className="bg-white rounded-3xl p-7 shadow-sm">
            <h2 className="font-display text-lg font-black text-black mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a0a6e] text-white text-xs font-black flex items-center justify-center shrink-0">5</span>
              Ответственность и ограничения
            </h2>
            <div className="space-y-3 text-black/60 text-sm leading-relaxed">
              <p>
                Сформированное коммерческое предложение является ориентировочным и не порождает обязательств со стороны Корпорации по заключению договора на указанных условиях.
              </p>
              <p>
                Корпорация не несёт ответственности за убытки, возникшие вследствие использования или невозможности использования Сервиса КП.
              </p>
              <p>
                Корпорация вправе в одностороннем порядке изменять настоящие Правила без предварительного уведомления. Актуальная редакция всегда доступна по адресу <span className="text-[#1a0a6e]">/kp-rules</span>.
              </p>
            </div>
          </div>

          {/* Реквизиты */}
          <div className="bg-[#1a0a6e] rounded-3xl p-7 text-white/70 text-xs leading-relaxed">
            <p className="text-white font-semibold mb-2">ООО «ДАББЛ РУС»</p>
            <p>ОГРН 1258900000050 · ИНН 8905069677</p>
            <p className="mt-2">По вопросам применения настоящих Правил обращайтесь через форму обратной связи на главной странице.</p>
          </div>

        </div>

        <div className="text-center mt-8 pb-4">
          <Link to="/kp"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#1a0a6e] font-semibold text-sm shadow-sm hover:shadow-md transition-shadow">
            <Icon name="ArrowLeft" size={15} />
            Вернуться к форме КП
          </Link>
        </div>

      </div>
    </div>
  );
}
