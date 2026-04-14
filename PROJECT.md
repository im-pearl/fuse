# FUSE — 프로젝트 문서

> "별거 아닌 일들이 감정 폭탄이 되어 굴러온다. AI가 당신의 대응을 지켜보고 있다."

---

## 게임 개요

**장르**: 픽셀아트 텍스트 어드벤처 / 심리 시뮬레이션  
**플랫폼**: 웹 (모바일 우선)  
**플레이타임**: 약 5분  
**언어**: 한국어 / 영어 선택

### 핵심 메타포 — 비격진천뢰

1592년 임진왜란 당시 사용된 조선의 시한폭탄. 겉으로는 그냥 쇠공처럼 보여서 왜군이 구경하다 당했다는 일화에서 출발.

- 보이지 않는 위험 → 숨겨진 감정 게이지
- 시간차 폭발 → 감정 누적 후 임계점 도달
- 외부의 과소평가 ("괜찮아 보이네") → 아무도 모르는 내면
- 터짐 → 감정 폭발

### 게임 구조

```
언어 선택 → 이름 입력 → 프롤로그 → [Day 1 → Day 2 → Day 3] → 게임오버 → 엔딩
```

Day마다 NPC 이벤트가 순서대로 발생. 각 이벤트마다 플레이어가 두 번 반응하고, Claude가 감정 상태를 판정한다.

---

## 캐릭터

### 플레이어
- 3년차 직장인 여성. 시작 시 성(姓)과 이름 각각 입력받음.
- NPC들은 성으로 "김대리", 이름으로 "영순아~" 식으로 부름
- Korean particle 자동 판별: 받침 있으면 "아", 없으면 "야" (`src/lib/nameUtils.ts`)

### NPC 3인방

| ID | 이름 | 나이 | 성격 |
|---|---|---|---|
| `parkDirector` | 박이사 | 58 | 임원. "나 때는" 세대. 무심코 상처주는 말. 외모/컨디션 지적 |
| `leeManager` | 이과장 | 45 | 중간관리자. 위에서 눌려서 아래로 누름. 공은 가져가고 책임은 넘김 |
| `kimAssociate` | 김대리 | 32 | 동료. 친한 척하지만 비교하고 간섭. 뒷얘기 잘 퍼뜨림 |

---

## 핵심 시스템

### 감정 게이지 (플레이어에게 절대 안 보임)

6종 감정, 각각 0~100. **수치는 화면에 표시하지 않음.**

```
anxiety      불안
burden       부담감
injustice    억울함
helplessness 무력감
selfBlame    자괴감
anger        분노
```

**폭발 조건** (둘 중 하나):
1. 단일 감정 100 도달 → 해당 감정 폭발
2. 전체 합산 400 이상 → 복합 폭발

**핵심**: 어떤 대응도 감정을 줄이지 않음. 증가량만 다름.

| 대응 패턴 | 주요 감정 | 증가량 |
|---|---|---|
| 순응/사과 | 억울함, 자괴감 | +20~30 |
| 반박/대응 | 분노, 불안 | +15~25 |
| 회피/무시 | 무력감 | +20~30 |
| 유머/넘김 | 자괴감 | +10~15 |
| 과잉긍정 | 자괴감, 무력감 | +25~35 |
| 공격/욕설 | 분노 | +35~50 |

### 감정 폭탄 수집

이벤트마다 감정 종류의 비격진천뢰가 생겨 슬롯에 쌓임.  
16개 고정 슬롯(빈 원 → 💣 채워짐). 폭발 조건 도달 시 게임오버.

### 이벤트 플로우 (이벤트당)

```
NPC 첫 번째 대사 (정적 텍스트)
  → 플레이어 1차 입력
  → Claude가 플레이어 답변에 반응하는 NPC 대사 생성 (/api/npc)
  → 플레이어 2차 입력
  → Claude가 두 입력을 종합해 감정 분석 + 나레이터 코멘트 생성 (/api/ai)
  → 코멘트 표시 → 폭발 체크 → 다음 이벤트
```

---

## 이벤트 목록

### Day 1
| ID | NPC | 첫 대사 요약 |
|---|---|---|
| d1e1 | 박이사 | 주말 메일 — 급한 건 아닌데 오늘 중으로 |
| d1e2 | 이과장 | {surname}대리 담당이잖아. 기한을 놓치면? (속마음: 과장님이 하기로 했는데) |
| d1e3 | 김대리 | 안색이 왜 그래? 확 늙은 것 같아 |
| d1e4 | 시스템 | [야근 확정] |

### Day 2
| ID | NPC | 첫 대사 요약 |
|---|---|---|
| d2e1 | 이과장 | 내가 이걸 언제 이렇게 하라고 했어? (속마음: 과장님이 그랬잖아요) |
| d2e3 | 박이사 | 김대리 아이디어 반짝반짝 (속마음: 내 아이디어인데) |
| d2e4 | 김대리 | {firstname}{particle}, 이거 좀 해줄 수 있어? |
| d2e4b | 박이사 | {surname}대리는 결혼 안 해? |
| d2e5 | 시스템 | [또 야근 확정] |

### Day 3
| ID | NPC | 첫 대사 요약 |
|---|---|---|
| d3e1 | 박이사 | {surname}대리 좀 웃고 다녀 |
| d3e2 | 이과장 | 요즘 왜 그래? 뒤에서 말 나와 |
| d3e3 | 김대리 | 최대리 승진한대. 너는 그렇다 치고 나는 왜? |

---

## AI 에이전트 구조

### /api/npc — NPC 반응 생성

플레이어 1차 입력을 받아 NPC 캐릭터가 그에 반응하는 대사를 생성.

