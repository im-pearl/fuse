'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import GameOver from '@/components/game/GameOver';
import Ending from '@/components/game/Ending';

export default function EndingPreview() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);

  useEffect(() => { setPhase('gameOver'); }, [setPhase]);

  return (
    <div className="h-full">
      {phase === 'gameOver' && <GameOver />}
      {phase === 'ending' && <Ending />}
    </div>
  );
}
