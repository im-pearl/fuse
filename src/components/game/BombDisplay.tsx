'use client';

import { motion } from 'framer-motion';
import { Bomb, Locale, EmotionType } from '@/types/game';

const emotionEmoji: Record<EmotionType, string> = {
  anxiety: '\u{1F4A3}',
  burden: '\u{1F4A3}',
  injustice: '\u{1F4A3}',
  helplessness: '\u{1F4A3}',
  selfBlame: '\u{1F4A3}',
  anger: '\u{1F4A3}',
};

const emotionLabel: Record<EmotionType, Record<Locale, string>> = {
  anxiety: { ko: '불안', en: 'Anxiety' },
  burden: { ko: '부담감', en: 'Burden' },
  injustice: { ko: '억울함', en: 'Injustice' },
  helplessness: { ko: '무력감', en: 'Helplessness' },
  selfBlame: { ko: '자괴감', en: 'Self-blame' },
  anger: { ko: '분노', en: 'Anger' },
};

interface Props {
  bombs: Bomb[];
  locale: Locale;
  newBombCount?: number;
}

export default function BombDisplay({ bombs, locale, newBombCount = 0 }: Props) {
  if (bombs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center py-2">
      {bombs.map((bomb, i) => {
        const isNew = i >= bombs.length - newBombCount;
        return (
          <motion.div
            key={`${bomb.acquiredAt}-${bomb.emotion}-${i}`}
            className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1"
            initial={isNew ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={isNew ? { type: 'spring', stiffness: 300, damping: 20 } : undefined}
          >
            <span className="text-xs">{emotionEmoji[bomb.emotion]}</span>
            <span className="text-[10px] text-white/50">{emotionLabel[bomb.emotion][locale]}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
