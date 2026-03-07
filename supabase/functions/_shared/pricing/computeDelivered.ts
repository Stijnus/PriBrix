export function computeDelivered(price: number | null, shipping: number | null) {
  if (price == null || shipping == null) {
    return null;
  }

  return Number((price + shipping).toFixed(2));
}
