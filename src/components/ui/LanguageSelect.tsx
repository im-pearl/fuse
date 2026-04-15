'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function LanguageSelect() {
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const firstNameRef = useRef<HTMLInputElement>(null);
  const locale = useGameStore((s) => s.locale);
  const setLocale = useGameStore((s) => s.setLocale);
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setPhase = useGameStore((s) => s.setPhase);
  const { t } = useTranslation();

  const canSubmit = surname.trim() && firstName.trim();

  const handleStart = () => {
    if (!canSubmit) return;
    setPlayerInfo(surname.trim(), firstName.trim());
    setPhase('day');
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-10 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* 타이틀 */}
      <h1 className="text-4xl font-bold tracking-[0.2em] text-white">FUSE</h1>

      {/* 언어 선택 */}
      <div className="flex gap-2 w-full max-w-[280px]">
        <button
          onClick={() => setLocale('ko')}
          className={`flex-1 py-1.5 text-sm border transition-colors ${
            locale === 'ko'
              ? 'border-white text-white bg-white/10'
              : 'border-white/20 text-white/40 hover:text-white/60'
          }`}
        >
          한국어
        </button>
        <button
          onClick={() => setLocale('en')}
          className={`flex-1 py-1.5 text-sm border transition-colors ${
            locale === 'en'
              ? 'border-white text-white bg-white/10'
              : 'border-white/20 text-white/40 hover:text-white/60'
          }`}
        >
          English
        </button>
      </div>

      {/* 이름 입력 */}
      <div className="flex gap-3 w-full max-w-[280px]">
        <div className="flex flex-col gap-1 w-[80px]">
          <label className="text-white/40 text-xs text-center">
            {locale === 'ko' ? '성' : 'Last'}
          </label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && firstNameRef.current?.focus()}
            className="bg-transparent border-b border-white/40 text-white text-center text-xl py-2 outline-none focus:border-white/80 transition-colors w-full"
            autoFocus
            maxLength={10}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-white/40 text-xs text-center">
            {locale === 'ko' ? '이름' : 'First'}
          </label>
          <input
            ref={firstNameRef}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="bg-transparent border-b border-white/40 text-white text-center text-xl py-2 outline-none focus:border-white/80 transition-colors w-full"
            maxLength={20}
          />
        </div>
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}
        disabled={!canSubmit}
        className="px-8 py-2 border border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('nameInput.confirm')}
      </button>
    </motion.div>
  );
}
