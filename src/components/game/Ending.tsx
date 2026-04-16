'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

function ScreenContent({
  lines,
  lineDelay = 1200,
  getLineClass,
  onComplete,
}: {
  lines: string[];
  lineDelay?: number;
  getLineClass: (i: number) => string;
  onComplete: () => void;
}) {
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

function FinalScreen({ onComplete }: { onComplete: () => void }) {
  const [showButtons, setShowButtons] = useState(false);
  const reset = useGameStore((s) => s.reset);
  const { t } = useTranslation();

  useEffect(() => {
    const t1 = setTimeout(() => setShowButtons(true), 1400);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => { onComplete(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'FUSE', url: window.location.origin }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.origin).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.p
        className="text-white text-base text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('ending.screen3.line1')}
      </motion.p>

      <AnimatePresence>
        {showButtons && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => {}}
              className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs"
            >
              {t('ending.getCode')}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs"
            >
              {t('ending.restart')}
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="share"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="4.3" y1="7.3" x2="11.7" y2="3.7" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="4.3" y1="8.7" x2="11.7" y2="12.3" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Ending() {
  const [screen, setScreen] = useState(0);
  const { t } = useTranslation();

  const screens = [
    {
      lines: [t('ending.screen1.line1'), t('ending.screen1.line2'), t('ending.screen1.line3')],
      lineDelay: 1000,
      getLineClass: () => 'text-white/90 text-sm font-light tracking-wide',
    },
    {
      lines: [t('ending.screen2.line1'), t('ending.screen2.line2')],
      getLineClass: (i: number) =>
        i === 0 ? 'text-red-400 text-3xl font-bold tracking-widest' : 'text-white/50 text-xs tracking-widest',
    },
  ];

  const handleScreenComplete = () => {
    if (screen < screens.length - 1) {
      setTimeout(() => setScreen((s) => s + 1), 800);
    } else {
      setTimeout(() => setScreen(screens.length), 800);
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
          {screen < screens.length ? (
            <ScreenContent
              lines={screens[screen].lines}
              lineDelay={screens[screen].lineDelay}
              getLineClass={screens[screen].getLineClass}
              onComplete={handleScreenComplete}
            />
          ) : (
            <FinalScreen onComplete={() => {}} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
