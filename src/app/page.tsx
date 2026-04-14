'use client';

import { useGameStore } from '@/store/gameStore';
import LanguageSelect from '@/components/ui/LanguageSelect';
import NameInput from '@/components/ui/NameInput';
import Prologue from '@/components/game/Prologue';
import DayScreen from '@/components/game/DayScreen';
import GameOver from '@/components/game/GameOver';
import Ending from '@/components/game/Ending';

export default function Home() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="h-full">
      {phase === 'language' && <LanguageSelect />}
      {phase === 'name' && <NameInput />}
      {phase === 'prologue' && <Prologue />}
      {phase === 'day' && <DayScreen />}
      {phase === 'gameOver' && <GameOver />}
      {phase === 'ending' && <Ending />}
    </div>
  );
}
