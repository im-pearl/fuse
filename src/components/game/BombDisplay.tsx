'use client';

import { motion } from 'framer-motion';
import { Bomb, Locale } from '@/types/game';

// 총 슬롯 수 — Day 1~3 이벤트 기준 최대 폭탄 수 여유 있게 설정
const TOTAL_SLOTS = 16;

interface Props {
  bombs: Bomb[];
  locale: Locale;
  newBombCount?: number;
}

export default function BombDisplay({ bombs, newBombCount = 0 }: Props) {
  const filledCount = bombs.length;

  return (
    <div className="flex flex-wrap gap-[6px] px-1 py-1">
      {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
        const isFilled = i < filledCount;
        const isNew = isFilled && i >= filledCount - newBombCount;

        return (
          <div key={i} className="relative w-6 h-6 flex items-center justify-center">
            {/* 빈 슬롯 */}
            <div className="absolute inset-0 rounded-full border border-white/10" />

            {/* 채워진 폭탄 */}
            {isFilled && (
              <motion.span
                className="text-sm leading-none"
                initial={isNew ? { scale: 0, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={
                  isNew
                    ? { type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }
                    : undefined
                }
              >
                💣
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
}
