'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import { days } from '@/data/events';
import { LocaleText, NpcId, Locale } from '@/types/game';
import { fillNamePlaceholders } from '@/lib/nameUtils';
import { npcs } from '@/data/npcs';
import DialogueBox from './DialogueBox';
import PlayerInput from './PlayerInput';
import BombDisplay from './BombDisplay';
import CommentOverlay from './CommentOverlay';
import { analyzeEmotion } from '@/lib/ai';

function LoadingDots() {
  return (
    <div className="flex gap-1 justify-center py-6">
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
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-white/70 text-sm leading-relaxed">{text[locale]}</p>
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
  const [newBombCount, setNewBombCount] = useState(0);
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
      setNewBombCount(result.emotions.length);
      applyAIResult(result.emotions, result.comment);
    } catch {
      applyAIResult(
        [{ emotion: 'burden', amount: 20 }],
        locale === 'ko'
          ? '말하지 못한 마음이 조금 더 무거워졌습니다.'
          : 'The words left unsaid grew a little heavier.'
      );
      setNewBombCount(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultDone = () => {
    setNewBombCount(0);
    setGeneratedFollowUp(null);
    advanceEvent();
  };

  const filledDialogue = fillText(event.dialogue);
  const filledInnerThought = event.innerThought ? fillText(event.innerThought) : undefined;
  const followUpText = generatedFollowUp ?? fillText(event.followUpDialogue);

  // 결과 오버레이는 전체 영역 사용
  const isShowingResult = eventPhase === 'showResult';

  return (
    <div className="flex flex-col h-full">
      {/* Day 헤더 */}
      <div className="py-3 px-4 border-b border-white/10 shrink-0">
        <span className="text-white/40 text-xs tracking-widest">
          {t('game.day', { day: String(currentDay + 1) })}
        </span>
      </div>

      {/* 폭탄 슬롯 */}
      <div className="px-4 py-2 shrink-0">
        <BombDisplay bombs={bombs} locale={locale} newBombCount={newBombCount} />
      </div>

      {isShowingResult ? (
        /* 결과 코멘트 — 전체 영역 */
        <div className="flex-1 flex items-center justify-center px-4 pb-4">
          <CommentOverlay comment={aiComment} onDone={handleResultDone} />
        </div>
      ) : (
        <>
          {/* 상단: NPC 대사 영역 (항상 표시) */}
          <div className="flex-1 px-4 pt-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* NPC 첫 대사 — 타이핑 (탭으로 넘김) */}
              {eventPhase === 'npcDialogue' && (
                <motion.div
                  key="npcDialogue"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
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
                <motion.div
                  key="staticDialogue1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <StaticDialogue npcId={event.npc} text={filledDialogue} locale={locale} />
                  {filledInnerThought && (
                    <p className="text-white/30 text-xs italic text-center mt-3">
                      {filledInnerThought[locale]}
                    </p>
                  )}
                </motion.div>
              )}

              {/* NPC 리액션 대사 — 타이핑 (탭으로 넘김) */}
              {eventPhase === 'npcFollowUp' && (
                <motion.div
                  key="npcFollowUp"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
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
                <motion.div
                  key="staticDialogue2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <StaticDialogue npcId={event.npc} text={followUpText} locale={locale} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 하단: 입력 / 로딩 영역 */}
          <div className="px-4 pb-4 pt-3 shrink-0 border-t border-white/5">
            <AnimatePresence mode="wait">
              {eventPhase === 'playerInput1' && (
                <motion.div
                  key="input1"
                  initial={{ opacity: 0, y: 6 }}
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
                  initial={{ opacity: 0, y: 6 }}
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
