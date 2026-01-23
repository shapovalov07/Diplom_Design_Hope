"use client";

import Services from "@/src/sections/ServiceBlock";

export default function ServicePage() {
  function handleScroll(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const target = document.getElementById('service-cards')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-140px] h-[360px] w-[360px] rounded-full border border-black/10 bg-white/40" />
          <div className="absolute left-[-140px] top-20 h-[340px] w-[340px] rounded-full bg-[#B5292A]/10 blur-3xl" />
          <div className="absolute inset-y-0 left-0 hidden w-16 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.08)_0_3px,transparent_3px_9px)] opacity-40 md:block" />
        </div>

        <div className="relative mx-auto w-[80%] px-6 pt-16 pb-12">
          <div className="reveal-up [animation-duration:1s]   items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.35em] text-[#B5292A]">услуги</div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#252525] sm:text-6xl">
                Создаём сайты с характером, которые работают на бизнес
              </h1>
              <p className="mt-4 text-sm text-neutral-600">
                От первой идеи до поддержки. Дизайн, разработка и контент под ключ.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/contacts"
                  className="rounded-full bg-[#B5292A] px-6 py-3 text-sm font-semibold !text-white transition hover:scale-[1.02]"
                >
                  Оставить заявку
                </a>
                <a
                  href="#service-cards"
                  onClick={handleScroll}
                  className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-white/70"
                >
                  Смотреть направления
                </a>
              </div>
            </div>

            <div className="text-right text-[72px] font-semibold uppercase leading-none text-[#E5E5E5] sm:text-[120px]">
              услуги
            </div>
          </div>

          <div className="reveal-up [animation-duration:1s] [--delay:120ms] mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: '7 направлений', text: 'От лендингов до сложных сервисов' },
              { title: 'Под ключ', text: 'Дизайн, верстка, админка, контент' },
              { title: 'Гибкий бюджет', text: 'Подбираем формат под задачу' },
              { title: 'Поддержка', text: 'Мы рядом и после запуска' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/10 bg-white/80 p-4 text-sm shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="text-lg font-semibold text-[#252525]">{item.title}</div>
                <div className="mt-2 text-xs text-neutral-600">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="service-cards" className="scroll-mt-24">
        <Services />
      </div>

      <div className="relative mx-auto w-[80%] px-6 py-16">
        <div className="rounded-[32px] border border-black/10 bg-white/80 p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#B5292A]">есть задача?</div>
              <h2 className="mt-3 text-2xl font-semibold text-[#252525] sm:text-3xl">
                Соберём решение под ваш проект
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Напишите нам — обсудим сроки и формат работы.
              </p>
            </div>
            <a
              href="/contacts"
              className="rounded-full bg-[#252525] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#B5292A]"
            >
              Перейти к форме
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
