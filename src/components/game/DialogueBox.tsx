'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { npcs } from '@/data/npcs';
import { NpcId, Locale, LocaleText } from '@/types/game';

interface Props {
  npcId: NpcId;
  text: LocaleText;
  locale: Locale;
  onComplete: () => void;
  innerThought?: LocaleText;
}

function useTypingEffect(text: string, speed: number = 40) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isDone, skip: () => { setDisplayed(text); setIsDone(true); } };
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
    if (!isDone) {
      skip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full" onClick={handleClick}>
      {/* NPC 이름 */}
      <span className="text-sm font-bold" style={{ color: npc.color }}>
        {npc.name[locale]}
      </span>

      {/* 대사 */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[80px]">
        <p className="text-white/90 text-sm leading-relaxed">
          {displayed}
          {!isDone && <span className="animate-pulse">|</span>}
        </p>
      </div>

      {/* 속마음 */}
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

      {isDone && (
        <p className="text-white/20 text-xs text-center">
          {locale === 'ko' ? '탭하여 계속' : 'Tap to continue'}
        </p>
      )}
    </div>
  );
}
