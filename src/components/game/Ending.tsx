'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import StudioCredit from '@/components/ui/StudioCredit';

const MELT_URL = 'https://museumshop.or.kr';

function ScreenContent({
  lines,
  lineDelay = 1800,
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
          className={`text-center leading-relaxed [word-break:keep-all] ${getLineClass(i)}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          {line}
        </motion.p>
      ))}
    </>
  );
}

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 1.0 },
};

function EndScreen() {
  const [phase, setPhase] = useState<'gameOver' | 'final'>('gameOver');
  const [showButtons, setShowButtons] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const reset = useGameStore((s) => s.reset);
  const { t } = useTranslation();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('final'), 4000);
    const t2 = setTimeout(() => setShowButtons(true), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleShare = async () => {
    const url = window.location.origin;
    const shareData = {
      title: t('title'),
      text: t('subtitle'),
      url,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.text} ${url}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* 엔딩 애니메이션 (고정) */}
      <video
        src="/assets/animation/ending.mp4"
        autoPlay
        muted
        playsInline
        className="w-[160px] aspect-square object-cover mb-2"
      />

      {/* 상단 슬롯: GAME OVER ↔ 터지기 전에 녹이세요 */}
      <div className="relative w-full h-12 flex items-center justify-center mb-6">
        <AnimatePresence>
          {phase === 'gameOver' ? (
            <motion.p
              key="gameOver"
              className="absolute text-red-400 text-3xl font-bold tracking-widest text-center"
              {...FADE}
            >
              {t('ending.screen2.line1')}
            </motion.p>
          ) : (
            <motion.p
              key="meltLine"
              className="absolute text-white text-lg text-center [word-break:keep-all]"
              {...FADE}
            >
              {t('ending.screen3.line1')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 슬롯: YOUR FEELINGS ARE NOT CLEARED ↔ 버튼들 */}
      <div className="relative w-full h-10 flex items-center justify-center">
        <AnimatePresence>
          {phase === 'gameOver' && (
            <motion.p
              key="cleared"
              className="absolute text-white/50 text-xs tracking-widest text-center"
              {...FADE}
            >
              {t('ending.screen2.line2')}
            </motion.p>
          )}
          {phase === 'final' && showButtons && (
            <motion.div
              key="buttons"
              className="absolute flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => window.open(MELT_URL, '_blank', 'noopener,noreferrer')}
                className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs"
              >
                {t('ending.melt')}
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

      <AnimatePresence>
        {showToast && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded text-white/80 text-xs whitespace-nowrap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {t('ending.linkCopied')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Ending() {
  const [showEnd, setShowEnd] = useState(false);
  const { t } = useTranslation();

  const screen1Lines = [
    t('ending.screen1.line1'),
    t('ending.screen1.line2'),
    t('ending.screen1.line3'),
  ];

  const handleScreen1Complete = () => {
    setTimeout(() => setShowEnd(true), 1400);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-8">
      {/* GAME OVER 부터 검정 배경 */}
      {showEnd && (
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0 }}
        />
      )}

      <AnimatePresence mode="wait">
        {!showEnd ? (
          <motion.div
            key="s1"
            className="flex flex-col items-center gap-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
          >
            <ScreenContent
              lines={screen1Lines}
              lineDelay={1000}
              getLineClass={() => 'text-white/90 text-lg font-light tracking-wide'}
              onComplete={handleScreen1Complete}
            />
          </motion.div>
        ) : (
          <motion.div
            key="end"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
          >
            <EndScreen />
            <StudioCredit />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
