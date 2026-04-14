import { EmotionState, EmotionType, EmotionDelta } from '@/types/game';

export function applyEmotionDeltas(
  state: EmotionState,
  deltas: EmotionDelta[]
): EmotionState {
  const newState = { ...state };
  for (const delta of deltas) {
    newState[delta.emotion] = Math.min(100, newState[delta.emotion] + delta.amount);
  }
  return newState;
}

interface ExplosionResult {
  exploded: boolean;
  type: 'single' | 'compound';
  emotion?: EmotionType;
}

export function checkExplosion(state: EmotionState): ExplosionResult {
  // 조건1: 단일 감정 100 도달
  const emotionKeys: EmotionType[] = [
    'anxiety',
    'burden',
    'injustice',
    'helplessness',
    'selfBlame',
    'anger',
  ];

  for (const key of emotionKeys) {
    if (state[key] >= 100) {
      return { exploded: true, type: 'single', emotion: key };
    }
  }

  // 조건2: 전체 합산 400 이상
  const total = emotionKeys.reduce((sum, key) => sum + state[key], 0);
  if (total >= 400) {
    return { exploded: true, type: 'compound' };
  }

  return { exploded: false, type: 'single' };
}

export function getTotalEmotionScore(state: EmotionState): number {
  return Object.values(state).reduce((sum, v) => sum + v, 0);
}
