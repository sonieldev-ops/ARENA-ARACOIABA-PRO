'use client';

import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function FavoriteButton({ isFavorite, onClick, className, size = 'md' }: FavoriteButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        isFavorite
          ? "bg-red-600/20 border-red-600/50 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
          : "bg-white/5 border-white/10 text-zinc-600 hover:text-zinc-400 hover:border-white/20",
        size === 'sm' ? "w-7 h-7 border" : "w-10 h-10 border-2",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFavorite ? 'active' : 'inactive'}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 45 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Star
            className={cn(
              size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5",
              isFavorite && "fill-current"
            )}
          />
        </motion.div>
      </AnimatePresence>

      {isFavorite && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 rounded-full bg-red-600/20 blur-md -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}
