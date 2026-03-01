'use client'

export default function PrivacyPolicyPage() {
  return (
    <section className="mt-24 pb-20">
      <div className="mx-auto w-[80%] px-6">
        <div>
          <div className="text-right text-[56px] leading-none font-semibold uppercase text-black/5 sm:text-[120px]">
            политика
          </div>
          <h1 className="-mt-1 text-4xl font-semibold text-[#252525] sm:text-5xl">
            Политика конфиденциальности
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Дата обновления: 2025-01-01
          </p>
        </div>

        <div className="mt-10 grid gap-8 text-sm leading-relaxed text-neutral-700">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">1. Общие положения</h2>
            <p className="mt-3">
              Настоящая политика конфиденциальности описывает, какие данные мы собираем,
              как их используем и как защищаем. Используя сайт веб-студии «Дизайн HOPE»,
              вы соглашаетесь с условиями этой политики.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">2. Какие данные мы собираем</h2>
            <ul className="mt-3 list-disc pl-5">
              <li>Данные аккаунта: ФИО, email, пароль (хранится в виде хэша).</li>
              <li>Данные заявок: имя, выбранная услуга, описание проекта, телефон.</li>
              <li>Данные отзывов: имя автора, оценка, текст, аватар (если указан).</li>
              <li>Технические данные: cookies, данные сессии, информация браузера.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">3. Цели обработки</h2>
            <ul className="mt-3 list-disc pl-5">
              <li>Регистрация и авторизация пользователей.</li>
              <li>Обработка заявок и связь по проектам.</li>
              <li>Публикация и модерация отзывов.</li>
              <li>Улучшение качества сервиса и коммуникаций.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">4. Передача данных</h2>
            <p className="mt-3">
              Мы не продаём ваши данные третьим лицам. Для внутренних уведомлений о
              заявках и отзывах данные могут отправляться в Telegram через нашего бота.
              Доступ к данным имеют только уполномоченные сотрудники студии.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">5. Сроки хранения</h2>
            <p className="mt-3">
              Данные хранятся ровно столько, сколько необходимо для целей обработки,
              либо до отзыва согласия пользователем, если иное не требуется законом.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">6. Безопасность</h2>
            <p className="mt-3">
              Мы применяем технические и организационные меры для защиты данных от
              утечек, несанкционированного доступа и иных рисков.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">7. Права пользователя</h2>
            <ul className="mt-3 list-disc pl-5">
              <li>Запросить доступ к своим данным.</li>
              <li>Исправить или удалить данные.</li>
              <li>Отозвать согласие на обработку.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">8. Контакты</h2>
            <p className="mt-3">
              По вопросам обработки данных пишите на почту:
              {' '}
              <a
                href="mailto:studio@design-hope.ru"
                className="text-[#B5292A] hover:underline"
              >
                studio@design-hope.ru
              </a>.
            </p>
            <p className="mt-2 text-neutral-500">
              ОГРНИП 324619600163400, ИНН 616209647428.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#252525]">9. Изменения политики</h2>
            <p className="mt-3">
              Мы можем обновлять эту политику. Актуальная версия всегда доступна на этой странице.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
