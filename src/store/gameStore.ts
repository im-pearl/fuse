import { create } from 'zustand';
import {
  EmotionState,
  EmotionType,
  GamePhase,
  Locale,
  Bomb,
  EmotionDelta,
  EventPhase,
} from '@/types/game';
import { checkExplosion, applyEmotionDeltas } from '@/lib/emotions';
import { days } from '@/data/events';

interface ExplosionInfo {
  type: 'single' | 'compound';
  emotion?: EmotionType;
}

interface GameState {
  // 기본
  locale: Locale;
  phase: GamePhase;
  playerName: string;

  // 진행
  currentDay: number;
  currentEventIndex: number;
  eventPhase: EventPhase;

  // 감정 (숨겨진 게이지)
  emotions: EmotionState;
  bombs: Bomb[];
  explosionInfo: ExplosionInfo | null;

  // 유저 입력 임시 저장
  playerInput1: string;
  playerInput2: string;
  aiComment: string;

  // 액션
  setLocale: (locale: Locale) => void;
  setPlayerName: (name: string) => void;
  setPhase: (phase: GamePhase) => void;
  setEventPhase: (phase: EventPhase) => void;
  setPlayerInput1: (input: string) => void;
  setPlayerInput2: (input: string) => void;
  applyAIResult: (deltas: EmotionDelta[], comment: string) => void;
  advanceEvent: () => void;
  reset: () => void;
}

const initialEmotions: EmotionState = {
  anxiety: 0,
  burden: 0,
  injustice: 0,
  helplessness: 0,
  selfBlame: 0,
  anger: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  locale: 'ko',
  phase: 'language',
  playerName: '',

  currentDay: 0,
  currentEventIndex: 0,
  eventPhase: 'npcDialogue',

  emotions: { ...initialEmotions },
  bombs: [],
  explosionInfo: null,

  playerInput1: '',
  playerInput2: '',
  aiComment: '',

  setLocale: (locale) => set({ locale }),
  setPlayerName: (name) => set({ playerName: name }),
  setPhase: (phase) => set({ phase }),
  setEventPhase: (phase) => set({ eventPhase: phase }),
  setPlayerInput1: (input) => set({ playerInput1: input }),
  setPlayerInput2: (input) => set({ playerInput2: input }),

  applyAIResult: (deltas, comment) => {
    const state = get();
    const newEmotions = applyEmotionDeltas(state.emotions, deltas);
    const newBombs = [
      ...state.bombs,
      ...deltas.map((d) => ({ emotion: d.emotion, acquiredAt: `d${state.currentDay + 1}e${state.currentEventIndex + 1}` })),
    ];

    const explosion = checkExplosion(newEmotions);

    set({
      emotions: newEmotions,
      bombs: newBombs,
      aiComment: comment,
      eventPhase: 'showResult',
      explosionInfo: explosion.exploded ? { type: explosion.type, emotion: explosion.emotion } : null,
    });
  },

  advanceEvent: () => {
    const state = get();

    // 폭발 체크
    if (state.explosionInfo) {
      set({ phase: 'gameOver' });
      return;
    }

    const dayData = days[state.currentDay];
    const nextEventIndex = state.currentEventIndex + 1;

    if (nextEventIndex < dayData.events.length) {
      // 같은 Day 내 다음 이벤트
      set({
        currentEventIndex: nextEventIndex,
        eventPhase: 'npcDialogue',
        playerInput1: '',
        playerInput2: '',
        aiComment: '',
      });
    } else {
      // 다음 Day로
      const nextDay = state.currentDay + 1;
      if (nextDay < days.length) {
        set({
          currentDay: nextDay,
          currentEventIndex: 0,
          eventPhase: 'npcDialogue',
          playerInput1: '',
          playerInput2: '',
          aiComment: '',
        });
      } else {
        // 모든 Day 완료 → 엔딩
        set({ phase: 'ending' });
      }
    }
  },

  reset: () =>
    set({
      phase: 'language',
      playerName: '',
      currentDay: 0,
      currentEventIndex: 0,
      eventPhase: 'npcDialogue',
      emotions: { ...initialEmotions },
      bombs: [],
      explosionInfo: null,
      playerInput1: '',
      playerInput2: '',
      aiComment: '',
    }),
}));
