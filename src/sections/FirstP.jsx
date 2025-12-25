'use client';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-medium text-black mb-4 leading-[80px]">
        Закажи эффективный <br/>сайт для бизнеса
      </h1>
      <p className="text-4xl font-medium text-[#B5292A] mb-8">
        и познай наш вайб
      </p>
      <div className="flex mt-15 gap-15">
        <button className="bg-[#B5292A] text-white font-light py-3 px-6 rounded-full text-lg hover:scale-105 transition duration-600">
          Заказать работу
        </button>
        <button className="border-2 border-[#414141] font-light text-[#414141] py-3 px-6 rounded-full text-lg hover:scale-105 hover:rotate-6 transition duration-600">
          Что мы делаем ?
        </button>
      </div>
    </section>
  );
}
