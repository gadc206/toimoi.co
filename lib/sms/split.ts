/** Split long outbound copy into SMS-friendly chunks. */
export function splitSms(text: string, maxLen = 1400): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  const paragraphs = trimmed.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const next = current ? `${current}\n\n${para}` : para;
    if (next.length <= maxLen) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    if (para.length <= maxLen) {
      current = para;
    } else {
      // hard split long paragraphs
      let rest = para;
      while (rest.length > maxLen) {
        let cut = rest.lastIndexOf(" ", maxLen);
        if (cut < maxLen * 0.6) cut = maxLen;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      current = rest;
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}
