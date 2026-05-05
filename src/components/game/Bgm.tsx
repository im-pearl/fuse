'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const TRACKS = {
  opening: '/assets/opening.m4a',
  ending: '/assets/Echoes%20of%20Winter.m4a',
} as const;
type TrackKey = keyof typeof TRACKS;

const TARGET_VOLUMES: Record<TrackKey, number> = {
  opening: 0.25,
  ending: 0.5,
};
const FADE_MS = 3000;

const audios: Partial<Record<TrackKey, HTMLAudioElement>> = {};
const unlocked = new Set<TrackKey>();

function getAudio(key: TrackKey): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audios[key]) {
    const a = new Audio(TRACKS[key]);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    audios[key] = a;
  }
  return audios[key]!;
}

export default function Bgm() {
  const phase = useGameStore((s) => s.phase);
  const bgmActive = useGameStore((s) => s.bgmActive);
  const fadeRafRef = useRef(0);

  const targetTrack: TrackKey | null =
    phase === 'language' ? 'opening' :
    bgmActive ? 'ending' :
    null;

  useEffect(() => {
    cancelAnimationFrame(fadeRafRef.current);

    // 타겟이 아닌 트랙은 정지
    (Object.keys(TRACKS) as TrackKey[]).forEach((key) => {
      if (key !== targetTrack) {
        const a = audios[key];
        if (a && !a.paused) {
          a.pause();
          a.currentTime = 0;
          a.volume = 0;
        }
      }
    });

    if (!targetTrack) return;

    const audio = getAudio(targetTrack);
    if (!audio) return;

    const targetVolume = TARGET_VOLUMES[targetTrack];

    const startFade = () => {
      audio.volume = 0;
      const fadeStart = performance.now();
      const tick = (now: number) => {
        const progress = Math.max(0, Math.min((now - fadeStart) / FADE_MS, 1));
        audio.volume = targetVolume * progress;
        if (progress < 1) fadeRafRef.current = requestAnimationFrame(tick);
      };
      fadeRafRef.current = requestAnimationFrame(tick);
    };

    audio.currentTime = 0;
    audio.volume = 0;

    let cleanedUp = false;
    let onGesture: (() => void) | null = null;

    const removeGestureListeners = () => {
      if (!onGesture) return;
      window.removeEventListener('click', onGesture);
      window.removeEventListener('touchstart', onGesture);
      window.removeEventListener('keydown', onGesture);
      onGesture = null;
    };

    audio.play().then(() => {
      if (cleanedUp) return;
      unlocked.add(targetTrack);
      console.log(`[Bgm] play started: ${targetTrack}`);
      startFade();
    }).catch((err) => {
      if (cleanedUp) return;
      console.warn(`[Bgm] play blocked for ${targetTrack}, awaiting gesture:`, err);

      onGesture = () => {
        if (cleanedUp) return;
        removeGestureListeners();

        // 타겟 트랙: 재생 + 페이드인
        audio.play().then(() => {
          if (cleanedUp) return;
          unlocked.add(targetTrack);
          console.log(`[Bgm] play started via gesture: ${targetTrack}`);
          startFade();
        }).catch((e) => console.error(`[Bgm] play retry failed:`, e));

        // 같은 제스처 안에서 다른 트랙도 잠금 해제 (Safari 대비)
        (Object.keys(TRACKS) as TrackKey[]).forEach((key) => {
          if (key === targetTrack || unlocked.has(key)) return;
          const a = getAudio(key);
          if (!a) return;
          a.play().then(() => {
            unlocked.add(key);
            a.pause();
            a.currentTime = 0;
            a.volume = 0;
          }).catch(() => {});
        });
      };

      window.addEventListener('click', onGesture);
      window.addEventListener('touchstart', onGesture);
      window.addEventListener('keydown', onGesture);
    });

    return () => {
      cleanedUp = true;
      cancelAnimationFrame(fadeRafRef.current);
      removeGestureListeners();
    };
  }, [targetTrack]);

  return null;
}
