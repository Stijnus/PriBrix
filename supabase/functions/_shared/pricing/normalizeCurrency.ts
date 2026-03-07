export function normalizeCurrency(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value
    .trim()
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
}
