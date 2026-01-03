'use client'

import { Unbounded } from "next/font/google";
import Navbar from "@/src/sections/Navbar";

import "./globals.css";

const geistUnbouded = Unbounded({
  variable: "--font-geist-Unbounded",
  subsets: ["latin"],
});




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistUnbouded.variable}`}>
        <Navbar />  
        {children}
      </body>
    </html>
  );
}
