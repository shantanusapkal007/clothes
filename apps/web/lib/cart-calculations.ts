import type { CartItem } from "../types";

const roundCurrency = (value: number) => Number(value.toFixed(2));

export function calculateCart(items: CartItem[]) {
  const lines = items.map((item) => {
    const lineSubtotal = roundCurrency(item.price * item.quantity);
    const discountAmount = roundCurrency(lineSubtotal * (item.discountPercent / 100));
    const taxableAmount = roundCurrency(lineSubtotal - discountAmount);
    const taxAmount = roundCurrency(taxableAmount * (item.taxPercent / 100));
    const total = roundCurrency(taxableAmount + taxAmount);

    return {
      ...item,
      lineSubtotal,
      discountAmount,
      taxAmount,
      total
    };
  });

  return {
    lines,
    totalAmount: roundCurrency(lines.reduce((sum, line) => sum + line.lineSubtotal, 0)),
    discountAmount: roundCurrency(lines.reduce((sum, line) => sum + line.discountAmount, 0)),
    taxAmount: roundCurrency(lines.reduce((sum, line) => sum + line.taxAmount, 0)),
    finalAmount: roundCurrency(lines.reduce((sum, line) => sum + line.total, 0))
  };
}
