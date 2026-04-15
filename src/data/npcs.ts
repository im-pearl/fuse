import { NpcId, LocaleText } from '@/types/game';

export interface NpcProfile {
  id: NpcId;
  name: LocaleText;
  role: LocaleText;
  age: number;
  color: string;
  imageName: string;           // public/assets/{imageName}.png
  position: 'left' | 'right'; // 화면 어느 쪽에 표시할지
}

export const npcs: Record<NpcId, NpcProfile> = {
  parkDirector: {
    id: 'parkDirector',
    name: { ko: '박이사', en: 'Director Park' },
    role: { ko: '임원, 58세', en: 'Executive, 58' },
    age: 58,
    color: '#c0392b',
    imageName: 'npc-park',
    position: 'right',
  },
  leeManager: {
    id: 'leeManager',
    name: { ko: '이과장', en: 'Manager Lee' },
    role: { ko: '중간관리자, 45세', en: 'Middle Manager, 45' },
    age: 45,
    color: '#2980b9',
    imageName: 'npc-lee',
    position: 'left',
  },
  kimAssociate: {
    id: 'kimAssociate',
    name: { ko: '김대리', en: 'Kim' },
    role: { ko: '동료, 32세', en: 'Colleague, 32' },
    age: 32,
    color: '#27ae60',
    imageName: 'npc-kim',
    position: 'left',
  },
};
