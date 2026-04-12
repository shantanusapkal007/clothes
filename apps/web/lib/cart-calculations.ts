import type { CartItem } from "../types";

const roundCurrency = (value: number) => Number(value.toFixed(2));

export function calculateCart(items: CartItem[]) {
  const lines = items.map((item) => {
    const lineSubtotal = roundCurrency(item.price * item.quantity);
    const percentDiscountAmount = roundCurrency(lineSubtotal * (item.discountPercent / 100));
    const manualDiscountAmount = roundCurrency(
      Math.min(
        Math.max(0, item.manualDiscountAmount),
        Math.max(0, lineSubtotal - percentDiscountAmount)
      )
    );
    const discountAmount = roundCurrency(
      Math.min(lineSubtotal, percentDiscountAmount + manualDiscountAmount)
    );
    const taxableAmount = roundCurrency(Math.max(0, lineSubtotal - discountAmount));
    const taxAmount = roundCurrency(taxableAmount * (item.taxPercent / 100));
    const total = roundCurrency(taxableAmount + taxAmount);

    return {
      ...item,
      manualDiscountAmount,
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
