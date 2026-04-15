'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function NameInput() {
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const firstNameRef = useRef<HTMLInputElement>(null);
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setPhase = useGameStore((s) => s.setPhase);
  const { t, locale } = useTranslation();

  const canSubmit = surname.trim() && firstName.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    setPlayerInfo(surname.trim(), firstName.trim());
    setPhase('prologue');
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-8 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <p className="text-white/80 text-lg">{t('nameInput.title')}</p>

      <div className="flex gap-3 w-full max-w-[280px]">
        {/* 성 */}
        <div className="flex flex-col gap-1 w-[80px]">
          <label className="text-white/40 text-xs text-center">
            {locale === 'ko' ? '성' : 'Last'}
          </label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && firstNameRef.current?.focus()}
            placeholder=""
            className="bg-transparent border-b border-white/40 text-white text-center text-xl py-2 outline-none focus:border-white/80 transition-colors w-full"
            autoFocus
            maxLength={10}
          />
        </div>

        {/* 이름 */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-white/40 text-xs text-center">
            {locale === 'ko' ? '이름' : 'First'}
          </label>
          <input
            ref={firstNameRef}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder=""
            className="bg-transparent border-b border-white/40 text-white text-center text-xl py-2 outline-none focus:border-white/80 transition-colors w-full"
            maxLength={20}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="px-8 py-2 border border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('nameInput.confirm')}
      </button>
    </motion.div>
  );
}
