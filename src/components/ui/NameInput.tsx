'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function NameInput() {
  const [name, setName] = useState('');
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const setPhase = useGameStore((s) => s.setPhase);
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      setPhase('prologue');
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-6 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <p className="text-white/80 text-lg">{t('nameInput.title')}</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={t('nameInput.placeholder')}
        className="bg-transparent border-b border-white/40 text-white text-center text-xl py-2 outline-none focus:border-white/80 transition-colors w-full max-w-[240px]"
        autoFocus
        maxLength={20}
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="px-8 py-2 border border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('nameInput.confirm')}
      </button>
    </motion.div>
  );
}
