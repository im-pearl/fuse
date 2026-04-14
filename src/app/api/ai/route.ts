import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AIAnalysisResult, EmotionType, ResponsePattern } from '@/types/game';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an emotion analyzer for a narrative game called FUSE.
The player is a 3rd-year office worker dealing with workplace stress.

Your job: analyze the player's TWO responses to an NPC interaction and determine:
1. Their surface behavior pattern
2. Which emotions are accumulating and by how much
3. A short narrator comment

## Response Patterns & Emotion Mapping
- comply/apologize ("네 알겠습니다", "죄송합니다") → injustice +20~30, selfBlame +20~30
- resist/argue ("제가 한 게 아닌데요") → anger +15~25, anxiety +15~25
- avoid/ignore ("...", "아 네") → helplessness +20~30
- humor/deflect ("ㅋㅋ 그러게요") → selfBlame +10~15
- overPositive ("완전 좋아요!") → selfBlame +25~35, helplessness +25~35
- aggressive/hostile (insults) → anger +35~50

IMPORTANT: No response reduces emotions. They only accumulate at different rates.

## Comment Style
- Don't judge, don't be sarcastic
- Calm but warm, always on the player's side
- Use second person ("당신은", "You")
- 15-40 characters for Korean, 10-50 characters for English
- Don't directly name emotions ("You seem angry" X)

## Output Format (JSON only)
{
  "pattern": "comply|resist|avoid|humor|overPositive|aggressive",
  "emotions": [
    { "emotion": "emotionType", "amount": number }
  ],
  "comment": "narrator comment"
}

emotion types: anxiety, burden, injustice, helplessness, selfBlame, anger`;

export async function POST(request: Request) {
  try {
    const { npcDialogue, npcFollowUp, playerInput1, playerInput2, playerName, locale } =
      await request.json();

    const userMessage = `NPC says: "${npcDialogue}"
Player (1st response): "${playerInput1}"
NPC follows up: "${npcFollowUp}"
Player (2nd response): "${playerInput2}"

Player name: ${playerName}
Language for comment: ${locale === 'ko' ? 'Korean' : 'English'}

Analyze the player's emotional state and respond in JSON.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // JSON 파싱 (코드블록 안에 있을 수 있음)
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 유효성 검증
    const validPatterns: ResponsePattern[] = ['comply', 'resist', 'avoid', 'humor', 'overPositive', 'aggressive'];
    const validEmotions: EmotionType[] = ['anxiety', 'burden', 'injustice', 'helplessness', 'selfBlame', 'anger'];

    const result: AIAnalysisResult = {
      pattern: validPatterns.includes(parsed.pattern) ? parsed.pattern : 'comply',
      emotions: (parsed.emotions || [])
        .filter((e: { emotion: string; amount: number }) =>
          validEmotions.includes(e.emotion as EmotionType) && typeof e.amount === 'number'
        )
        .map((e: { emotion: string; amount: number }) => ({
          emotion: e.emotion as EmotionType,
          amount: Math.min(50, Math.max(5, e.amount)),
        })),
      comment: typeof parsed.comment === 'string' ? parsed.comment : '',
    };

    // 감정이 비어있으면 기본값
    if (result.emotions.length === 0) {
      result.emotions = [{ emotion: 'burden', amount: 20 }];
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
