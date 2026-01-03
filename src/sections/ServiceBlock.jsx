'use client';

const cards = [
  {
    index: '01',
    title: 'Дизайн',
    accent: 'с нуля',
    items: [
      'Анализ ниши и конкурентов',
      'Прототипы страниц',
      'UI-дизайн',
      'Подбор шрифтов, цветов, визуального стиля',
    ],
  },
  {
    index: '02',
    title: 'Дизайн',
    accent: 'с нуля',
    items: [
      'Анализ ниши и конкурентов',
      'Прототипы страниц',
      'UI-дизайн',
      'Подбор шрифтов, цветов, визуального стиля',
    ],
  },
  {
    index: '03',
    title: 'Дизайн',
    accent: 'с нуля',
    items: [
      'Анализ ниши и конкурентов',
      'Прототипы страниц',
      'UI-дизайн',
      'Подбор шрифтов, цветов, визуального стиля',
    ],
  },
];

function CardBl({ card }) {
  const base = 'py-12';

  return (
    <article className={`${base} w-[80%] mx-auto border-y border-black/30`}>
      <div className="flex w-full items-center gap-12 px-10">

        <div className="w-1/2">
          <h3 className="text-[350px] leading-none font-light">{card.index}</h3>
        </div>

        <div className="w-1/2">

          <h4 className="text-4xl font-semibold">
            {card.title} <span className="text-[#B5292A]">{card.accent}</span>
          </h4>

          <div className="mt-4 rounded-xl bg-[#444444] px-6 py-6 text-sm leading-relaxed text-white">
            <ul className="space-y-1">
              {card.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <button className="mt-4 w-full rounded-xl bg-[#B5292A] py-3 text-lg font-semibold text-white">
            Заказать
          </button>

        </div>
      </div>
    </article>
  );
}

export default function ServiceBl() {
  return (
    <section className="py-10">
      <div className="space-y-10">
        {cards.map((card, i) => (
          <CardBl key={i} card={card} />
        ))}
      </div>
    </section>
  );
}
