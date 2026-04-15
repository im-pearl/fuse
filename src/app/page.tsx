'use client';

import { useGameStore } from '@/store/gameStore';
import LanguageSelect from '@/components/ui/LanguageSelect';
import DayScreen from '@/components/game/DayScreen';
import GameOver from '@/components/game/GameOver';
import Story from '@/components/game/Story';
import Ending from '@/components/game/Ending';

export default function Home() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="h-full">
      {phase === 'language' && <LanguageSelect />}
      {phase === 'day' && <DayScreen />}
      {phase === 'gameOver' && <GameOver />}
      {phase === 'story' && <Story />}
      {phase === 'ending' && <Ending />}
    </div>
  );
}
