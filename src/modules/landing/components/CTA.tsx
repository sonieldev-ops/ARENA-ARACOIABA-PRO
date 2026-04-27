"use client";

import { trackEvent, DATA_TEST_IDS } from "@/src/lib/tracking";
import { MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  const WHATSAPP_URL = "https://wa.me/5581900000000?text=Quero%20profissionalizar%20meu%20campeonato";

  return (
    <section className="py-24 bg-[#0B0C0E]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#1A1C1E] to-[#0B0C0E] border border-[#FACC15]/20 p-12 rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FACC15] opacity-10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FACC15] opacity-5 blur-[100px] rounded-full" />

          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic leading-none">
            PRONTO PARA <span className="text-[#FACC15]">SUBIR DE NÍVEL?</span>
          </h2>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
            Não entregamos apenas um app. Entregamos a autoridade que o seu campeonato precisa para valer 10x mais.
          </p>

          <div className="flex flex-col items-center gap-6 relative z-10">
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              data-testid={DATA_TEST_IDS.WHATSAPP_FINAL}
              onClick={() => trackEvent("CLICK_CTA_FINAL_WHATSAPP")}
              className="w-full md:w-auto px-12 py-8 bg-[#FACC15] text-black font-black text-2xl rounded-2xl flex items-center justify-center gap-4 hover:bg-[#EAB308] transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(250,204,21,0.2)]"
            >
              FALAR COM ESPECIALISTA AGORA
              <MessageSquare className="w-8 h-8 fill-current" />
            </Link>

            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
              Implantação completa em até 7 dias
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
