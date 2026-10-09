export function formatPrice(amount: number, currency: string = 'KZT'): string {
  const num = Math.round(amount);
  const formatted = num.toLocaleString('ru-RU');

  if (currency === 'KZT') {
    return `${formatted} ₸`;
  }
  if (currency === 'USD') {
    return `$${num.toLocaleString('en-US')}`;
  }
  return `${formatted} ₽`;
}
