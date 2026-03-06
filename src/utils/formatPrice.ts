export function formatPrice(amount: number | null | undefined, locale = 'nl-BE') {
  if (amount == null) {
    return 'Prijs niet beschikbaar';
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `EUR ${formatted}`;
}
