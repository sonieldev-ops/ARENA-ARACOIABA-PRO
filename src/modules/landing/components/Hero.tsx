import { motion } from "framer-motion";
import { Trophy, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { trackEvent, DATA_TEST_IDS } from "@/src/lib/tracking";

export function Hero() {
  const WHATSAPP_URL = "https://wa.me/5581900000000?text=Quero%20profissionalizar%20meu%20campeonato";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0C0E] pt-32 pb-20">
      {/* Background Glow Dinâmico */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600 blur-[160px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FACC15] blur-[160px] rounded-full" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[#FACC15] mb-10 shadow-2xl backdrop-blur-sm"
        >
          <Trophy className="w-4 h-4 fill-[#FACC15]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">O Sistema das Grandes Ligas</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.85] uppercase italic"
        >
          PROFISSIONALIZE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-red-600">
            SEU CAMPEONATO
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-400 mb-14 font-medium leading-relaxed"
        >
          A tecnologia de elite que o seu torneio merece. Abandone as planilhas e ofereça uma experiência profissional para atletas, torcedores e patrocinadores.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            data-testid={DATA_TEST_IDS.HERO_CTA}
            onClick={() => trackEvent("CLICK_HERO_CTA")}
            className="w-full sm:w-auto px-12 py-7 bg-[#FACC15] text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 hover:bg-white hover:scale-105 transition-all shadow-[0_20px_50px_rgba(250,204,21,0.2)] group"
          >
            FALAR COM ESPECIALISTA
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            data-testid={DATA_TEST_IDS.HERO_DEMO}
            onClick={() => {
              trackEvent("CLICK_HERO_DEMO");
              document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-12 py-7 bg-white/5 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-4 backdrop-blur-md"
          >
            <Play className="w-5 h-5 fill-current" />
            VER DEMONSTRAÇÃO
          </button>
        </motion.div>

        {/* Mockup Preview com Animação */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 relative max-w-6xl mx-auto group"
        >
           <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full group-hover:bg-red-600/30 transition-all duration-700" />
           <div className="relative rounded-[3rem] border border-white/10 bg-[#121417] p-3 shadow-2xl overflow-hidden">
              <div className="aspect-[21/9] bg-[#0B0C0E] rounded-[2.5rem] border border-white/5 flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/40 to-transparent z-10" />
                 <img
                   src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2070"
                   alt="Soccer Match Background"
                   className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[3s]"
                 />
                 <div className="absolute z-20 flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-24 h-24 rounded-full bg-[#FACC15] flex items-center justify-center shadow-2xl cursor-pointer"
                    >
                       <Play className="w-10 h-10 text-black fill-current ml-1" />
                    </motion.div>
                    <span className="mt-6 text-white font-black tracking-[0.4em] uppercase text-[10px]">Tour pela Plataforma</span>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
