"use client";

import Services from "@/src/sections/ServiceBlock";

export default function ServicePage() {
  return (
    <section className="">
      <div className="py-24 w-[80%] flex m-auto items-end ">
        <h1 className="text-6xl font-normal leading-25">
          мы — 
          <span className="font-medium">
            <span className="text-[#B5292A]">
              Web-
            </span> 
            Студия
          </span> визуального и мультивселенного<br/> искусства
        </h1>

        <img className="mr-[10%]" src="/star-hope.svg" alt="" />
      </div>

      <Services />
      <div className="h-[1000px]"></div>
    </section>
  );
}
