'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function Prologue() {
  const [lineIndex, setLineIndex] = useState(0);
  const [showStart, setShowStart] = useState(false);
  const setPhase = useGameStore((s) => s.setPhase);
  const { t } = useTranslation();

  const lines = [t('prologue.line1'), t('prologue.line2'), t('prologue.line3')];

  useEffect(() => {
    if (lineIndex < lines.length) {
      const timer = setTimeout(() => {
        setLineIndex((i) => i + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowStart(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, lines.length]);

  const handleStart = () => {
    setPhase('day');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <div className="flex flex-col items-center gap-6 min-h-[200px]">
        <AnimatePresence>
          {lines.slice(0, lineIndex).map((line, i) => (
            <motion.p
              key={i}
              className="text-white/90 text-center text-base leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showStart && (
          <motion.button
            onClick={handleStart}
            className="mt-12 px-8 py-3 border border-white/30 text-white hover:bg-white/10 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {t('prologue.start')}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
