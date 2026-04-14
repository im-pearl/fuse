import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { npcs } from '@/data/npcs';
import { NpcId, Locale } from '@/types/game';

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const {
      npcId,
      originalDialogue,
      playerInput1,
      playerName,
      locale,
    }: {
      npcId: NpcId;
      originalDialogue: string;
      playerInput1: string;
      playerName: string;
      locale: Locale;
    } = await request.json();

    const npc = npcs[npcId];
    const npcName = npc.name[locale];

    const systemPrompt = `You are roleplaying as ${npcName}, a character in a workplace drama game.

## Character info
${npcId === 'parkDirector' ? `- Executive, 58 years old
- Speaks directly, occasionally says hurtful things without realizing
- Has an absolute standard based on their own experience ("in my day...")
- Concerned-sounding but actually dismissive of younger generation` : ''}
${npcId === 'leeManager' ? `- Middle manager, 45 years old
- Pressured from above, passes pressure downward
- Sounds soft but subtly pressuring
- Often forgets what they said, takes credit, deflects blame` : ''}
${npcId === 'kimAssociate' ? `- Colleague, 32 years old, female
- Pretends to be close but not genuinely caring
- Casually compares and meddles under guise of concern
- Gossips` : ''}

## Rules
- React to the player's response naturally, staying in character
- Your reaction should feel like a REAL follow-up to what they said — not a pre-scripted line
- Maintain subtle pressure or discomfort without being cartoonishly villainous
- Keep it short: 1-3 sentences max
- Language: ${locale === 'ko' ? 'Korean (informal 반말 or workplace 해요체 as fits the character)' : 'English'}
- Output ONLY the dialogue text, no quotes, no character name prefix`;

    const userMessage = `${npcName} said: "${originalDialogue}"
${playerName} responded: "${playerInput1}"

Write ${npcName}'s follow-up reaction to ${playerName}'s response.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    return NextResponse.json({ dialogue: content.text.trim() });
  } catch (error) {
    console.error('NPC reaction error:', error);
    return NextResponse.json({ error: 'Failed to generate NPC reaction' }, { status: 500 });
  }
}
