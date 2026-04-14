'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import { days } from '@/data/events';
import { LocaleText } from '@/types/game';
import DialogueBox from './DialogueBox';
import PlayerInput from './PlayerInput';
import BombDisplay from './BombDisplay';
import CommentOverlay from './CommentOverlay';
import { analyzeEmotion } from '@/lib/ai';

function LoadingDots() {
  return (
    <div className="flex gap-1 justify-center py-8">
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

export default function DayScreen() {
  const {
    currentDay,
    currentEventIndex,
    eventPhase,
    locale,
    playerName,
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
  // Claude가 생성한 NPC 반응 대사 (1차 입력 기반)
  const [generatedFollowUp, setGeneratedFollowUp] = useState<LocaleText | null>(null);

  const dayData = days[currentDay];
  const event = dayData.events[currentEventIndex];
  const isSystem = event.npc === 'system';

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
          playerName,
          locale,
        }),
      });
      const data = await res.json();
      // 양쪽 locale 모두 같은 생성 텍스트로 — 이미 locale에 맞게 생성됨
      setGeneratedFollowUp({ ko: data.dialogue, en: data.dialogue });
    } catch {
      // 폴백: 기획서 원본 대사 사용
      setGeneratedFollowUp(event.followUpDialogue);
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
        playerName,
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

  const followUpText = generatedFollowUp ?? event.followUpDialogue;

  return (
    <div className="flex flex-col h-full">
      {/* Day 헤더 */}
      <div className="py-3 px-4 border-b border-white/10">
        <span className="text-white/40 text-xs tracking-widest">
          {t('game.day', { day: String(currentDay + 1) })}
        </span>
      </div>

      {/* 폭탄 표시 */}
      <div className="px-4 py-2">
        <BombDisplay bombs={bombs} locale={locale} newBombCount={newBombCount} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col justify-end px-4 pb-4 gap-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {eventPhase === 'npcDialogue' && (
            <motion.div key="dialogue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogueBox
                npcId={event.npc}
                text={event.dialogue}
                locale={locale}
                innerThought={event.innerThought}
                onComplete={handleDialogueComplete}
              />
            </motion.div>
          )}

          {eventPhase === 'playerInput1' && (
            <motion.div key="input1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayerInput onSubmit={handleInput1} />
            </motion.div>
          )}

          {/* NPC 반응 생성 중 로딩 */}
          {eventPhase === 'loadingNpcReaction' && (
            <motion.div key="loadingNpc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingDots />
            </motion.div>
          )}

          {/* Claude가 생성한 NPC 반응 대사 */}
          {eventPhase === 'npcFollowUp' && (
            <motion.div key="followup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogueBox
                npcId={event.npc}
                text={followUpText}
                locale={locale}
                onComplete={handleFollowUpComplete}
              />
            </motion.div>
          )}

          {eventPhase === 'playerInput2' && (
            <motion.div key="input2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayerInput onSubmit={handleInput2} />
            </motion.div>
          )}

          {eventPhase === 'aiAnalyzing' && isLoading && (
            <motion.div key="loadingAI" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingDots />
            </motion.div>
          )}

          {eventPhase === 'showResult' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CommentOverlay comment={aiComment} onDone={handleResultDone} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
