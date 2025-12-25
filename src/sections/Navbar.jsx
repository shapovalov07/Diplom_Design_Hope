'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex justify-between items-center my-5 rounded-lg">
      <div className='w-[80%] flex m-auto justify-between items-center '>
        <div className='flex bg-white w-[70%] h-[60px] justify-around rounded-full items-center'>
            {/* Логотип */}
            <Image src="/logo.svg" alt="Дизайн HOPE" width={150} height={100} />


            {/* Навигация */}
            <nav>
            <ul className="flex gap-6">
                <li>
                <a href="/services" className="font-light text-lg text-[#B5292A]">услуги</a>
                </li>
                <li>
                <a href="/portfolio" className="font-light hover:text-[#B5292A] text-lg">портфолио</a>
                </li>
                <li>
                <a href="/about" className="font-light hover:text-[#B5292A] text-lg">о нас</a>
                </li>
                <li>
                <a href="/contacts" className="font-light hover:text-[#B5292A] text-lg">контакты</a>
                </li>
            </ul>
            </nav>

        </div>

        {/* Иконки соцсетей */}
        <div className="flex gap-4">
            <a href="https://t.me" className="block hover:scale-110 duration-600">
            <Image src="/tg.svg" alt="Telegram" width={50} height={50} />
            </a>
            <a href="https://vk.com" className="block hover:scale-110 duration-600">
            <Image src="/vk.svg" alt="VK" width={50} height={50} />
            </a>
        </div>
      </div>
    </header>
  );
}
