'use client'

import { useRouter } from "next/navigation";
import Image from "next/image";

const cards = [
  {
    title: <><span className="text-[#B5292A]">Дизайн</span> с нуля</>,
    desc: "комплексная услуга по разработке дизайна, которая начинается с чистого листа",
    price: "от 12 000 ₽",
    span: 4,
    href: "/request",
  },
  {
    title: "Верстка",
    desc: "воплощение дизайна в работающий сайт, создание анимаций",
    price: "от 20 000 ₽",
    span: 4,
    href: "/request",
  },
  {
    title: <><span className="text-[#B5292A]">Упаковка</span> бренда</>,
    desc: "разработка фирменного стиля, логотипа и дизайна продукции. Разработка сайта и продвижение",
    price: "от 7 000 ₽",
    span: 4,
    href: "/request",
  },

  {
    title: <><span className="text-[#B5292A]">Поддержка</span> и администрирование</>,
    desc: "оперативное обновление сайта и контента по мере поступления задач, аналитика и продвижение",
    price: "от 7 000 ₽",
    span: 8,
    href: "/request",
  },
  {
    title: <span className="text-[#B5292A]">Редизайн</span>,
    desc: "обновление дизайна уже существующего сайта",
    price: "от 9 000 ₽",
    span: 4,
    href: "/request",
  },

  {
    title: <span className="text-[#B5292A]">Обучение</span>,
    desc: "научитесь работать в конструкторе сайтов и самостоятельно менять контент",
    span: 3,
    href: "/request",
  },
  { title: "image", span: 3, variant: "image" },
  {
    title: <><span className="text-[#B5292A]">Шепотка</span> копирайта</>,
    desc: "напишем уникальный текст для вашего сайта",
    price: "от 3 000 ₽",
    span: 3,
    href: "/request",
  },
  {
    title: "КОМБО",
    desc: "выберите несколько позиций и получите скидку",
    span: 3,
    variant: "combo",
    href: "/request",
  },

  {
    title: <>Разработка и администрирование сайта <span className="text-[#B5292A]">образовательной организации</span></>,
    desc: "создадим сайт под требования и разместим обязательные документы/разделы на официальном сайте.",
    price: "от 27 000 ₽/мес.",
    span: 12,
    href: "/request",
  },
];

const spanClass = {
  3: "col-span-12 md:col-span-3",
  4: "col-span-12 md:col-span-6 lg:col-span-4",
  8: "col-span-12 lg:col-span-8",
  12: "col-span-12",
};

function CardBlock({ card, onClick }) {
  const base =
    "relative  bg-[#F2F2F2] p-6 min-h-[170px] " +
    "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-5 " +
    "before:bg-[repeating-linear-gradient(to_bottom,#BDBDBD_0_3px,transparent_3px_6px)]";

  if (card.variant === "image") {
    return (
      <div className={`${spanClass[card.span]}  min-h-[170px] overflow-hidden`}>
        <div className="relative h-full min-h-[170px]">
          <Image src="/sol.gif" alt="demo" fill className="object-cover" />
        </div>
      </div>
    );
  }

  if (card.variant === "combo") {
    return (
      <article
        className={`${spanClass[card.span]} ${base} bg-[#B5292A] text-white cursor-pointer`}
        onClick={onClick}
      >
        <div className="pl-6 flex h-full flex-col">
          <h3 className="text-2xl font-bold">{card.title}</h3>
          {card.desc && <p className="mt-3 text-white/90 leading-snug">{card.desc}</p>}
          <div className="mt-auto pt-6 text-white/90">✦ ✦ ✦</div>
        </div>
      </article>
    );
  }

  return (
    <article className={`${spanClass[card.span]} ${base}`}>
      <div className="pl-6 flex h-full flex-col">
        <h3 className="text-2xl font-bold leading-tight">{card.title}</h3>

        {card.desc && <p className="mt-3 text-[#333] leading-snug">{card.desc}</p>}

        {card.price && <div className="mt-auto pt-4 font-bold">{card.price}</div>}

        {card.href && (
          <button
            onClick={onClick}
            className="mt-3 text-left text-[#666] hover:text-black transition"
            type="button"
          >
            Оставить заявку →
          </button>
        )}
      </div>
    </article>
  );
}

export default function Services() {
  const router = useRouter();

  return (
    <section className="bg-[#252525] pt-20 pb-14">
      <div className="w-[80%] mx-auto flex justify-between items-end">
        <h2 className="text-white text-[46px]">Что предлагаем</h2>
        <h1 className="text-[#353535] uppercase text-[128px] leading-none">услуги</h1>
      </div>

      <div className="w-[80%] mx-auto mt-10">
        <div className="grid grid-cols-12 gap-4">
          {cards.map((card, i) => (
            <CardBlock
              key={i}
              card={card}
              onClick={card.href ? () => router.push(card.href) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
