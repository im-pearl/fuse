# FUSE 에셋 목록

현재 게임은 이모지 + CSS만으로 동작하는 플레이스홀더 상태.
아래 에셋을 만들어 지정된 경로에 넣으면 실제 게임에 연결할 수 있다.

---

## 1. 폰트

| 파일명 | 경로 | 쓰이는 곳 | 비고 |
|---|---|---|---|
| `pixel-font.woff2` | `public/fonts/` | 전체 게임 텍스트 | 픽셀 계열 추천: DotGothic16, NeoDunggeunmo, Galmuri |

**연결 방법** — `src/app/globals.css`에서 `@font-face` 선언 후 `font-family` 교체.

---

## 2. NPC 초상화 (대화창 옆에 표시)

| 파일명 | 경로 | 쓰이는 곳 |
|---|---|---|
| `npc-park.png` | `public/assets/npcs/` | 박이사 대사 시 |
| `npc-lee.png` | `public/assets/npcs/` | 이과장 대사 시 |
| `npc-kim.png` | `public/assets/npcs/` | 김대리 대사 시 |

**스펙**: 64×64px 또는 96×96px 픽셀아트. 투명 배경 PNG.  
**연결 위치**: `src/components/game/DialogueBox.tsx` — NPC 이름 옆에 `<Image>` 태그 추가.  
**매핑**: `src/data/npcs.ts`에 `portrait` 필드 추가하면 됨.

---

## 3. 비격진천뢰 (폭탄 슬롯 아이콘)

| 파일명 | 경로 | 쓰이는 곳 |
|---|---|---|
| `bomb-filled.png` | `public/assets/` | 채워진 슬롯 (현재 💣 이모지) |
| `bomb-empty.png` | `public/assets/` | 빈 슬롯 (현재 흰 테두리 원) |

**스펙**: 24×24px 또는 32×32px 픽셀아트.  
**연결 위치**: `src/components/game/BombDisplay.tsx`  
현재 코드:
```tsx
// 채워진 슬롯
<span>💣</span>
// → 교체:
<Image src="/assets/bomb-filled.png" width={24} height={24} alt="" />

// 빈 슬롯
<div className="border border-white/10 rounded-full" />
// → 교체:
<Image src="/assets/bomb-empty.png" width={24} height={24} alt="" />
```

---

## 4. 게임오버 연출 — 비격진천뢰 흔들림 스프라이트

현재는 💣 이모지를 CSS로 흔들고 💥로 폭발. 픽셀아트로 교체 시:

| 파일명 | 경로 | 쓰이는 곳 |
|---|---|---|
| `bomb-shake.gif` 또는 `bomb-shake.png` (스프라이트시트) | `public/assets/` | 게임오버 진동 씬 |
| `bomb-explode.gif` 또는 `explosion.png` | `public/assets/` | 폭발 연출 |

**연결 위치**: `src/components/game/GameOver.tsx`  
`phase === 'shake'` 섹션과 `phase === 'explode'` 섹션 각각 교체.

---

## 5. 엔딩 — 비격진천뢰 → 배스밤 변환 애니메이션

기획서 원문: *"비격진천뢰 → 배스밤으로 천천히 변환"*

| 파일명 | 경로 | 쓰이는 곳 |
|---|---|---|
| `transform.gif` 또는 `transform.webp` | `public/assets/` | 엔딩 나레이션 직후 |
| `bathbomb.png` | `public/assets/` | 변환 완료 후 정지 이미지 |

**연결 위치**: `src/components/game/Ending.tsx`  
`isFinished` 상태 이후 (재시작 버튼 위쪽)에 `<Image>` 삽입.

---

## 6. 배경 / UI 텍스처 (선택)

| 파일명 | 경로 | 쓰이는 곳 | 비고 |
|---|---|---|---|
| `bg-game.png` | `public/assets/` | 게임 전체 배경 | 현재 단색 `#14121a` |
| `bg-title.png` | `public/assets/` | 언어선택 / 이름입력 화면 | 없으면 생략 가능 |
| `dialogue-box.png` | `public/assets/` | 대사창 테두리 | 현재 CSS border로 처리 중 |

---

## 7. 사운드

| 파일명 | 경로 | 쓰이는 곳 |
|---|---|---|
| `bgm-day.mp3` | `public/sounds/` | Day 1~3 게임 중 BGM |
| `bgm-ending.mp3` | `public/sounds/` | 엔딩 씬 BGM |
| `sfx-bomb-new.mp3` | `public/sounds/` | 새 폭탄 획득 시 |
| `sfx-bomb-shake.mp3` | `public/sounds/` | 게임오버 진동 |
| `sfx-explosion.mp3` | `public/sounds/` | 폭발 |
| `sfx-type.mp3` | `public/sounds/` | 대사 타이핑 효과음 (선택) |

**연결 방법**: 사운드 추가 시 `src/lib/sound.ts` 유틸 파일 새로 만들어서 Howler.js 또는 Web Audio API로 연결. 에셋 준비되면 알려주면 붙여드림.

---

## 요약 — 우선순위

| 순서 | 에셋 | 이유 |
|---|---|---|
| 1 | 픽셀 폰트 | 분위기 즉시 바뀜, 연결 쉬움 |
| 2 | NPC 초상화 3종 | 대화 몰입감 핵심 |
| 3 | 비격진천뢰 폭탄 아이콘 2종 (채움/빔) | 슬롯 시스템 시각화 완성 |
| 4 | 게임오버 폭발 애니메이션 | 클라이맥스 연출 |
| 5 | 엔딩 변환 애니메이션 | 메시지 전달의 핵심 |
| 6 | BGM + 효과음 | 분위기 완성 |
| 7 | 배경 텍스처 | 없어도 작동, 있으면 좋음 |
