'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { motion, AnimatePresence } from 'framer-motion';

export function SponsorBanner({ position = 'home' }: { position?: string }) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadSponsors() {
      const q = query(
        collection(db, 'sponsors'),
        where('active', '==', true),
        where('position', '==', position)
      );
      const snap = await getDocs(q);
      setSponsors(snap.docs.map(d => d.data()));
    }
    loadSponsors();
  }, [position]);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % sponsors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sponsors]);

  if (sponsors.length === 0) return null;

  const current = sponsors[currentIndex];

  return (
    <div className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden p-4 mb-8">
      <div className="flex flex-col items-center gap-2">
         <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Patrocínio Oficial</span>
         <AnimatePresence mode="wait">
           <motion.a
             key={currentIndex}
             href={current.link || '#'}
             target="_blank"
             rel="noopener noreferrer"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="flex flex-col items-center gap-3"
           >
             <img src={current.logoUrl} className="h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all duration-500" alt={current.name} />
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{current.name}</p>
           </motion.a>
         </AnimatePresence>
      </div>
    </div>
  );
}
