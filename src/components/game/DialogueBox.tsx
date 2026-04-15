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
  const fullText = text[locale];
  const { displayed, isDone, skip } = useTypingEffect(fullText);
  const [showThought, setShowThought] = useState(false);

  useEffect(() => {
    if (isDone && innerThought) {
      const timer = setTimeout(() => setShowThought(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isDone, innerThought]);

  const handleClick = () => {
    if (!isDone) skip();
    else onComplete();
  };

  return (
    <div className="flex flex-col gap-3 w-full" onClick={handleClick}>
      <span className="text-sm font-bold" style={{ color: npc.color }}>
        {npc.name[locale]}
      </span>

      <div className="bg-[#14121a]/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 min-h-[80px] relative">
        <p className="text-white/90 text-sm leading-relaxed pr-4">
          {displayed}
          {!isDone && <span className="animate-pulse">|</span>}
        </p>
        {isDone && (
          <motion.span
            className="absolute bottom-2.5 right-3 text-white/30 text-[10px] leading-none"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ▶
          </motion.span>
        )}
      </div>

      {showThought && innerThought && (
        <motion.p
          className="text-white/40 text-xs italic text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {innerThought[locale]}
        </motion.p>
      )}
    </div>
  );
}
