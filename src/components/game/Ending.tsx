'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

const HOLD_AFTER_MS = 800;

interface ScreenContentProps {
  lines: string[];
  lineDelay?: number;
  getLineClass: (i: number) => string;
  onComplete: () => void;
  slideUp?: boolean;
}

function ScreenContent({ lines, lineDelay = 1200, getLineClass, onComplete, slideUp = true }: ScreenContentProps) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (lineIndex < lines.length) {
      const timer = setTimeout(() => setLineIndex((i) => i + 1), lineDelay);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex]);

  if (slideUp) {
    return (
      <>
        {lines.slice(0, lineIndex).map((line, i) => (
          <motion.p
            key={i}
            className={`text-center leading-relaxed ${getLineClass(i)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {line}
          </motion.p>
        ))}
      </>
    );
  }

  // slideUp=false: 모든 줄 미리 렌더링 → 레이아웃 고정, opacity만 순서대로 켜짐
  return (
    <>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          className={`text-center leading-relaxed ${getLineClass(i)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: i < lineIndex ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {line}
        </motion.p>
      ))}
    </>
  );
}

export default function Ending() {
  const [screen, setScreen] = useState(0);
  const [showRestart, setShowRestart] = useState(false);
  const reset = useGameStore((s) => s.reset);
  const { t } = useTranslation();

  const screenLines = [
    [
      t('ending.screen1.line1'),
      t('ending.screen1.line2'),
      t('ending.screen1.line3'),
      t('ending.screen1.line4'),
      t('ending.screen1.line5'),
    ],
    [
      t('ending.screen2.line1'),
      t('ending.screen2.line2'),
      t('ending.screen2.line3'),
    ],
    [
      t('ending.screen3.line1'),
      t('ending.screen3.line2'),
      t('ending.screen3.line3'),
    ],
  ];

  const screen0Class = (i: number) => {
    if (i === 1 || i === 3) return 'text-white/40 text-sm italic';
    if (i === 4) return 'text-white/70 text-base';
    return 'text-white/70 text-sm';
  };

  const screen1Class = () => 'text-white/90 text-sm font-light tracking-wide';

  const screen2Class = (i: number) => {
    if (i === 0) return 'text-red-400 text-3xl font-bold tracking-widest';
    if (i === 1) return 'text-white/50 text-xs tracking-widest';
    return 'text-white text-base mt-4';
  };

  const handleScreenComplete = () => {
    if (screen < 2) {
      setTimeout(() => setScreen((s) => s + 1), HOLD_AFTER_MS);
    } else {
      setTimeout(() => setShowRestart(true), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="flex flex-col items-center gap-5 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {screen === 0 && (
            <ScreenContent
              lines={screenLines[0]}
              getLineClass={screen0Class}
              onComplete={handleScreenComplete}
            />
          )}
          {screen === 1 && (
            <ScreenContent
              lines={screenLines[1]}
              lineDelay={1000}
              getLineClass={screen1Class}
              onComplete={handleScreenComplete}
            />
          )}
          {screen === 2 && (
            <ScreenContent
              lines={screenLines[2]}
              getLineClass={screen2Class}
              onComplete={handleScreenComplete}
              slideUp={false}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showRestart && (
        <motion.button
          onClick={reset}
          className="mt-10 px-8 py-3 border border-white/30 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
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
