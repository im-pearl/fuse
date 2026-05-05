# FUSE

> 별거 아닌 일들이 감정 폭탄이 되어 굴러온다. AI가 당신의 대응을 지켜보고 있다.

픽셀아트 텍스트 어드벤처 / 심리 시뮬레이션. 모바일 우선 웹게임, 약 5분 플레이.
조선시대 시한폭탄 **비격진천뢰**를 메타포로, 직장에서 누적되는 감정 폭탄을 다룬다.

기획 상세는 [PROJECT.md](./PROJECT.md), 에셋 가이드는 [ASSETS.md](./ASSETS.md).

---

## 로컬 실행

```bash
npm install
npm run dev
# → http://localhost:3000
```

`.env.local`에 Anthropic API 키 설정:

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 기술 스택

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- Zustand (게임 상태)
- Framer Motion (애니메이션)
- Anthropic SDK (`claude-sonnet-4-6`) — NPC 반응 + 감정 분석

---

## 프리뷰 라우트

- `/` — 본 게임 (언어 선택부터)
- `/ending` — GameOver → Story → Ending 시퀀스 프리뷰

---

## 배포

Vercel 권장. 환경 변수 `ANTHROPIC_API_KEY`만 설정하면 돼.
