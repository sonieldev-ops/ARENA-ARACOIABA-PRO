"use client";

import { Hero } from "@/src/modules/landing/components/Hero";
import { Problem } from "@/src/modules/landing/components/Problem";
import { Solution } from "@/src/modules/landing/components/Solution";
import { Preview } from "@/src/modules/landing/components/Preview";
import { CTA } from "@/src/modules/landing/components/CTA";
import { Footer } from "@/src/modules/landing/components/Footer";
import { Trophy, MessageSquare } from "lucide-react";
import Link from "next/link";

export function B2BLanding() {
  const WHATSAPP_URL = "https://wa.me/5581900000000?text=Quero%20profissionalizar%20meu%20campeonato";

  return (
    <main className="bg-[#0B0C0E] selection:bg-[#FACC15] selection:text-black">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C0E]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FACC15]" />
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">
              ARENA <span className="text-[#FACC15]">PRO</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              ENTRAR
            </Link>

            <Link
              href={WHATSAPP_URL}
              target="_blank"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#FACC15] text-black font-black rounded-xl text-sm hover:bg-[#EAB308] transition-all transform hover:scale-105 active:scale-95"
            >
              FALAR COM ESPECIALISTA
              <MessageSquare className="w-4 h-4 fill-current" />
            </Link>
          </div>
        </div>
      </header>

      {/* Landing Sections */}
      <Hero />
      <Problem />
      <Solution />
      <Preview />
      <CTA />
      <Footer />

      {/* Floating WhatsApp Mobile */}
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-2xl md:hidden animate-bounce"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
      </Link>
    </main>
  );
}
