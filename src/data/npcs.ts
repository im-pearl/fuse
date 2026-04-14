import { NpcId, LocaleText } from '@/types/game';

export interface NpcProfile {
  id: NpcId;
  name: LocaleText;
  role: LocaleText;
  age: number;
  color: string; // 대사 표시 시 이름 색상
}

export const npcs: Record<NpcId, NpcProfile> = {
  parkDirector: {
    id: 'parkDirector',
    name: { ko: '박이사', en: 'Director Park' },
    role: { ko: '임원, 58세', en: 'Executive, 58' },
    age: 58,
    color: '#c0392b',
  },
  leeManager: {
    id: 'leeManager',
    name: { ko: '이과장', en: 'Manager Lee' },
    role: { ko: '중간관리자, 45세', en: 'Middle Manager, 45' },
    age: 45,
    color: '#2980b9',
  },
  kimAssociate: {
    id: 'kimAssociate',
    name: { ko: '김대리', en: 'Kim' },
    role: { ko: '동료, 32세', en: 'Colleague, 32' },
    age: 32,
    color: '#27ae60',
  },
  system: {
    id: 'system',
    name: { ko: '시스템', en: 'System' },
    role: { ko: '', en: '' },
    age: 0,
    color: '#7f8c8d',
  },
};
