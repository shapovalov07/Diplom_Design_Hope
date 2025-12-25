"use client"

import Navbar from "@/src/sections/Navbar";
import FirstP from "@/src/sections/FirstP";
import Services from "@/src/sections/Services";
import Stages from "@/src/sections/Stages";

export default function Home() {
    return (
      <>
        <Navbar />
        <FirstP />
        <Services />
        <div className="text-center m-10">
          <a  href="">Когда разберусь с админкой, здесь будет кусочек портфолио..... хы</a>
        </div>
        <Stages />
        
      </>
    )
}
