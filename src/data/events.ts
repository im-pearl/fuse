import { DayData } from '@/types/game';

export const days: DayData[] = [
  {
    day: 1,
    events: [
      {
        id: 'd1e1',
        npc: 'parkDirector',
        dialogue: {
          ko: '주말에 보낸 메일 봤지? 급한 건 아닌데 오늘 중으로 되지?',
          en: "Did you see the email I sent over the weekend? It's not urgent, but can you get it done by today?",
        },
        followUpDialogue: {
          ko: '아 그리고 이거 다른 팀에도 공유해야 하니까 깔끔하게 해줘. 대충 하지 말고.',
          en: "Oh, and this needs to be shared with other teams too, so make it clean. Don't half-ass it.",
        },
      },
      {
        id: 'd1e2',
        npc: 'leeManager',
        dialogue: {
          ko: '이거 {surname}대리 담당이잖아. 기한을 놓치면 어떻게 해?',
          en: "This is your responsibility, {surname}. How could you miss the deadline?",
        },
        innerThought: {
          ko: '그거 과장님이 하기로 했었잖아요...',
          en: "But you said you'd handle that...",
        },
        followUpDialogue: {
          ko: '핑계 대지 말고. 어쨌든 결과가 중요한 거잖아.',
          en: "Don't make excuses. Results are what matter.",
        },
      },
      {
        id: 'd1e3',
        npc: 'kimAssociate',
        dialogue: {
          ko: '너 안색이 왜 그래? 요새 야근하더니 확 늙은 것 같아.',
          en: "Why do you look like that? You've aged so much from all the overtime lately.",
        },
        followUpDialogue: {
          ko: '아 진짜 걱정돼서 하는 말이야. 좀 쉬어. 근데 쉴 수 있어? ㅋㅋ',
          en: "I'm saying this because I'm worried. Take a break. But can you even? lol",
        },
      },
      {
        id: 'd1e4',
        npc: 'system',
        dialogue: {
          ko: '[야근 확정]',
          en: '[Overtime confirmed]',
        },
        followUpDialogue: {
          ko: '',
          en: '',
        },
      },
    ],
  },
  {
    day: 2,
    events: [
      {
        id: 'd2e1',
        npc: 'leeManager',
        dialogue: {
          ko: '내가 이거 언제 이렇게 하라고 했어?',
          en: 'When did I tell you to do it this way?',
        },
        innerThought: {
          ko: '과장님이 그렇게 하라고 했잖아요...',
          en: 'You literally told me to do it this way...',
        },
        followUpDialogue: {
          ko: '다시 해와. 이번엔 내가 말한 대로.',
          en: 'Redo it. This time, the way I told you.',
        },
      },
      {
        id: 'd2e3',
        npc: 'parkDirector',
        dialogue: {
          ko: '김대리 요즘 아이디어가 반짝반짝한데?',
          en: "Kim's ideas have been sparkling lately, don't you think?",
        },
        innerThought: {
          ko: '그거 내 아이디어인데...',
          en: 'That was my idea...',
        },
        followUpDialogue: {
          ko: '{surname}대리도 좀 본받아. 적극적으로 해봐.',
          en: 'You should learn from her, {surname}. Be more proactive.',
        },
      },
      {
        id: 'd2e4',
        npc: 'kimAssociate',
        dialogue: {
          ko: '{firstname}{particle}. 이거 좀 해줄 수 있어? 나 오늘 진짜 급한 일 있어서 그래. 제발~',
          en: "Hey {firstname}, can you do this for me? I really have something urgent today. Please~",
        },
        followUpDialogue: {
          ko: '고마워~ 역시 넌 착해. 나중에 밥 살게! (안 삼)',
          en: "Thanks~ You're so nice. I'll buy you food later! (won't)",
        },
      },
      {
        id: 'd2e4b',
        npc: 'parkDirector',
        dialogue: {
          ko: '{surname}대리는 결혼 안 해?',
          en: "Aren't you getting married, {surname}?",
        },
        followUpDialogue: {
          ko: '요즘 젊은 애들은 왜 결혼을 안 하려고 하는지 모르겠어. 나 때는 다 했는데.',
          en: "I don't get why young people don't want to get married these days. Everyone did in my time.",
        },
      },
      {
        id: 'd2e5',
        npc: 'system',
        dialogue: {
          ko: '[또 야근 확정]',
          en: '[Overtime confirmed again]',
        },
        followUpDialogue: {
          ko: '',
          en: '',
        },
      },
    ],
  },
  {
    day: 3,
    events: [
      {
        id: 'd3e1',
        npc: 'parkDirector',
        dialogue: {
          ko: '{surname}대리 좀 웃고 다녀. 회사 분위기가 우중충해.',
          en: "Smile more, {surname}. You're bringing down the office mood.",
        },
        followUpDialogue: {
          ko: '요즘 젊은 애들은 멘탈이 왜 이렇게 약해. 나 때는 이 정도는 아무것도 아니었는데.',
          en: "Young people these days are so fragile. This was nothing back in my day.",
        },
      },
      {
        id: 'd3e2',
        npc: 'leeManager',
        dialogue: {
          ko: '{surname}대리. 요즘 왜 그래? 나는 {surname}대리가 안 그런 사람인 거 알지만 자꾸 그러면 뒤에서 말 나와.',
          en: "What's been going on with you, {surname}? I know you're not usually like this, but people are starting to talk.",
        },
        followUpDialogue: {
          ko: '내가 걱정돼서 하는 말이야. 조심해.',
          en: "I'm telling you this because I'm worried. Be careful.",
        },
      },
      {
        id: 'd3e3',
        npc: 'kimAssociate',
        dialogue: {
          ko: '최대리 이번에 승진한대. 짜증나. 너는 그렇다 치고 나는 도대체 왜 누락이야?',
          en: "Choi got promoted this time. So annoying. You I get, but why was I passed over?",
        },
        followUpDialogue: {
          ko: '아 미안 그런 뜻은 아니고... 그냥 나도 억울해서. 너도 억울하지 않아?',
          en: "Oh sorry, I didn't mean it like that... I'm just frustrated too. Aren't you?",
        },
      },
    ],
  },
];
