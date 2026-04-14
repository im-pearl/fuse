'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import { days } from '@/data/events';
import DialogueBox from './DialogueBox';
import PlayerInput from './PlayerInput';
import BombDisplay from './BombDisplay';
import CommentOverlay from './CommentOverlay';
import { analyzeEmotion } from '@/lib/ai';

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

  const dayData = days[currentDay];
  const event = dayData.events[currentEventIndex];
  const isSystem = event.npc === 'system';

  const handleDialogueComplete = () => {
    if (isSystem) {
      // 시스템 이벤트는 입력 없이 바로 다음으로
      advanceEvent();
      return;
    }
    setEventPhase('playerInput1');
  };

  const handleInput1 = (text: string) => {
    setPlayerInput1(text);
    setEventPhase('npcFollowUp');
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
        npcFollowUp: event.followUpDialogue[locale],
        playerInput1,
        playerInput2: text,
        playerName,
        locale,
      });
      setNewBombCount(result.emotions.length);
      applyAIResult(result.emotions, result.comment);
    } catch {
      // 폴백: 랜덤 감정 적용
      applyAIResult(
        [{ emotion: 'burden', amount: 20 }],
        locale === 'ko' ? '말하지 못한 마음이 조금 더 무거워졌습니다.' : 'The words left unsaid grew a little heavier.'
      );
      setNewBombCount(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultDone = () => {
    setNewBombCount(0);
    advanceEvent();
  };

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
          {/* NPC 첫 번째 대사 */}
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

          {/* 유저 1차 입력 */}
          {eventPhase === 'playerInput1' && (
            <motion.div key="input1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayerInput onSubmit={handleInput1} />
            </motion.div>
          )}

          {/* NPC 재압박 */}
          {eventPhase === 'npcFollowUp' && (
            <motion.div key="followup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogueBox
                npcId={event.npc}
                text={event.followUpDialogue}
                locale={locale}
                onComplete={handleFollowUpComplete}
              />
            </motion.div>
          )}

          {/* 유저 2차 입력 */}
          {eventPhase === 'playerInput2' && (
            <motion.div key="input2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayerInput onSubmit={handleInput2} />
            </motion.div>
          )}

          {/* AI 분석 중 */}
          {eventPhase === 'aiAnalyzing' && isLoading && (
            <motion.div
              key="loading"
              className="flex items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* 결과 표시 */}
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
