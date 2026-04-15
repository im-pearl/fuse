export type EmotionType =
  | 'anxiety'
  | 'burden'
  | 'injustice'
  | 'helplessness'
  | 'selfBlame'
  | 'anger';

export type GamePhase =
  | 'language'
  | 'name'
  | 'prologue'
  | 'day'
  | 'gameOver'
  | 'ending';

export type ResponsePattern =
  | 'comply'
  | 'resist'
  | 'avoid'
  | 'humor'
  | 'overPositive'
  | 'aggressive';

export type NpcId = 'parkDirector' | 'leeManager' | 'kimAssociate';

export type Locale = 'ko' | 'en';

export interface LocaleText {
  ko: string;
  en: string;
}

export interface EmotionState {
  anxiety: number;
  burden: number;
  injustice: number;
  helplessness: number;
  selfBlame: number;
  anger: number;
}

export interface GameEvent {
  id: string;
  npc: NpcId;
  dialogue: LocaleText;
  innerThought?: LocaleText;
  followUpDialogue: LocaleText;
}

export interface DayData {
  day: number;
  events: GameEvent[];
}

export interface Bomb {
  emotion: EmotionType;
  acquiredAt: string;
}

export interface EmotionDelta {
  emotion: EmotionType;
  amount: number;
}

export interface AIAnalysisResult {
  pattern: ResponsePattern;
  emotions: EmotionDelta[];
  comment: string;
}

export type EventPhase =
  | 'npcDialogue'
  | 'playerInput1'
  | 'loadingNpcReaction'
  | 'npcFollowUp'
  | 'playerInput2'
  | 'aiAnalyzing'
  | 'showResult'
  | 'transition';
