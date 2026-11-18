export function toCents(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

export function fromCents(cents) {
  return (cents / 100).toFixed(2);
}

export function formatPeso(amount) {
  const cents = toCents(amount);
  const formatted = (cents / 100).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `PHP ${formatted}`;
}

export function calculateLineCents(unitPrice, quantity) {
  return toCents(unitPrice) * Math.max(0, Math.trunc(Number(quantity) || 0));
}

export function calculateCartTotals(items) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + calculateLineCents(item.price, item.quantity),
    0
  );
  return {
    subtotalCents,
    totalCents: subtotalCents,
    subtotal: fromCents(subtotalCents),
    total: fromCents(subtotalCents),
  };
}
