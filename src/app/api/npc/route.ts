import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { npcs } from '@/data/npcs';
import { NpcId, Locale } from '@/types/game';
import { getKoreanParticle } from '@/lib/nameUtils';

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const {
      npcId,
      originalDialogue,
      playerInput1,
      playerSurname,
      playerFirstName,
      locale,
    }: {
      npcId: NpcId;
      originalDialogue: string;
      playerInput1: string;
      playerSurname: string;
      playerFirstName: string;
      locale: Locale;
    } = await request.json();

    const npc = npcs[npcId];
    const npcName = npc.name[locale];

    // 호칭 설정
    const particle = getKoreanParticle(playerFirstName);
    const byTitle = locale === 'ko' ? `${playerSurname}대리` : `${playerSurname}`;
    const byFirstName = locale === 'ko' ? `${playerFirstName}${particle}` : playerFirstName;

    const systemPrompt = `You are roleplaying as ${npcName}, a character in a workplace drama game.

## Character info
${npcId === 'parkDirector' ? `- Executive, 58 years old
- Speaks directly, occasionally says hurtful things without realizing
- Has an absolute standard based on own experience ("in my day...")
- Dismissive of younger generation's emotions` : ''}
${npcId === 'leeManager' ? `- Middle manager, 45 years old
- Pressured from above, passes pressure downward
- Sounds soft but subtly pressuring
- Often forgets what they said, takes credit, deflects blame` : ''}
${npcId === 'kimAssociate' ? `- Colleague, 32 years old, female
- Pretends to be close but not genuinely caring
- Casually compares and meddles under guise of concern` : ''}

## How to address the player
- By title (formal): "${byTitle}"
- By first name (casual): "${byFirstName}"
- Use whichever fits your character's relationship in context

## Rules
- React naturally to what the player said — this is a real follow-up, not a scripted line
- Maintain subtle pressure or discomfort, staying in character
- Keep it short: 1-3 sentences max
- Language: ${locale === 'ko' ? 'Korean' : 'English'}
- Output ONLY the dialogue text, no quotes, no character name prefix`;

    const userMessage = `${npcName} said: "${originalDialogue}"
Player responded: "${playerInput1}"

Write ${npcName}'s follow-up reaction.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const dialogue = content.text.trim();

    // ── 개발용 터미널 로그 ──────────────────────────────
    console.log('\n[FUSE] ── NPC 반응 생성 ───────────────────');
    console.log(`  NPC:      ${npcName}`);
    console.log(`  원래 대사: "${originalDialogue}"`);
    console.log(`  플레이어:  "${playerInput1}"`);
    console.log(`  생성 반응: "${dialogue}"`);
    console.log('──────────────────────────────────────────\n');

    return NextResponse.json({ dialogue });
  } catch (error) {
    console.error('[FUSE] NPC reaction error:', error);
    return NextResponse.json({ error: 'Failed to generate NPC reaction' }, { status: 500 });
  }
}
