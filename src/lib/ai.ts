import { AIAnalysisResult, Locale } from '@/types/game';

interface AnalyzeRequest {
  npcDialogue: string;
  npcFollowUp: string;
  playerInput1: string;
  playerInput2: string;
  playerSurname: string;
  playerFirstName: string;
  locale: Locale;
}

export async function analyzeEmotion(req: AnalyzeRequest): Promise<AIAnalysisResult> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error('AI analysis failed');
  }

  return response.json();
}
