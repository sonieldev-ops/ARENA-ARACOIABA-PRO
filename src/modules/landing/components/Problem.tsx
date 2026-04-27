"use client";

import { trackEvent, DATA_TEST_IDS } from "@/lib/tracking";
import { XCircle, AlertCircle } from "lucide-react";

const PAIN_POINTS = [
  "Organização caótica via grupos de WhatsApp",
  "Tabelas manuais e erros constantes no ranking",
  "Falta de credibilidade perante patrocinadores",
  "Dificuldade em controlar suspensões e elencos",
  "Torcida desinformada e baixo engajamento"
];

export function Problem() {
  return (
    <section
      id="problem"
      data-testid={DATA_TEST_IDS.SECTION_PROBLEM}
      onMouseEnter={() => trackEvent("VIEW_SECTION_PROBLEM")}
      className="py-24 bg-[#0B0C0E] border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[#FACC15] font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              O Problema Real
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
              SE O SEU CAMPEONATO <br />
              DEPENDE DISSO, <span className="text-red-600 uppercase">VOCÊ ESTÁ LIMITADO.</span>
            </h3>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Organizar torneios em planilhas ou WhatsApp drena sua energia e afasta grandes investidores.
              Sem profissionalismo, você nunca passará do próximo nível.
            </p>
          </div>

          <div className="space-y-4">
            {PAIN_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 bg-[#121417] border border-white/5 rounded-2xl group hover:border-red-600/30 transition-all"
              >
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                <span className="text-xl text-gray-200 font-bold tracking-tight">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
