"use client";

import { trackEvent, DATA_TEST_IDS } from "@/lib/tracking";
import { Trophy, Shield, Zap } from "lucide-react";

export function Preview() {
  return (
    <section id="preview" className="py-24 bg-[#0B0C0E] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-[#FACC15] font-black uppercase tracking-widest text-sm mb-4">Experiência do Atleta</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none uppercase italic">
              O "FIFA" da <br /> <span className="text-[#FACC15]">Vida Real</span>
            </h3>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed font-medium">
              Seus atletas terão estatísticas detalhadas, cards de jogador e notificações push.
              Isso não é apenas um app, é uma vitrine profissional para cada jogador da sua liga.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 rounded-full bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
                    <Trophy className="w-6 h-6" />
                 </div>
                 <span className="text-xl font-bold italic uppercase tracking-tight">Artilharia Automatizada</span>
              </div>
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 rounded-full bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
                    <Zap className="w-6 h-6" />
                 </div>
                 <span className="text-xl font-bold italic uppercase tracking-tight">Notificações em Tempo Real</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            {/* Phone Mockup Component */}
            <div
              data-testid={DATA_TEST_IDS.PREVIEW_LIVE}
              onClick={() => trackEvent("INTERACT_PREVIEW_PHONE")}
              className="relative mx-auto w-[280px] h-[580px] bg-[#121417] border-[8px] border-[#1A1C1E] rounded-[3rem] shadow-2xl overflow-hidden cursor-pointer group"
            >
               {/* App Screen Content Mock */}
               <div className="p-4 pt-12 space-y-6 bg-[#0B0C0E] h-full">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                     <span className="text-[#FACC15] font-black italic tracking-tighter">ARENA PRO</span>
                     <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>

                  <div className="bg-[#1A1C1E] p-4 rounded-2xl border border-white/5">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Match</span>
                        <div className="flex items-center gap-1">
                           <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                           <span className="text-[10px] text-red-600 font-bold uppercase">Ao Vivo</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center px-2">
                        <Shield className="w-8 h-8 text-blue-500" />
                        <span className="text-2xl font-black text-white">2 - 1</span>
                        <Shield className="w-8 h-8 text-red-500" />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Últimos Gols</span>
                     {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                           <div className="w-8 h-8 rounded-lg bg-[#FACC15]/20 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-[#FACC15]" />
                           </div>
                           <div className="flex-1">
                              <div className="h-2 w-24 bg-white/20 rounded" />
                              <div className="h-1.5 w-12 bg-white/10 rounded mt-2" />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="absolute inset-0 bg-gradient-to-t from-[#FACC15]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Stats Card Overlay */}
            <div
               data-testid={DATA_TEST_IDS.PREVIEW_RANKING}
               className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#1A1C1E] border border-[#FACC15]/30 p-6 rounded-3xl shadow-2xl hidden md:block w-64"
            >
               <h4 className="text-[#FACC15] font-black italic uppercase text-sm mb-4">Top Scorers</h4>
               <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#0B0C0E] rounded-lg border border-white/5" />
                          <div className="h-3 w-20 bg-white/10 rounded" />
                       </div>
                       <span className="text-white font-black">{10 - i} G</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
