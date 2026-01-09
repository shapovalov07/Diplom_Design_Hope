'use client'

import ReviewsSection from '@/src/sections/Reviews-section'


export default function About(){
    return (
        <section className="mt-24 h-[80vh]">

            <div className="w-[80%] m-auto">
                <h1 className="text-right text-[128px] leading-none text-[#D9D9D9]">
                    технологии
                </h1>
                <h2 className="text-[48px] leading-none">
                    Какие технологии используем
                </h2>
            </div>

            <div className="w-[80%] m-auto flex py-[54px]">
                <div className="">
                    <div className="h-[420px] w-[600px] bg-[#252525] mb-5 p-10 ">
                        <div className="flex items-center justify-between ">
                            <p className="text-[64px] text-white leading-none">Figma</p>
                            <p className="text-[#323232] text-[40px] leading-none">#дизайн</p>
                        </div>

                        <p className="text-[#C4C4C4] mt-[20px] mb-[50px] font-light">Позволяет создавать интерактивные прототипы с возможностью тестирования дизайна до начала разработки. А также отслеживать ход работы в режиме реального времени, ведь мы за прозрачный процесс! </p>
                        <button className="text-[#9F9F9F] text-[14px] font-light hover:text-red-700">
                            Читать статью →
                        </button>
                    </div>
                    <div className="w-[600px] h-[200px] bg-[#B5292A] p-10 flex flex-col justify-around">
                        <p className="text-white text-[28px] font-normal">Немного нейросетей</p>
                        <p className="text-[#F4F4F4] text-[18px] font-light">зато честно...</p>
                    </div>
                </div>


                <div className="p-10"> 
                    <p className="text-[#D5D5D5] text-[40px] mb-[30px]">#Верстка no-code</p>
                    <p className="text-[48px] font-medium text-[#252525] mb-[20px]">Word Press и Tilda</p>
                    <p className="text-[18px] text-[#252525] font-normal mb-[50px]">Гибкие инструменты, которые позволяют создавать сайты любой сложности, от простых лендингов до крупных интернет-магазинов за кратчайшие сроки. А так же предлагают доступные тарифы, что делает их выгодным решением для любого бизнеса.</p>
                    <button className="text-[#9F9F9F] text-[14px] font-light hover:text-red-700">
                        Читать статью →
                    </button>
                </div>
            </div>
        
                                                                    {/* отзывы     */}


            <article className="w-[80%] m-auto my-10">
                      <ReviewsSection />
            </article>

            <article className="w-[80%] flex m-auto">
                <div>
                    <h2>давайте  знакомиться</h2>
                    <div className="">
                        <div className="flex gap-[3%] mb-20">

                            <div className="w-[340px]">
                                <div>
                                    <img src="/вб.png" alt="" />
                                    <div className="flex h-[40px] bg-red-700 items-center mb-[35px]">
                                        <p className="text-white text-[21px] uppercase">менеджер проектов</p>
                                    </div>
                                </div> 
                                <div>
                                    <p className="text-[24px] font-normal mb-[15px]">Дарья Харина</p>
                                    <p className="font-light">Графический дизайнер, веб-разработчик, преподаватель IT-дисцеплин</p>
                                </div>
                            </div>

                            <div className="w-[340px] h-[440px]">
                                <div>
                                    <img src="/вб.png" alt="" />
                                    <div className="flex h-[40px] bg-red-700 items-center mb-[35px]">
                                        <p className="text-white text-[21px] uppercase">менеджер проектов</p>
                                    </div>
                                </div> 
                                <div>
                                    <p className="text-[24px] font-normal mb-[15px]">Дарья Харина</p>
                                    <p className="font-light">Графический дизайнер, веб-разработчик, преподаватель IT-дисцеплин</p>
                                </div>
                            </div>

                            <div className="w-[50%]">
                                <p className="text-[36px] font-normal">Наша команда -<br/> <span className="font-light text-red-700">это новое поколение специалистов, горящих<br/> своим делом</span></p>
                            </div>

                        </div>

                        <div className="flex gap-[3%] m-auto">
                            <div className="w-[30%]">
                                <div>
                                    <img src="/nikita.png" alt="" />
                                    <div className="flex h-[40px] bg-red-700 items-center mb-[35px]">
                                        <p className="text-white text-[21px] uppercase">менеджер проектов</p>
                                    </div>
                                </div> 
                                <div>
                                    <p className="text-[24px] font-normal mb-[15px]">Дарья Харина</p>
                                    <p className="font-light">Графический дизайнер, веб-разработчик, преподаватель IT-дисцеплин</p>
                                </div>
                            </div>

                            <div className="w-[30%]">
                                <div>
                                    <img src="/nikita.png" alt="" />
                                    <div className="flex h-[40px] bg-red-700 items-center mb-[35px]">
                                        <p className="text-white text-[21px] uppercase">менеджер проектов</p>
                                    </div>
                                </div> 
                                <div>
                                    <p className="text-[24px] font-normal mb-[15px]">Дарья Харина</p>
                                    <p className="font-light">Графический дизайнер, веб-разработчик, преподаватель IT-дисцеплин</p>
                                </div>
                            </div>

                            <div className="w-[30%]">
                                <div>
                                    <img src="/nikita.png" alt="" />
                                    <div className="flex h-[40px] bg-red-700 items-center mb-[35px]">
                                        <p className="text-white text-[21px] uppercase">менеджер проектов</p>
                                    </div>
                                </div> 
                                <div>
                                    <p className="text-[24px] font-normal mb-[15px]">Дарья Харина</p>
                                    <p className="font-light">Графический дизайнер, веб-разработчик, преподаватель IT-дисцеплин</p>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            </article>
        
        
        </section>



    )

}
