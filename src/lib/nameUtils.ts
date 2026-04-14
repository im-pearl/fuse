/**
 * 한국어 이름의 마지막 글자에 받침이 있으면 '아', 없으면 '야'
 * ex) 영순 → 아 (ㄴ 받침), 지수 → 야 (받침 없음)
 */
export function getKoreanParticle(name: string): string {
  if (!name) return '아';
  const lastChar = name.charCodeAt(name.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return '아'; // 한글 아닌 경우 기본값
  const hasBatchim = (lastChar - 0xac00) % 28 !== 0;
  return hasBatchim ? '아' : '야';
}

/**
 * 대사 텍스트의 {surname}, {firstname}, {particle} 플레이스홀더를 실제 이름으로 채움
 */
export function fillNamePlaceholders(
  text: string,
  surname: string,
  firstName: string
): string {
  const particle = getKoreanParticle(firstName);
  return text
    .replace(/\{surname\}/g, surname)
    .replace(/\{firstname\}/g, firstName)
    .replace(/\{particle\}/g, particle);
}
