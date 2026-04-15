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
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="grid grid-cols-3 gap-4 w-full">
          {EMOTION_ORDER.map((emotion) => {
            const isActive = activatedSet.has(emotion);
            const isNew = newSet.has(emotion);
            return (
              <button
                key={emotion}
                onClick={() => isActive ? setSelected(emotion) : undefined}
                className={`
                  relative aspect-square rounded-lg border flex items-center justify-center text-3xl
                  transition-all duration-150
                  ${isActive
                    ? 'border-white/25 bg-white/5 hover:bg-white/10 active:scale-95 cursor-pointer'
                    : 'border-white/8 bg-white/[0.02] cursor-default'
                  }
                `}
              >
                {isActive && '💣'}
                {isNew && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
                    N
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-white/20 text-xs tracking-wide">
          {bombs.length === 0 ? t('bombs.empty') : t('bombs.hint')}
        </p>
      </div>

      {/* 폭탄 상세 카드 */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="absolute z-20 inset-x-6 top-1/2 -translate-y-1/2 bg-[#1a1824] border border-white/20 rounded-xl p-6 flex flex-col gap-4"
              initial={{ opacity: 0, scale: 0.94, y: '-48%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.94, y: '-48%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              {/* X 버튼 */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>

              {/* 카드 헤더 */}
              <div className="flex items-center gap-3 pr-6">
                <span className="text-4xl">💣</span>
                <span className="text-white text-base font-medium leading-snug">
                  {t(`bombs.${selected}.name`)}
                </span>
              </div>

              {/* 설명 */}
              <p className="text-white/65 text-sm leading-relaxed">
                {t(`bombs.${selected}.description`)}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
