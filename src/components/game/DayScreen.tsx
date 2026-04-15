'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useTypingEffect } from '@/hooks/useTypingEffect';
import { days } from '@/data/events';
import { dayOpenings } from '@/data/dayOpenings';
import { npcs } from '@/data/npcs';
import { LocaleText, NpcId, Locale, EmotionType } from '@/types/game';
import { fillNamePlaceholders } from '@/lib/nameUtils';
import { analyzeEmotion } from '@/lib/ai';
import DialogueBox from './DialogueBox';
import PlayerInput from './PlayerInput';
import BombInventory from './BombInventory';
import CommentOverlay from './CommentOverlay';

/* ─────────────────────── 서브 컴포넌트 ─────────────────────── */

function LoadingDots() {
  return (
    <div className="flex gap-1 justify-center py-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-white/40 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function StaticDialogue({ npcId, text, locale }: { npcId: NpcId; text: LocaleText; locale: Locale }) {
  const npc = npcs[npcId];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold" style={{ color: npc.color }}>
        {npc.name[locale]}
      </span>
      <div className="bg-[#14121a]/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 min-h-[80px]">
        <p className="text-white/70 text-sm leading-relaxed pr-4">{text[locale]}</p>
      </div>
    </div>
  );
}

function DayIntro({
  day, playerName, locale, onComplete,
}: {
  day: number; playerName: string; locale: Locale; onComplete: () => void;
}) {
  const opening = dayOpenings[day] ?? { ko: '...', en: '...' };
  const { displayed, isDone, skip } = useTypingEffect(opening[locale]);
  const handleClick = () => { if (!isDone) skip(); else onComplete(); };

  return (
    <div className="flex flex-col gap-3 w-full" onClick={handleClick}>
      <span className="text-xs text-white/25 tracking-widest">{playerName}</span>
      <div className="bg-black/60 border border-white/10 rounded-lg p-4 min-h-[80px] relative">
        <p className="text-white/55 text-sm italic leading-relaxed pr-4">
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
    </div>
  );
}

/* ─────────────────────── 메인 ─────────────────────── */

