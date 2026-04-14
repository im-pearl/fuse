'use client';

import { motion } from 'framer-motion';
import { Bomb, EmotionType, Locale } from '@/types/game';

const EMOTION_ORDER: EmotionType[] = [
  'anxiety',
  'burden',
  'injustice',
  'helplessness',
  'selfBlame',
  'anger',
];

const EMOTION_LABELS: Record<EmotionType, { ko: string; en: string }> = {
  anxiety:     { ko: '불안',   en: 'Anxiety' },
  burden:      { ko: '부담감', en: 'Burden' },
  injustice:   { ko: '억울함', en: 'Injustice' },
  helplessness:{ ko: '무력감', en: 'Helpless' },
  selfBlame:   { ko: '자괴감', en: 'Self-blame' },
  anger:       { ko: '분노',   en: 'Anger' },
};

interface Props {
  bombs: Bomb[];
  locale: Locale;
  newBombEmotions?: EmotionType[];
}

export default function BombDisplay({ bombs, locale, newBombEmotions = [] }: Props) {
  const activatedEmotions = new Set(bombs.map((b) => b.emotion));
  const newBombSet = new Set(newBombEmotions);

  return (
    <div className="flex gap-2 px-1 py-1 justify-between">
      {EMOTION_ORDER.map((emotion) => {
        const isActive = activatedEmotions.has(emotion);
        const isNew = newBombSet.has(emotion);

        return (
          <div key={emotion} className="flex flex-col items-center gap-1 flex-1">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              {isActive && (
                <motion.span
                  className="text-base leading-none"
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
            <span className="text-[9px] text-white/30 leading-none text-center">
              {EMOTION_LABELS[emotion][locale]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
