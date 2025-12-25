'use client';

import cletka from '@/public/cletka.svg'
import Image from 'next/image'
import React from 'react'

export default function Stages() {
    return (
        // Родительский контейнер с relative для абсолютного позиционирования внутренних элементов
        <section className="relative w-full mt-12 lg:pt-28 pt-16 bg-white min-h-screen lg:min-h-[1000px]">
            {/* Фоновые слои и сетка */}
            <div className="absolute inset-0 z-0 bg-white"/>

            <div className="lg:pt-48 absolute inset-0 z-10 pointer-events-none">
                <div className="container mx-auto max-w-screen-xl px-2">
                    <div className="pt-[137px] hidden lg:flex">
                        <Image
                            src={cletka}
                            alt="Сетка"
                            className="w-full container h-full object-cover mx-auto"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Контент поверх сетки */}
            <div className="relative z-20">
                <div className="container mx-auto max-w-screen-xl">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left lg:pr-16">
                            <h1 className="text-2xl lg:text-[40px] font-semibold text-[#252525] lg:whitespace-nowrap pt-10 lg:pt-0 unb">
                                Этапы работы с нами
                            </h1>
                        </div>
                        <div className="text-center lg:text-left px-3 lg:px-0">
                            <p className="text-sm lg:text-[15px] text-[#A0A0A0]">
                                *это лишь примерная схема, настоящие сроки будут зависеть от объёма работы, а вот
                                план взаимодействия представлен окончательный ;)
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto pt-10 lg:pt-[59px]">
                        <div
                            className="lg:pt-3 grid grid-cols-1 gap-y-2 lg:grid-cols-4 justify-items-center mx-auto">
                            <div>
                                <div className="text-center py-2 lg:py-0 unb">
                                    <div className="text-[#5A5A5A] text-[18px]">День</div>
                                    <div className="text-[#5A5A5A] lg:text-[56px] font-light whitespace-nowrap">1
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <button onClick={() => {
                                        const contactsSection = document.getElementById("contacts");
                                        if (contactsSection) {
                                            contactsSection.scrollIntoView({behavior: "smooth"});
                                        }
                                    }}>
                                        <div className='text-left lg:pt-[64px] lg:pr-3'>
                                            <div className='bg-[#B5292A] w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto'>
                                                <div className='text-[16px] text-white font-semibold text-center'>
                                                    оставить заявку
                                                </div>
                                            </div>
                                        </div>
                                    </button >
                                    <div className='text-left lg:pt-[39px] lg:pr-3'>
                                        <div
                                            className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto space-y-3'>
                                            <div className='text-[16px] font-semibold text-[#252525]'>
                                                Заполнить бриф
                                            </div>
                                            <div className='text-[14px] text-[#252525]'>
                                                1 час
                                            </div>
                                            <div className='text-[14px] text-[#252525]'>
                                                Ответить на вопросы
                                                о компании
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-left lg:pt-20 lg:pr-1'>
                                        <div className='text-left lg:pr-2'>
                                            <div
                                                className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto space-y-3'>
                                                <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Интервью
                                                </div>
                                                <div className='text-[14px] text-[#252525]'>
                                                    30 минут
                                                </div>
                                                <div className='text-[14px] text-[#252525]'>
                                                    В режиме ВКС ответить
                                                    на уточняющие вопросы дизайнера
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-center py-2 lg:py-0 unb">
                                    <div className="text-[#5A5A5A] lg:text-[20px]">День</div>
                                    <div className="text-[#5A5A5A] lg:text-[56px] font-light whitespace-nowrap">2-3
                                    </div>
                                </div>
                                <div className='text-left'>
                                    <div className='text-left lg:pr-11 pt-5'>
                                        <div
                                            className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto lg:pb-16'>
                                        <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Разработка
                                                    прототипа
                                                </div>
                                                <div className='text-[14px] text-[#252525]'>
                                                    Весь день
                                                </div>
                                                <div className='text-[14px] text-[#252525]'>
                                                    Дизайнер формирует
                                                    несколько вариантов
                                                    макета
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-left pt-2'>
                                        <div className='text-left lg:pr-11'>
                                            <div
                                                className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto'>
                                                <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Одобрение<br/>
                                                    прототипа
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-left pt-2'>
                                        <div className='text-left lg:pr-11'>
                                            <div
                                                className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto lg:pb-[64px]'>
                                                <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Разработка дизайна
                                                </div>
                                                <div className='text-[14px] text-[#252525]'>
                                                    Весь день
                                                </div>
                                                <div className='text-[14px] text-[#252525]'>
                                                    Этап, когда прототип наполняется контентом и преобретает вид,
                                                    пригодный для верстки
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-left pt-2'>
                                        <div className='text-left lg:pr-11'>
                                            <div
                                                className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[250px] py-[14px] px-5 rounded-lg mx-auto'>
                                                <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Утверждение<br/>
                                                    макета
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-center py-2 lg:py-0 unb">
                                    <div className="text-[#5A5A5A] lg:text-[20px]">День</div>
                                    <div className="text-[#5A5A5A] lg:text-[56px] font-light whitespace-nowrap">4-5
                                    </div>
                                </div>
                                <div className='text-left pt-2 space-y-2'>
                                    <div className='text-left lg:pt-3 lg:pr-10'>
                                        <div
                                            className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[260px] py-[14px] px-5 rounded-lg mx-auto lg:pb-[153px]'>
                                            <div className='text-[16px] font-semibold text-[#252525]'>
                                                Верстка
                                            </div>
                                            <div className='text-[14px] text-[#252525]'>
                                                Весь день
                                            </div>
                                            <div className='text-[14px] text-[#252525]'>
                                                Перенос макета на конструктор сайтов, настройка ссылок и кнопок,
                                                привязка различных сервисов
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-left lg:pr-10'>
                                        <div
                                            className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[260px] py-[14px] px-5 rounded-lg mx-auto lg:pb-[142px]'>
                                            <div className='text-[16px] font-semibold text-[#252525]'>
                                                Допы
                                            </div>
                                            <div className='text-[14px] text-[#252525]'>
                                                Весь день
                                            </div>
                                            <div className='text-[14px] text-[#252525]'>
                                                Создание адаптивных версий сайта, настройка анимации, SEO
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-center py-2 lg:py-0">
                                    <div className="text-[#5A5A5A] lg:text-[20px] unb">День</div>
                                    <div className="text-[#5A5A5A] lg:text-[56px] font-light whitespace-nowrap unb">6-7
                                    </div>
                                    <div className='text-left pt-2'>
                                        <div className='text-left lg:space-y-9 lg:pt-3 lg:pr-9'>
                                            <div
                                                className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[260px] py-[14px] px-5 rounded-lg mx-auto'>
                                                <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Публикация сайта, демонстрация<br />заказчику
                                                </div>
                                            </div>
                                            <div
                                                className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[260px] py-[14px] px-5 rounded-lg mx-auto my-2'>
                                                <div className='text-[16px] font-semibold text-[#252525]'>
                                                    Внесение<br />правок
                                                </div>
                                            </div>
                                            <div className='text-left pb-10 lg:pb-0'>
                                                <div
                                                    className='bg-[#EBEBEB] hover:bg-[#C9C9C9] transition-all duration-300 w-[370px] lg:w-[260px] py-[14px] px-5 rounded-lg mx-auto'>
                                                    <div className='text-[16px] font-semibold text-[#252525]'>
                                                        Обучение
                                                    </div>
                                                    <div className='text-[14px] text-[#252525]'>
                                                        1.5 - 2 часа
                                                    </div>
                                                    <div className='text-[14px] text-[#252525]'>
                                                        Научим менять контент на вашем сайте, поделимся базовыми
                                                        навыками
                                                        работы в конструкторе сайта
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </section>
    );
}
