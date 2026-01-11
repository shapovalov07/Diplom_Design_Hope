'use client'

import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useRef } from 'react'

const cards = [
  { 
    index: '01', 
    title: 'Дизайн', 
    accent: 'с нуля', 
    items: ['Находим ядро идеи', 'Собираем структуру и ритм', 'Визуальный стиль, который цепляет'] 
  },
  { 
    index: '02', 
    title: 'Верстка', 
    accent: 'в пиксель', 
    items: ['Пиксельная точность и скорость', 'Анимации, которые оживляют', 'Код, который легко поддерживать'] 
  },
  { 
    index: '03', 
    title: 'Упаковка', 
    accent: 'бренда', 
    items: ['Логотип, тон, визуальный голос', 'Единый стиль на всех носителях', 'Бренд узнают с первого взгляда'] 
  },
  { 
    index: '04', 
    title: 'Поддержка', 
    accent: 'и администрирование', 
    items: ['Обновления без ожидания', 'Контроль, резерв, безопасность', 'Сайт всегда в форме'] 
  },
  { 
    index: '05', 
    title: 'Редизайн', 
    accent: 'со смыслом', 
    items: ['Освежим без потери узнаваемости', 'Сохраним сильное, усилим слабое', 'Новый вид, прежняя суть'] 
  },
  { 
    index: '06', 
    title: 'Обучение', 
    accent: 'команды', 
    items: ['Научим менять контент самим', 'Покажем быстрые сценарии', 'Команда станет независимой'] 
  },
  { 
    index: '07', 
    title: 'Сайт', 
    accent: 'образовательной организации', 
    items: ['Разработка под регламенты и требования', 'Администрирование и обновления', 'Документы и разделы без хаоса'] 
  },
]

function CardBl({ card, i, progress, range, targetScale }) {
  // Анимация уменьшения карточки
  const scale = useTransform(progress, range, [1, targetScale]);
  
  return (
    <div className="h-[70vh] flex items-center justify-center sticky top-0">
      <motion.article
        style={{
          scale,
          // Уменьшили базовый отступ сверху до 5% и шаг между карточками до 20px
          top: `calc(5% + ${i * 20}px)`, 
          zIndex: i,
        }}
        className="
          relative mx-auto w-[80%] h-[550px]
          border border-black/10 bg-white
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          overflow-hidden rounded-2xl
        "
      >
        <div className="flex h-full items-stretch p-10 gap-10">
          {/* Левая часть */}
          <div className="w-1/3 flex items-center justify-center border-r border-black/5">
            <span className="text-[180px] font-bold text-black/5 select-none">
              {card.index}
            </span>
          </div>

          {/* Правая часть */}
          <div className="w-2/3 flex flex-col justify-center pr-10">
            <h4 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
              {card.title} <br />
              <span className="text-[#B5292A]">{card.accent}</span>
            </h4>

            <div className="space-y-4 mb-8">
              {card.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-[#B5292A] rounded-full mt-2" />
                  <p className="text-xl leading-snug">{item}</p>
                </div>
              ))}
            </div>

            <button className="bg-black text-white py-4 px-10 rounded-full font-medium hover:bg-[#B5292A] transition-all duration-300 self-start shadow-lg hover:shadow-[#B5292A]/20">
              Заказать услугу
            </button>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

export default function ServiceBl() {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  })

  return (
    <section ref={container} className="relative bg-[#0a0a0a] py-10">
      <div className="pb-[20vh]"> {/* Добавили отступ снизу, чтобы последняя карточка зафиксировалась */}
        {cards.map((card, i) => {
          // Вычисляем финальный масштаб: чем глубже карта, тем она меньше
          const targetScale = 1 - ((cards.length - i) * 0.04);
          return (
            <CardBl 
              key={i} 
              i={i} 
              card={card} 
              progress={scrollYProgress} 
              range={[i * 0.12, 1]} 
              targetScale={targetScale}
            />
          )
        })}
      </div>
    </section>
  )
}