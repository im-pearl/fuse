'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Locale } from '@/types/game';

export default function LanguageSelect() {
  const setLocale = useGameStore((s) => s.setLocale);
  const setPhase = useGameStore((s) => s.setPhase);

  const handleSelect = (locale: Locale) => {
    setLocale(locale);
    setPhase('name');
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-4xl font-bold tracking-widest text-white">FUSE</h1>
      <div className="flex flex-col gap-4 w-48">
        <button
          onClick={() => handleSelect('ko')}
          className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 transition-colors text-lg"
        >
          한국어
        </button>
        <button
          onClick={() => handleSelect('en')}
          className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 transition-colors text-lg"
        >
          English
        </button>
      </div>
    </motion.div>
  );
}
