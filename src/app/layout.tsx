'use client'

import CookieNotice from "@/src/components/CookieNotice";
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
