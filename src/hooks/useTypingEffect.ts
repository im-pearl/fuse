'use client';

import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speed: number = 40) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setIsDone(true);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  return {
    displayed,
    isDone,
    skip: () => { setDisplayed(text); setIsDone(true); },
  };
}
