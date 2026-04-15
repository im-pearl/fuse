'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const FRAMES = Array.from({ length: 10 }, (_, i) => `/assets/explosion/Circle_explosion${i + 1}.png`);

// 점화 빠르게, 연기 느리게
const FRAME_DURATIONS = [70, 70, 100, 130, 130, 160, 180, 210, 240, 320];

export default function GameOver() {
  const setPhase = useGameStore((s) => s.setPhase);
  const [stage, setStage] = useState<'shake' | 'explode' | 'done'>('shake');
  const [frameIndex, setFrameIndex] = useState(0);

  // 2초 흔들림 → 폭발
  useEffect(() => {
    const t = setTimeout(() => setStage('explode'), 2000);
    return () => clearTimeout(t);
  }, []);

  // 프레임 진행
  useEffect(() => {
    if (stage !== 'explode') return;
    if (frameIndex >= FRAMES.length - 1) {
      const t = setTimeout(() => setStage('done'), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFrameIndex((i) => i + 1), FRAME_DURATIONS[frameIndex]);
    return () => clearTimeout(t);
  }, [stage, frameIndex]);

  // done → ending
  useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(() => setPhase('ending'), 1200);
    return () => clearTimeout(t);
  }, [stage, setPhase]);

  return (
    <div className="relative h-full overflow-hidden bg-black">

      {/* 배경 흔들림 */}
      <AnimatePresence>
        {stage === 'shake' && (
          <motion.img
            key="bg"
            src="/assets/bg-office.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ scale: 1.12 }}
            animate={{
              x: [0, -9, 11, -13, 9, -7, 13, -11, 7, -5, 0],
              y: [0, 6, -8, 5, -11, 8, -5, 10, -6, 3, 0],
            }}
            transition={{ duration: 0.32, repeat: Infinity, ease: 'linear' }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
          />
        )}
      </AnimatePresence>

      {/* 폭발 프레임 */}
      <AnimatePresence>
        {stage === 'explode' && (
          <motion.div
            key="explode"
            className="absolute inset-0 flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.06 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FRAMES[frameIndex]}
              alt=""
              className="w-full aspect-square object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 페이드 아웃 → 검정 */}
      <AnimatePresence>
        {stage === 'done' && (
          <motion.div
            key="fade"
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
