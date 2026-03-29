'use client'

import { Suspense } from "react";
import CookieNotice from "@/src/components/CookieNotice";
import YandexMetrika from "@/src/components/YandexMetrika";
import Footer from "@/src/sections/Footer";
import Navbar from "@/src/sections/Navbar";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <CookieNotice />
        <Footer />
      </body>
    </html>
  );
}
