"use client";

import { trackEvent, DATA_TEST_IDS } from "@/src/lib/tracking";
import { CheckCircle2, Zap, Smartphone, LayoutDashboard, Bell, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: <Smartphone className="w-10 h-10" />,
    title: "App para Atletas",
    description: "Perfil individual, histórico de gols e notificações personalizadas."
  },
  {
    icon: <LayoutDashboard className="w-10 h-10" />,
    title: "Painel Admin",
    description: "Controle total da liga, times, jogos e suspensões em um só lugar."
  },
  {
    icon: <BarChart3 className="w-10 h-10" />,
    title: "Ranking Automático",
    description: "Tabelas e artilharia atualizadas instantaneamente após o jogo."
  },
  {
    icon: <Zap className="w-10 h-10" />,
    title: "Live Match",
    description: "Acompanhamento em tempo real dos lances e resultados."
  },
  {
    icon: <Bell className="w-10 h-10" />,
    title: "Notificações Push",
    description: "Avise sobre novos jogos, gols e notícias no celular de todos."
  },
  {
    icon: <CheckCircle2 className="w-10 h-10" />,
    title: "Governança PRO",
    description: "Log de auditoria e segurança criptografada para evitar fraudes."
  }
];

export function Solution() {
  return (
    <section
      id="solution"
      data-testid={DATA_TEST_IDS.SECTION_SOLUTION}
      onMouseEnter={() => trackEvent("VIEW_SECTION_SOLUTION")}
      className="py-24 bg-[#0B0C0E]"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-[#FACC15] font-black uppercase tracking-widest text-sm mb-4">A Solução Definitiva</h2>
          <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
            Tecnologia de <span className="text-[#FACC15]">Elite</span> para seu Esporte
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-8 bg-[#1A1C1E] border border-white/5 rounded-3xl hover:border-[#FACC15]/30 transition-all group"
            >
              <div className="text-[#FACC15] mb-6 group-hover:scale-110 transition-transform origin-left">
                {f.icon}
              </div>
              <h4 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tight">{f.title}</h4>
              <p className="text-gray-400 font-medium leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
