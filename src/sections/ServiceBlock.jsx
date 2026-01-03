'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const cards = [
  {
    index: '01',
    title: 'Дизайн',
    accent: 'с нуля',
    items: [
      'Находим ядро идеи',
      'Собираем структуру и ритм',
      'Визуальный стиль, который цепляет',
    ],
  },
  {
    index: '02',
    title: 'Верстка',
    accent: 'в пиксель',
    items: [
      'Пиксельная точность и скорость',
      'Анимации, которые оживляют',
      'Код, который легко поддерживать',
    ],
  },
  {
    index: '03',
    title: 'Упаковка',
    accent: 'бренда',
    items: [
      'Логотип, тон, визуальный голос',
      'Единый стиль на всех носителях',
      'Бренд узнают с первого взгляда',
    ],
  },
  {
    index: '04',
    title: 'Поддержка',
    accent: 'и администрирование',
    items: [
      'Обновления без ожидания',
      'Контроль, резерв, безопасность',
      'Сайт всегда в форме',
    ],
  },
  {
    index: '05',
    title: 'Редизайн',
    accent: 'со смыслом',
    items: [
      'Освежим без потери узнаваемости',
      'Сохраним сильное, усилим слабое',
      'Новый вид, прежняя суть',
    ],
  },
  {
    index: '06',
    title: 'Обучение',
    accent: 'команды',
    items: [
      'Научим менять контент самим',
      'Покажем быстрые сценарии',
      'Команда станет независимой',
    ],
  },
  {
    index: '07',
    title: 'Сайт',
    accent: 'образовательной организации',
    items: [
      'Разработка под регламенты и требования',
      'Администрирование и обновления',
      'Документы и разделы без хаоса',
    ],
  },
];

function CardBl({ card, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const tilt = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [120, -70]);
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.92, 1, 0.95]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, -6]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [tilt * 2.5, tilt * -2.5]);
  const skewY = useTransform(scrollYProgress, [0, 1], [tilt * 1.2, tilt * -1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 1], [0, 1, 0.95]);
  const shadow = useTransform(
    scrollYProgress,
    [0, 1],
    ['0 35px 90px rgba(0,0,0,0.18)', '0 18px 40px rgba(0,0,0,0.12)']
  );
  const clip = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['inset(12% 0 12% 0 round 36px)', 'inset(0% 0 0% 0 round 24px)', 'inset(6% 0 6% 0 round 30px)']
  );
  const numX = useTransform(scrollYProgress, [0, 0.5, 1], [-50, 0, 30]);
  const contentX = useTransform(scrollYProgress, [0, 0.4, 1], [60, 0, -20]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 0.9]);

  return (
    <div ref={ref} className="relative h-[80vh]">
      <motion.article
        style={{
          y,
          scale,
          rotateX,
          rotateZ,
          skewY,
          opacity,
          clipPath: clip,
          boxShadow: shadow,
          zIndex: index + 1,
          transformPerspective: 1200,
        }}
        className="sticky top-24 w-[80%] mx-auto border-y border-black/30 bg-white"
      >
        <div className="flex w-full items-center gap-12 px-10 py-12">
          <motion.div style={{ x: numX }} className="w-1/2">
            <h3 className="text-[350px] leading-none font-light">{card.index}</h3>
          </motion.div>

          <motion.div style={{ x: contentX, opacity: contentOpacity }} className="w-1/2">
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

            <button className="mt-4 w-full rounded-xl bg-[#B5292A] py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105">
              Заказать
            </button>
          </motion.div>
        </div>
      </motion.article>
    </div>
  );
}

export default function ServiceBl() {
  return (
    <section className="py-10">
      <div className="space-y-8">
        {cards.map((card, i) => (
          <CardBl key={i} card={card} index={i} />
        ))}
      </div>
    </section>
  );
}
 
