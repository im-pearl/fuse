'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, EmotionType } from '@/types/game';
import { useTranslation } from '@/i18n/useTranslation';

const EMOTION_ORDER: EmotionType[] = [
  'anxiety', 'burden', 'injustice', 'helplessness', 'selfBlame', 'anger',
];

interface Props {
  bombs: Bomb[];
  newBombEmotions?: EmotionType[];
  onClose: () => void;
}

export default function BombInventory({ bombs, newBombEmotions = [], onClose }: Props) {
  const [selected, setSelected] = useState<EmotionType | null>(null);
  const { t } = useTranslation();

  const activatedSet = new Set(bombs.map((b) => b.emotion));
  const newSet = new Set(newBombEmotions);

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black/85 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-white/60 text-xs tracking-wide uppercase">
          {t('bombs.inventory')}
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* 슬롯 그리드 */}
      <div className="px-8 pt-2">
        <div className="grid grid-cols-3 gap-4 w-full">
          {EMOTION_ORDER.map((emotion) => {
            const isActive = activatedSet.has(emotion);
            const isNew = newSet.has(emotion);
            return (
              <button
                key={emotion}
                onClick={() => isActive ? setSelected(selected === emotion ? null : emotion) : undefined}
                className={`
                  relative aspect-square rounded-lg border flex items-center justify-center
                  transition-all duration-150
                  ${isActive
                    ? 'border-white/25 bg-white/5 hover:bg-white/10 active:scale-95 cursor-pointer'
                    : 'border-white/8 bg-white/[0.02] cursor-default'
                  }
                  ${selected === emotion ? 'border-white/50' : ''}
                `}
              >
                {isActive && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/assets/bomb.png" alt="" className="w-4/5 h-4/5 object-contain" style={{ imageRendering: 'pixelated' }} />
                )}
                {isNew && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
                    N
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-white/20 text-xs tracking-wide text-center mt-4">
          {bombs.length === 0 ? t('bombs.empty') : t('bombs.hint')}
        </p>
      </div>

      {/* 상세 카드 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="mx-8 mt-6 bg-[#1a1824] border border-white/20 rounded-xl p-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/bomb.png" alt="" width={36} height={36} style={{ imageRendering: 'pixelated' }} />
              <span className="text-white text-base font-medium leading-snug">
                {t(`bombs.${selected}.name`)}
              </span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed">
              {t(`bombs.${selected}.description`)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
