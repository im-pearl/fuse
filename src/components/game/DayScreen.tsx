'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import { days } from '@/data/events';
import { LocaleText, NpcId, Locale, EmotionType } from '@/types/game';
import { fillNamePlaceholders } from '@/lib/nameUtils';
import { npcs } from '@/data/npcs';
import DialogueBox from './DialogueBox';
import PlayerInput from './PlayerInput';
import BombInventory from './BombInventory';
import CommentOverlay from './CommentOverlay';
import { analyzeEmotion } from '@/lib/ai';

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

// 타이핑 없이 NPC 대사를 정적으로 표시 (입력 중에 위에 고정)
function StaticDialogue({ npcId, text, locale }: { npcId: NpcId; text: LocaleText; locale: Locale }) {
  const npc = npcs[npcId];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold" style={{ color: npc.color }}>
        {npc.name[locale]}
      </span>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[80px]">
        <p className="text-white/70 text-sm leading-relaxed pr-4">{text[locale]}</p>
      </div>
    </div>
  );
}

export default function DayScreen() {
  const {
    currentDay,
    currentEventIndex,
    eventPhase,
    locale,
    playerSurname,
    playerFirstName,
    bombs,
    playerInput1,
    aiComment,
    setEventPhase,
    setPlayerInput1,
    setPlayerInput2,
    applyAIResult,
    advanceEvent,
  } = useGameStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [newBombEmotions, setNewBombEmotions] = useState<EmotionType[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [generatedFollowUp, setGeneratedFollowUp] = useState<LocaleText | null>(null);

  const dayData = days[currentDay];
  const event = dayData.events[currentEventIndex];
  const isSystem = event.npc === 'system';

  const fillText = (text: LocaleText): LocaleText => ({
    ko: fillNamePlaceholders(text.ko, playerSurname, playerFirstName),
    en: fillNamePlaceholders(text.en, playerSurname, playerFirstName),
  });

  const handleDialogueComplete = () => {
    if (isSystem) {
      advanceEvent();
      return;
    }
    setEventPhase('playerInput1');
  };

  const handleInput1 = async (text: string) => {
    setPlayerInput1(text);
    setEventPhase('loadingNpcReaction');
    setIsLoading(true);

    try {
      const res = await fetch('/api/npc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: event.npc,
          originalDialogue: event.dialogue[locale],
          playerInput1: text,
          playerSurname,
          playerFirstName,
          locale,
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

  const handleFollowUpComplete = () => {
    setEventPhase('playerInput2');
  };

  const handleInput2 = async (text: string) => {
    setPlayerInput2(text);
    setEventPhase('aiAnalyzing');
    setIsLoading(true);

    try {
      const result = await analyzeEmotion({
        npcDialogue: event.dialogue[locale],
        npcFollowUp: generatedFollowUp?.[locale] ?? event.followUpDialogue[locale],
        playerInput1,
        playerInput2: text,
        playerSurname,
        playerFirstName,
        locale,
      });
      const existingEmotionTypes = new Set(bombs.map((b) => b.emotion));
      setNewBombEmotions(
        result.emotions.map((d) => d.emotion).filter((e) => !existingEmotionTypes.has(e))
      );
      applyAIResult(result.emotions, result.comment);
    } catch {
      const existingEmotionTypes = new Set(bombs.map((b) => b.emotion));
      if (!existingEmotionTypes.has('burden')) setNewBombEmotions(['burden']);
      applyAIResult(
        [{ emotion: 'burden', amount: 20 }],
        locale === 'ko'
          ? '말하지 못한 마음이 조금 더 무거워졌습니다.'
          : 'The words left unsaid grew a little heavier.'
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

  const filledDialogue = fillText(event.dialogue);
  const filledInnerThought = event.innerThought ? fillText(event.innerThought) : undefined;
  const followUpText = generatedFollowUp ?? fillText(event.followUpDialogue);

  // 결과 오버레이는 전체 영역 사용
  const isShowingResult = eventPhase === 'showResult';

  return (
    <div className="flex flex-col h-full relative">
      {/* Day 헤더 */}
      <div className="flex items-center justify-between py-3 px-4 border-b border-white/10 shrink-0">
        <span className="text-white/40 text-xs tracking-widest">
          {t('game.day', { day: String(currentDay + 1) })}
        </span>

        {/* 인벤토리 트리거 버튼 (박스 애셋 자리) */}
        <button
          onClick={() => setShowInventory(true)}
          className="relative w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          aria-label="감정 보관함"
        >
          {/* 박스 플레이스홀더 SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="16" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 10h16" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 10v2h4v-2" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          {/* 새 폭탄 알림 점 */}
          {newBombEmotions.length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full" />
          )}
        </button>
      </div>

      {/* 인벤토리 오버레이 */}
      <AnimatePresence>
        {showInventory && (
          <BombInventory bombs={bombs} onClose={() => setShowInventory(false)} />
        )}
      </AnimatePresence>

      {isShowingResult ? (
        /* 결과 코멘트 — 전체 영역 */
        <div className="flex-1 flex items-center justify-center px-4 pb-4">
          <CommentOverlay comment={aiComment} onDone={handleResultDone} />
        </div>
      ) : (
        <>
          {/* 상단: NPC 대사 영역 — 하단 정렬, AnimatePresence 없이 즉시 전환 */}
          <div className="flex-1 flex flex-col justify-end px-4 pb-3 overflow-y-auto">
            {/* NPC 첫 대사 — 타이핑 (탭으로 넘김) */}
            {eventPhase === 'npcDialogue' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogueBox
                  npcId={event.npc}
                  text={filledDialogue}
                  locale={locale}
                  innerThought={filledInnerThought}
                  onComplete={handleDialogueComplete}
                />
              </motion.div>
            )}

            {/* 1차 입력 중 / NPC 반응 로딩 중 — 첫 대사 정적 표시 */}
            {(eventPhase === 'playerInput1' || eventPhase === 'loadingNpcReaction') && (
              <>
                <StaticDialogue npcId={event.npc} text={filledDialogue} locale={locale} />
                {filledInnerThought && (
                  <p className="text-white/30 text-xs italic text-center mt-3">
                    {filledInnerThought[locale]}
                  </p>
                )}
              </>
            )}

            {/* NPC 리액션 대사 — 타이핑 (탭으로 넘김) */}
            {eventPhase === 'npcFollowUp' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogueBox
                  npcId={event.npc}
                  text={followUpText}
                  locale={locale}
                  onComplete={handleFollowUpComplete}
                />
              </motion.div>
            )}

            {/* 2차 입력 중 / AI 분석 중 — 리액션 대사 정적 표시 */}
            {(eventPhase === 'playerInput2' || eventPhase === 'aiAnalyzing') && (
              <StaticDialogue npcId={event.npc} text={followUpText} locale={locale} />
            )}
          </div>

          {/* 하단: 입력 / 로딩 영역 — 고정 높이 + absolute 자식으로 완전 안정화 */}
          <div className="relative h-[72px] shrink-0 border-t border-white/5">
            <AnimatePresence mode="wait">
              {eventPhase === 'playerInput1' && (
                <motion.div
                  key="input1"
                  className="absolute inset-0 flex items-center px-4"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlayerInput onSubmit={handleInput1} />
                </motion.div>
              )}

              {eventPhase === 'loadingNpcReaction' && (
                <motion.div
                  key="loadingNpc"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingDots />
                </motion.div>
              )}

              {eventPhase === 'playerInput2' && (
                <motion.div
                  key="input2"
                  className="absolute inset-0 flex items-center px-4"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlayerInput onSubmit={handleInput2} />
                </motion.div>
              )}

              {eventPhase === 'aiAnalyzing' && isLoading && (
                <motion.div
                  key="loadingAI"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
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