**입력**: `npcId`, `originalDialogue`, `playerInput1`, `playerSurname`, `playerFirstName`, `locale`  
**출력**: `{ dialogue: string }`  
**모델**: `claude-sonnet-4-6`, max_tokens: 150

### /api/ai — 감정 분석 + 나레이터 코멘트

플레이어의 1차+2차 입력을 종합해 감정 패턴 판정 및 코멘트 생성.

**입력**: `npcDialogue`, `npcFollowUp`, `playerInput1`, `playerInput2`, `playerSurname`, `playerFirstName`, `locale`  
**출력**: `{ pattern, emotions: [{emotion, amount}], comment }`  
**모델**: `claude-sonnet-4-6`, max_tokens: 300

**나레이터 코멘트 톤**: 판단 없음, 담담하고 따뜻함, 2인칭("당신은"), 15~40자, 감정 직접 명명 금지

---

## 게임 단계 (GamePhase)

| phase | 화면 | 파일 |
|---|---|---|
| `language` | 언어 선택 (한국어/English) | `LanguageSelect.tsx` |
| `name` | 성 + 이름 입력 | `NameInput.tsx` |
| `prologue` | 1592년 경주 인트로 텍스트 | `Prologue.tsx` |
| `day` | 메인 게임 루프 | `DayScreen.tsx` |
| `gameOver` | 폭탄 진동 → 폭발 연출 | `GameOver.tsx` |
| `ending` | 나레이션 순차 표시 → 재시작 | `Ending.tsx` |

---

## 디렉토리 구조

```
src/
├── app/
│   ├── api/
│   │   ├── ai/route.ts          감정 분석 + 코멘트 (Claude)
│   │   └── npc/route.ts         NPC 반응 대사 생성 (Claude)
│   ├── globals.css
│   ├── layout.tsx               모바일 비율 컨테이너 (max-w-430px, bg #14121a)
│   └── page.tsx                 GamePhase별 화면 스위치
│
├── components/
│   ├── game/
│   │   ├── BombDisplay.tsx      16슬롯 고정 폭탄 표시 (빈 원 → 💣)
│   │   ├── CommentOverlay.tsx   AI 나레이터 코멘트 오버레이
│   │   ├── DayScreen.tsx        메인 게임 루프 (이벤트 플로우 오케스트레이터)
│   │   ├── DialogueBox.tsx      NPC 대사 (타이핑 효과, 속마음 표시)
│   │   ├── Ending.tsx           엔딩 나레이션 순차 출력
│   │   ├── GameOver.tsx         폭탄 진동 → 폭발 → 페이드아웃
│   │   ├── PlayerInput.tsx      텍스트 입력 (중복 제출 방지: useRef guard + type=button)
│   │   └── Prologue.tsx         인트로 텍스트 순차 출력
│   └── ui/
│       ├── LanguageSelect.tsx   한국어/English 선택
│       └── NameInput.tsx        성(姓) + 이름 두 필드
│
├── data/
│   ├── events.ts                Day 1~3 이벤트 시퀀스 데이터
│   │                            플레이스홀더: {surname}, {firstname}, {particle}
│   └── npcs.ts                  NPC 프로필 (이름, 역할, 대사 색상)
│
├── i18n/
│   ├── ko.json                  한국어 UI 텍스트
│   ├── en.json                  영어 UI 텍스트
│   └── useTranslation.ts        locale 기반 번역 훅 (next-intl 미사용, 직접 구현)
│
├── lib/
│   ├── ai.ts                    /api/ai fetch 클라이언트 유틸
│   ├── emotions.ts              applyEmotionDeltas(), checkExplosion()
│   └── nameUtils.ts             fillNamePlaceholders(), getKoreanParticle() (아/야 판별)
│
├── store/
│   └── gameStore.ts             Zustand 스토어
│                                상태: locale, phase, playerSurname, playerFirstName,
│                                      currentDay, currentEventIndex, eventPhase,
│                                      emotions(숨김), bombs, explosionInfo,
│                                      playerInput1, playerInput2, aiComment
│
└── types/
    └── game.ts                  전체 타입 정의
                                 EmotionType, GamePhase, EventPhase, ResponsePattern,
                                 NpcId, Locale, GameEvent, Bomb, AIAnalysisResult 등
```

---

## 기술 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js 16.2.3 (App Router, React 19) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion |
| 상태관리 | Zustand v5 |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) |
| 배포 예정 | Vercel |

---

## 로컬 실행

```bash
# .env 파일에 API 키 설정
ANTHROPIC_API_KEY=sk-ant-...

npm install
npm run dev
# → http://localhost:3000
```

개발 중 이벤트마다 터미널에 판정 결과 출력됨:
```
[FUSE] ── NPC 반응 생성 ───────────────────
  NPC:      이과장
  원래 대사: "..."
  플레이어:  "..."
  생성 반응: "..."

[FUSE] ── 감정 판정 결과 ──────────────────
  패턴:     comply
  감정 증가:
    injustice      +25
    selfBlame      +22
  코멘트:   "괜찮다고 했지만, 괜찮지 않다는 걸 알고 있습니다."
```

---

## 레이아웃 규칙

- 항상 세로(portrait) 모바일 비율
- 데스크톱에서도 `max-w-[430px]` 센터 정렬
- 바깥 배경: `#000000` (순수 검정)
- 게임 컨테이너: `#14121a` (짙은 보라빛 다크)
- 가로 레이아웃 대응 불필요

---

## 미완성 / 추후 작업

- [ ] 픽셀아트 에셋 (폰트, NPC 초상화, 폭탄 아이콘, 폭발 애니메이션) → `ASSETS.md` 참고
- [ ] BGM + 효과음
- [ ] 엔딩 비격진천뢰 → 배스밤 변환 애니메이션
- [ ] 프롤로그 씬 (현재는 텍스트만)
- [ ] Vercel 배포 설정
