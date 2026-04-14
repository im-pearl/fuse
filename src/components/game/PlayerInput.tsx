'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

interface Props {
  onSubmit: (text: string) => void;
}

export default function PlayerInput({ onSubmit }: Props) {
  const [text, setText] = useState('');
  const { t } = useTranslation();
  const firedRef = useRef(false);

  const handleSubmit = () => {
    if (!text.trim() || firedRef.current) return;
    firedRef.current = true;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <motion.div
      className="flex gap-2 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit();
        }}
        placeholder={t('game.inputPlaceholder')}
        className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
        autoFocus
        maxLength={200}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('game.send')}
      </button>
    </motion.div>
  );
}
