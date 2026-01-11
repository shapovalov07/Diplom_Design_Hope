"use client"

// import Navbar from "@/src/sections/Navbar";
import FirstP from "@/src/sections/FirstP";
import Services from "@/src/sections/Services";
import Stages from "@/src/sections/Stages";
import PortfolioSection from "@/src/sections/Portfolio-section";

export default function Home() {
    return (
      <>
        
        <FirstP />
        <Services />
        <PortfolioSection limit={6} showAllLink />
        <Stages />
        
      </>
    )
}
