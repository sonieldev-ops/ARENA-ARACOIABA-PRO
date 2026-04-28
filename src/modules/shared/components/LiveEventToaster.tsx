'use client';

import { useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { toast } from 'sonner';
import { Trophy, AlertCircle, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameEvent {
  type: string;
  playerName?: string;
  [key: string]: unknown;
}

export function LiveEventToaster() {
  const showEventToast = useCallback((event: GameEvent) => {
    const icons: Record<string, React.ReactNode> = {
      'GOAL': <Trophy className="w-5 h-5 text-yellow-500" />,
      'YELLOW_CARD': <AlertCircle className="w-5 h-5 text-yellow-400" />,
      'RED_CARD': <AlertCircle className="w-5 h-5 text-red-500" />,
      'SUBSTITUTION': <Users className="w-5 h-5 text-blue-500" />,
      'START': <Activity className="w-5 h-5 text-green-500" />,
      'END': <Activity className="w-5 h-5 text-slate-500" />,
    };

    const titles: Record<string, string> = {
      'GOAL': '⚽ GOL!',
      'YELLOW_CARD': '🟨 CARTÃO AMARELO',
      'RED_CARD': '🟥 CARTÃO VERMELHO',
      'SUBSTITUTION': '🔄 SUBSTITUIÇÃO',
      'START': '⏱️ PARTIDA INICIADA',
      'END': '🏁 PARTIDA ENCERRADA',
    };

    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border-2 border-red-600/30 p-4 rounded-2xl shadow-2xl shadow-red-900/40 flex items-start gap-4 min-w-[320px] backdrop-blur-xl"
      >
        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
          {icons[event.type] || icons['START']}
        </div>
        <div className="flex-1">
          <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">
            {titles[event.type] || 'Evento de Jogo'}
          </h4>
          <p className="text-white font-bold text-sm">
            {event.playerName || 'Jogador'}
          </p>
          <p className="text-slate-400 text-[11px] mt-1 font-medium italic">
             Acompanhe ao vivo no Fan Hub
          </p>
        </div>
        <button 
          onClick={() => toast.dismiss(t)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    ), { duration: 5000, position: 'top-right' });
  }, []);

  useEffect(() => {
    // Ouvir apenas eventos criados a partir de AGORA
    const startTime = Timestamp.now();

    const q = query(
      collection(db, 'eventos_partida'),
      where('timestamp', '>', startTime),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const event = change.doc.data() as GameEvent;
          showEventToast(event);
        }
      });
    });

    return () => unsubscribe();
  }, [showEventToast]);

  return null;
}
