'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Bomb } from '@/types/game';

export default function GameOver() {
  const bombs = useGameStore((s) => s.bombs);
  const setPhase = useGameStore((s) => s.setPhase);
  const [phase, setLocalPhase] = useState<'shake' | 'explode' | 'black'>('shake');

  useEffect(() => {
    const timer1 = setTimeout(() => setLocalPhase('explode'), 2000);
    const timer2 = setTimeout(() => setLocalPhase('black'), 3500);
    const timer3 = setTimeout(() => setPhase('ending'), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [setPhase]);

  return (
    <div className="flex items-center justify-center h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'shake' && (
          <motion.div
            key="shake"
            className="flex flex-wrap gap-3 justify-center px-4"
            animate={{
              x: [0, -3, 3, -3, 3, -5, 5, -5, 5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {bombs.map((bomb: Bomb, i: number) => (
              <motion.span
                key={i}
                className="text-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              >
                {'\u{1F4A3}'}
              </motion.span>
            ))}
          </motion.div>
        )}

        {phase === 'explode' && (
          <motion.div
            key="explode"
            className="text-6xl"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: [1, 3, 5], opacity: [1, 1, 0] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {'\u{1F4A5}'}
          </motion.div>
        )}

        {phase === 'black' && (
          <motion.div
            key="black"
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
