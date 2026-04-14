'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import { EmotionType } from '@/types/game';

export default function Ending() {
  const [step, setStep] = useState(0);
  const explosionInfo = useGameStore((s) => s.explosionInfo);
  const reset = useGameStore((s) => s.reset);
  const { t } = useTranslation();

  const emotionKey = explosionInfo?.emotion ?? 'default';
  const emotionName = t(`ending.emotions.${emotionKey as EmotionType | 'default'}`);

  const lines = [
    t('ending.line1'),
    t('ending.line2'),
    t('ending.line3', { emotion: emotionName }),
    t('ending.line4'),
    '',
    t('ending.gameOver'),
    t('ending.lifeNotOver'),
    '',
    t('ending.finalMessage'),
  ];

  useEffect(() => {
    if (step < lines.length) {
      const delay = lines[step] === '' ? 1500 : 3000;
      const timer = setTimeout(() => setStep((s) => s + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [step, lines.length]);

  const isFinished = step >= lines.length;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-4">
      <AnimatePresence>
        {lines.slice(0, step).map(
          (line, i) =>
            line && (
              <motion.p
                key={i}
                className={`text-center leading-relaxed ${
                  i === 5
                    ? 'text-red-400 text-xl font-bold'
                    : i === 6
                      ? 'text-white text-xl font-bold'
                      : i === lines.length - 1
                        ? 'text-white/90 text-lg'
                        : 'text-white/70 text-sm'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                {line}
              </motion.p>
            )
        )}
      </AnimatePresence>

      {isFinished && (
        <motion.button
          onClick={reset}
          className="mt-8 px-8 py-3 border border-white/30 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {t('ending.restart')}
        </motion.button>
      )}
    </div>
  );
}