export default function DayScreen() {
  const {
    currentDay, currentEventIndex, eventPhase, locale,
    playerSurname, playerFirstName, bombs, playerInput1, aiComment,
    setEventPhase, setPlayerInput1, setPlayerInput2,
    applyAIResult, advanceEvent,
  } = useGameStore();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [newBombEmotions, setNewBombEmotions] = useState<EmotionType[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [generatedFollowUp, setGeneratedFollowUp] = useState<LocaleText | null>(null);
  const [dayIntroActive, setDayIntroActive] = useState(true);

  useEffect(() => { setDayIntroActive(true); }, [currentDay]);

  /* ── 파생 상태 ── */
  const dayData = days[currentDay];
  const event = dayData.events[currentEventIndex];
  const npc = npcs[event.npc];
  const isBlurred = !dayIntroActive;
  const npcVisible = !dayIntroActive && eventPhase !== 'showResult';
  const isShowingResult = eventPhase === 'showResult';
  const playerFullName = `${playerSurname}${playerFirstName}`;

  const fillText = (text: LocaleText): LocaleText => ({
    ko: fillNamePlaceholders(text.ko, playerSurname, playerFirstName),
    en: fillNamePlaceholders(text.en, playerSurname, playerFirstName),
  });

  const filledDialogue = fillText(event.dialogue);
  const filledInnerThought = event.innerThought ? fillText(event.innerThought) : undefined;
  const followUpText = generatedFollowUp ?? fillText(event.followUpDialogue);

  /* ── 핸들러 ── */
  const handleDialogueComplete = () => setEventPhase('playerInput1');

  const handleInput1 = async (text: string) => {
    setPlayerInput1(text);
    setEventPhase('loadingNpcReaction');
    setIsLoading(true);
    try {
      const res = await fetch('/api/npc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: event.npc, originalDialogue: event.dialogue[locale],
          playerInput1: text, playerSurname, playerFirstName, locale,
        }),
      });
      const data = await res.json();
      setGeneratedFollowUp({ ko: data.dialogue, en: data.dialogue });
    } catch {
      setGeneratedFollowUp(fillText(event.followUpDialogue));
    } finally {
      setIsLoading(false);
      setEventPhase('npcFollowUp');
    }
  };

  const handleFollowUpComplete = () => setEventPhase('playerInput2');

  const handleInput2 = async (text: string) => {
    setPlayerInput2(text);
    setEventPhase('aiAnalyzing');
    setIsLoading(true);
    try {
      const result = await analyzeEmotion({
        npcDialogue: event.dialogue[locale],
        npcFollowUp: generatedFollowUp?.[locale] ?? event.followUpDialogue[locale],
        playerInput1, playerInput2: text,
        playerSurname, playerFirstName, locale,
      });
      const existing = new Set(bombs.map((b) => b.emotion));
      setNewBombEmotions(result.emotions.map((d) => d.emotion).filter((e) => !existing.has(e)));
      applyAIResult(result.emotions, result.comment);
    } catch {
      const existing = new Set(bombs.map((b) => b.emotion));
      if (!existing.has('burden')) setNewBombEmotions(['burden']);
      applyAIResult(
        [{ emotion: 'burden', amount: 20 }],
        locale === 'ko' ? '말하지 못한 마음이 조금 더 무거워졌습니다.' : 'The words left unsaid grew a little heavier.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultDone = () => {
    setNewBombEmotions([]);
    setGeneratedFollowUp(null);
    advanceEvent();
  };

  /* ── 렌더 ── */
  return (
    <div className="flex flex-col h-full relative">

      {/* 레이어 0: 배경 이미지 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/bg-office.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-500 pointer-events-none"
        style={{ filter: isBlurred ? 'blur(6px) brightness(0.45)' : 'none' }}
      />

      {/* 레이어 1: NPC 반신 */}
      <AnimatePresence>
        {npcVisible && (
          <motion.img
            key={event.npc}
            src={`/assets/${npc.imageName}.png`}
            alt=""
            className="absolute z-[1] pointer-events-none"
            style={{
              bottom: '20%',
              width: 220,
              ...(npc.position === 'left' ? { left: 40 } : { right: 40 }),
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* 레이어 2: UI ─────────────────────────────────── */}

      {/* 헤더 */}
      <div className="flex items-center justify-between py-3 px-4 border-b border-white/10 shrink-0 relative z-[2] bg-[#14121a]/70">
        <span className="text-white/40 text-xs tracking-widest">
          {t('game.day', { day: String(currentDay + 1) })}
        </span>
        <button
          onClick={() => setShowInventory(true)}
          className="relative w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          aria-label="감정 보관함"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="16" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 10h16" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 10v2h4v-2" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          {newBombEmotions.length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full" />
          )}
        </button>
      </div>

      {/* 인벤토리 오버레이 */}
      <AnimatePresence>
        {showInventory && (
          <BombInventory bombs={bombs} newBombEmotions={newBombEmotions} onClose={() => setShowInventory(false)} />
        )}
      </AnimatePresence>

      {/* 메인 컨텐츠 */}
      {dayIntroActive ? (
        <div className="flex-1 flex flex-col justify-end px-4 pb-4 relative z-[2]">
          <DayIntro
            day={currentDay}
            playerName={playerFullName}
            locale={locale}
            onComplete={() => setDayIntroActive(false)}
          />
        </div>
      ) : isShowingResult ? (
        <div className="flex-1 flex items-center justify-center px-4 pb-4 relative z-[2]">
          <CommentOverlay comment={aiComment} onDone={handleResultDone} />
        </div>
      ) : (
        <>
          {/* 대사 영역 */}
          <div className="flex-1 flex flex-col justify-end px-4 pb-3 overflow-y-auto relative z-[2]">
            {eventPhase === 'npcDialogue' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <DialogueBox
                  npcId={event.npc} text={filledDialogue} locale={locale}
                  innerThought={filledInnerThought} onComplete={handleDialogueComplete}
                />
              </motion.div>
            )}

            {(eventPhase === 'playerInput1' || eventPhase === 'loadingNpcReaction') && (
              <>
                <StaticDialogue npcId={event.npc} text={filledDialogue} locale={locale} />
                {filledInnerThought && (
                  <p className="text-white/30 text-xs italic text-center mt-3">{filledInnerThought[locale]}</p>
                )}
              </>
            )}

            {eventPhase === 'npcFollowUp' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <DialogueBox npcId={event.npc} text={followUpText} locale={locale} onComplete={handleFollowUpComplete} />
              </motion.div>
            )}

            {(eventPhase === 'playerInput2' || eventPhase === 'aiAnalyzing') && (
              <StaticDialogue npcId={event.npc} text={followUpText} locale={locale} />
            )}
          </div>

          {/* 입력 영역 */}
          <div className="relative h-[72px] shrink-0 border-t border-white/5 z-[2] bg-[#14121a]/90">
            <AnimatePresence mode="wait">
              {eventPhase === 'playerInput1' && (
                <motion.div key="input1" className="absolute inset-0 flex items-center px-4"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <PlayerInput onSubmit={handleInput1} />
                </motion.div>
              )}
              {eventPhase === 'loadingNpcReaction' && (
                <motion.div key="loadingNpc" className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingDots />
                </motion.div>
              )}
              {eventPhase === 'playerInput2' && (
                <motion.div key="input2" className="absolute inset-0 flex items-center px-4"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <PlayerInput onSubmit={handleInput2} />
                </motion.div>
              )}
              {eventPhase === 'aiAnalyzing' && isLoading && (
                <motion.div key="loadingAI" className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingDots />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
