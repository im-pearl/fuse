'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function Story() {
  const setPhase = useGameStore((s) => s.setPhase);
  const { t } = useTranslation();
  const [stage, setStage] = useState<'video' | 'text'>('video');
  const [lineIndex, setLineIndex] = useState(0);

  const textLines = [t('story.sub2a'), t('story.sub2b'), t('story.sub2c')];

  useEffect(() => {
    const t1 = setTimeout(() => setStage('text'), 5000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage !== 'text') return;
    if (lineIndex < textLines.length) {
      const t1 = setTimeout(() => setLineIndex((i) => i + 1), 1200);
      return () => clearTimeout(t1);
    } else {
      const t1 = setTimeout(() => setPhase('ending'), 1500);
      return () => clearTimeout(t1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, lineIndex]);

  return (
    <div className="relative h-full overflow-hidden bg-[#14121a]">
      <AnimatePresence>
        {stage === 'video' && (
          <motion.video
            src="/assets/animation/story.mp4"
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* 비디오 자막 (1592년) */}
      {stage === 'video' && (
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-1 px-4">
          {[t('story.sub1a'), t('story.sub1b')].map((line, i) => (
            <p
              key={i}
              className={`text-white text-sm text-center leading-relaxed bg-black/80 px-2 py-0.5 ${i === 1 ? 'italic' : ''}`}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* 텍스트 단계 (2026년) */}
      {stage === 'text' && (
        <div className="flex flex-col items-center justify-center h-full gap-5 px-8">
          {textLines.slice(0, lineIndex).map((line, i) => (
            <motion.p
              key={i}
              className={`text-center leading-relaxed ${i === 1 ? 'text-white/70 text-sm italic' : 'text-white/70 text-sm'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      )}
    </div>
  );
}
