const setNumPatterns = [
  /\blego(?:\s+set)?\s+(\d{4,6})(-\d+)?\b/i,
  /\b(\d{4,6})(-\d+)?\s+lego\b/i,
  /\bset\s+(\d{4,6})(-\d+)?\b/i,
  /\b(\d{4,6})(-\d+)?\b/,
];

export function extractSetNum(title: string) {
  for (const pattern of setNumPatterns) {
    const match = title.match(pattern);

    if (!match) {
      continue;
    }

    const base = match[1];
    const suffix = match[2];
    return suffix ? `${base}${suffix}` : `${base}-1`;
  }

  return null;
}
