"use client";

import { trackEvent, DATA_TEST_IDS } from "@/lib/tracking";
import { Trophy, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const WHATSAPP_URL = "https://wa.me/5581900000000?text=Quero%20profissionalizar%20meu%20campeonato";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0C0E] pt-20">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FACC15] opacity-[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FACC15] opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1C1E] border border-[#FACC15]/20 text-[#FACC15] mb-8 animate-fade-in">
          <Trophy className="w-4 h-4 fill-[#FACC15]" />
          <span className="text-xs font-bold uppercase tracking-widest">O Sistema das Grandes Ligas</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] uppercase italic">
          Transforme seu <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FACC15] to-[#CA8A04]">
            Campeonato em Liga
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-2xl text-gray-400 mb-12 font-medium leading-relaxed">
          Mais controle, mais engajamento e mais valor para patrocinadores.
          A tecnologia profissional que sua região merece, sem planilhas e sem caos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            data-testid={DATA_TEST_IDS.HERO_CTA}
            onClick={() => trackEvent("CLICK_HERO_CTA")}
            className="w-full sm:w-auto px-10 py-6 bg-[#FACC15] text-black font-black text-xl rounded-xl flex items-center justify-center gap-3 hover:bg-[#EAB308] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          >
            QUERO PROFISSIONALIZAR MEU CAMPEONATO
            <ArrowRight className="w-6 h-6" />
          </Link>

          <button
            data-testid={DATA_TEST_IDS.HERO_DEMO}
            onClick={() => {
              trackEvent("CLICK_HERO_DEMO");
              document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-10 py-6 bg-transparent text-white font-bold text-xl rounded-xl border-2 border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            VER DEMONSTRAÇÃO
          </button>
        </div>

        {/* Floating Mockup Preview */}
        <div className="mt-20 relative max-w-5xl mx-auto rounded-t-3xl border-x border-t border-white/10 bg-[#121417] p-4 shadow-2xl">
           <div className="aspect-video bg-[#0B0C0E] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-transparent to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=2070"
                alt="Arena Pro Admin Dashboard"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute z-20 flex flex-col items-center">
                 <div className="w-20 h-20 rounded-full bg-[#FACC15] flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black fill-current" />
                 </div>
                 <span className="mt-4 text-white font-bold tracking-widest uppercase text-sm">Preview do Sistema</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
