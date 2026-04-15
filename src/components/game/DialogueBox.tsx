'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { npcs } from '@/data/npcs';
import { NpcId, Locale, LocaleText } from '@/types/game';
import { useTypingEffect } from '@/hooks/useTypingEffect';

interface Props {
  npcId: NpcId;
  text: LocaleText;
  locale: Locale;
  onComplete: () => void;
  innerThought?: LocaleText;
}

export default function DialogueBox({ npcId, text, locale, onComplete, innerThought }: Props) {
  const npc = npcs[npcId];
  const { displayed, isDone, skip } = useTypingEffect(text[locale]);
  const [showThought, setShowThought] = useState(false);

  useEffect(() => {
    if (isDone && innerThought) {
      const timer = setTimeout(() => setShowThought(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isDone, innerThought]);

  const handleClick = () => { if (!isDone) skip(); else onComplete(); };

  return (
    <div className="flex flex-col gap-3 w-full" onClick={handleClick}>
      <div className="bg-[#14121a]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden relative">
        {/* 이름 헤더 */}
        <div className="px-4 pt-3 pb-1">
          <span className="text-xs font-bold tracking-wide" style={{ color: npc.color }}>
            {npc.name[locale]}
          </span>
        </div>
        <div className="px-4 pt-1 pb-3 min-h-[52px] relative">
          <p className="text-white/90 text-sm leading-relaxed pr-4">
            {displayed}
            {!isDone && <span className="animate-pulse">|</span>}
          </p>
          {isDone && (
            <motion.span
              className="absolute bottom-2.5 right-3 text-white/50 text-[10px] leading-none"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ▶
            </motion.span>
          )}
        </div>
      </div>

      {showThought && innerThought && (
        <motion.p
          className="text-white/40 text-xs italic text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          ({innerThought[locale]})
        </motion.p>
      )}
    </div>
  );
}
