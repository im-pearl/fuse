'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import StudioCredit from '@/components/ui/StudioCredit';

function generateCode(seed: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let code = '';
  for (let i = 0; i < 8; i++) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    code += chars[hash % chars.length];
  }
  return code.slice(0, 4) + '-' + code.slice(4);
}

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

function CodeModal({ code, onClose }: { code: string; onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center gap-6 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <p className="text-white/50 text-xs tracking-widest uppercase">your code</p>
      <p className="text-white text-3xl font-bold tracking-[0.2em]">{code}</p>
      <div className="p-3 bg-white rounded">
        <QRCodeSVG value={code} size={160} />
      </div>
      <p className="text-white/30 text-xs text-center leading-relaxed">
        구매처에서 이 코드를 제시하면{'\n'}당신에게 맞는 배쓰밤을 받을 수 있어요
      </p>
    </motion.div>
  );
}

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6 },
};

function EndScreen() {
  const [phase, setPhase] = useState<'gameOver' | 'final'>('gameOver');
  const [showCode, setShowCode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const reset = useGameStore((s) => s.reset);
  const bombs = useGameStore((s) => s.bombs);
  const { t } = useTranslation();

  const code = useMemo(() => {
    const seed = bombs.map((b) => b.emotion + b.acquiredAt).join('');
    return generateCode(seed || String(Date.now()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setPhase('final'), 1800);
    return () => clearTimeout(timer);
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
    <div className="relative flex flex-col items-center gap-8 w-full">
      {/* 상단 슬롯: GAME OVER ↔ 터지기 전에 녹이세요 */}
      <div className="relative w-full h-12 flex items-center justify-center">
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
              className="absolute text-white text-base text-center"
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
          {phase === 'gameOver' ? (
            <motion.p
              key="cleared"
              className="absolute text-white/50 text-xs tracking-widest text-center"
              {...FADE}
            >
              {t('ending.screen2.line2')}
            </motion.p>
          ) : (
            <motion.div
              key="buttons"
              className="absolute flex items-center gap-3"
              {...FADE}
            >
              <button
                onClick={() => setShowCode(true)}
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
        {showCode && <CodeModal code={code} onClose={() => setShowCode(false)} />}
      </AnimatePresence>

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
    setTimeout(() => setShowEnd(true), 800);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <AnimatePresence mode="wait">
        {!showEnd ? (
          <motion.div
            key="s1"
            className="flex flex-col items-center gap-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
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
            transition={{ duration: 0.6 }}
          >
            <EndScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <StudioCredit />
    </div>
  );
}
