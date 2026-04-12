import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { calculateCart } from "../lib/cart-calculations";
import { useCartStore } from "../lib/cart-store";

export type CheckoutRequest = {
  paymentMethod: string;
  customerPhone: string;
  sendWhatsApp: boolean;
};

interface CartPanelProps {
  onCheckout: (request: CheckoutRequest) => void;
  checkoutPending: boolean;
  onOpenPrinterSettings: () => void;
  storeWhatsAppNumber: string;
}

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", hint: "Counter" },
  { id: "card", label: "Card", hint: "Swipe" },
  { id: "upi", label: "UPI", hint: "Scan" }
] as const;

export function CartPanel({
  onCheckout,
  checkoutPending,
  onOpenPrinterSettings,
  storeWhatsAppNumber
}: CartPanelProps) {
  const { items, removeItem, updateItem, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("cash");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const summary = calculateCart(items);
  const lineMap = useMemo(
    () => new Map(summary.lines.map((line) => [line.productId, line])),
    [summary.lines]
  );
  const normalizedCustomerPhone = customerPhone.replace(/[^\d]/g, "");
  const canSendWhatsApp = !sendWhatsApp || normalizedCustomerPhone.length >= 10;

  const getProductImage = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=ccfbf1&color=0f766e&size=128&font-size=0.32`;

  return (
    <div className="glass-panel flex h-full flex-col rounded-lg p-4 md:p-6 xl:sticky xl:top-24">
      <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-headline text-xl font-bold text-on-background md:text-2xl">
            Checkout
            <button
              onClick={onOpenPrinterSettings}
              className="material-symbols-outlined rounded-lg p-1 text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
              title="Printer Settings"
              type="button"
            >
              print
            </button>
          </h3>
          <p className="mt-1 text-xs text-on-secondary-container md:text-sm">
            Review quantities, pricing, manual discount, and receipt flow before billing.
          </p>
        </div>

        {items.length > 0 ? (
          <button
            onClick={clearCart}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high hover:text-on-background md:text-sm"
            type="button"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center py-12 text-center opacity-60"
        >
          <span className="material-symbols-outlined mb-3 text-5xl opacity-80">shopping_basket</span>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-on-secondary-container">
            Cart is empty
          </p>
        </motion.div>
      ) : (
        <>
          <div className="hide-scrollbar mb-6 flex-1 space-y-4 overflow-y-auto pr-1 md:mb-8 md:space-y-5">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const line = lineMap.get(item.productId);
                const manualDiscountLimit =
                  (line?.lineSubtotal ?? item.price * item.quantity) *
                  (1 - item.discountPercent / 100);

                return (
                  <motion.div
                    layout
                    key={item.productId}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 340, damping: 28 }}
                    className="group overflow-hidden rounded-lg border border-outline-variant/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,251,248,0.92))] p-4 shadow-[0_18px_35px_rgba(8,47,46,0.05)]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container-low ring-1 ring-white/80 shadow-sm md:h-16 md:w-16">
                            <img
                              alt={item.name}
                              src={getProductImage(item.name)}
                              className="h-full w-full object-cover mix-blend-multiply opacity-90"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h5 className="break-words text-sm font-semibold leading-tight text-on-surface md:text-base">
                                  {item.name}
                                </h5>
                                <p className="mt-1 break-all text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary md:text-xs">
                                  {item.barcode ? `SKU: ${item.barcode}` : "No SKU"}
                                </p>
                              </div>

                              <div className="shrink-0 rounded-lg bg-primary/[0.08] px-3 py-2 text-right shadow-sm ring-1 ring-primary/10">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                                  Unit Price
                                </span>
                                <span className="mt-1 block font-headline text-lg font-bold tabular-nums text-primary">
                                  Rs {item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {(item.discountPercent > 0 ||
                              item.manualDiscountAmount > 0 ||
                              item.taxPercent > 0) && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.discountPercent > 0 ? (
                                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
                                    {item.discountPercent}% off
                                  </span>
                                ) : null}
                                {item.manualDiscountAmount > 0 ? (
                                  <span className="rounded-lg bg-secondary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-secondary-fixed">
                                    Manual Rs {item.manualDiscountAmount.toFixed(2)}
                                  </span>
                                ) : null}
                                {item.taxPercent > 0 ? (
                                  <span className="rounded-lg bg-tertiary-fixed px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-tertiary-fixed-variant">
                                    Tax {item.taxPercent}%
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 self-start rounded-lg border border-outline-variant/25 bg-white/90 p-2 shadow-sm">
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container-high"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeItem(item.productId);
                              } else {
                                updateItem(item.productId, "quantity", item.quantity - 1);
                              }
                            }}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>

                          <div className="min-w-[3rem] text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                              Qty
                            </span>
                            <span className="block font-headline text-xl font-bold tabular-nums text-on-surface">
                              {item.quantity}
                            </span>
                          </div>

                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container-high"
                            onClick={() => updateItem(item.productId, "quantity", item.quantity + 1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <label className="min-w-0 rounded-lg border border-outline-variant/25 bg-white/90 p-3 shadow-sm">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Price
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-secondary">Rs</span>
                            <input
                              className="field-input-compact text-right font-headline text-base tabular-nums text-primary md:text-lg"
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.price}
                              onChange={(event) =>
                                updateItem(
                                  item.productId,
                                  "price",
                                  parseFloat(event.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </label>

                        <div className="min-w-0 rounded-lg border border-outline-variant/25 bg-white/90 p-3 shadow-sm">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Discount %
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`shrink-0 rounded-md px-2 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition ${
                                item.discountPercent === 10
                                  ? "bg-primary text-on-primary shadow-sm"
                                  : "bg-surface-container-high text-secondary hover:bg-surface-container-low"
                              }`}
                              onClick={() =>
                                updateItem(
                                  item.productId,
                                  "discountPercent",
                                  item.discountPercent === 10 ? 0 : 10
                                )
                              }
                            >
                              10%
                            </button>
                            <input
                              className="field-input-compact text-right font-headline text-base tabular-nums text-primary md:text-lg"
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              value={item.discountPercent}
                              onChange={(event) =>
                                updateItem(
                                  item.productId,
                                  "discountPercent",
                                  parseFloat(event.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>

                        <label className="min-w-0 rounded-lg border border-outline-variant/25 bg-white/90 p-3 shadow-sm">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Manual Discount
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-secondary">Rs</span>
                            <input
                              className="field-input-compact text-right font-headline text-base tabular-nums text-primary md:text-lg"
                              type="number"
                              min={0}
                              max={Math.max(0, manualDiscountLimit)}
                              step="0.01"
                              value={item.manualDiscountAmount}
                              onChange={(event) =>
                                updateItem(
                                  item.productId,
                                  "manualDiscountAmount",
                                  parseFloat(event.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <p className="mt-2 text-[11px] font-medium text-on-secondary-container">
                            Extra rupee discount after percentage.
                          </p>
                        </label>

                        <div className="min-w-0 rounded-lg border border-outline-variant/25 bg-white/90 p-3 shadow-sm">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Tax %
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`shrink-0 rounded-md px-2 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition ${
                                item.taxPercent === 0
                                  ? "bg-emerald-100 text-emerald-800 shadow-sm"
                                  : "bg-surface-container-high text-secondary hover:bg-surface-container-low"
                              }`}
                              onClick={() => updateItem(item.productId, "taxPercent", 0)}
                            >
                              0%
                            </button>
                            <input
                              className="field-input-compact text-right font-headline text-base tabular-nums text-primary md:text-lg"
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              value={item.taxPercent}
                              onChange={(event) =>
                                updateItem(
                                  item.productId,
                                  "taxPercent",
                                  parseFloat(event.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <p className="mt-2 text-[11px] font-medium text-on-secondary-container">
                            {line && line.taxAmount > 0
                              ? `Adds Rs ${line.taxAmount.toFixed(2)}`
                              : "No tax on this line"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-primary/15 bg-primary/[0.08] p-3 shadow-sm sm:col-span-2 xl:col-span-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Line Total
                          </span>
                          <div className="mt-4 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-on-secondary-container">
                                Subtotal Rs {(line?.lineSubtotal ?? item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="mt-1 break-words font-headline text-2xl font-bold tabular-nums text-primary">
                                Rs {line?.total.toFixed(2) ?? "0.00"}
                              </p>
                            </div>
                          </div>

                          {line && line.discountAmount > 0 ? (
                            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                              Saved Rs {line.discountAmount.toFixed(2)}
                            </p>
                          ) : (
                            <p className="mt-3 text-[11px] font-medium text-on-secondary-container">
                              Ready for billing
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <motion.div
            layout
            className="space-y-4 border-t border-outline-variant/30 pt-6 md:space-y-5 md:pt-8"
          >
            <div className="rounded-lg border border-outline-variant/25 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-on-surface md:text-base">Payment Method</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                  Required for bill
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <motion.button
                    key={method.id}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-lg border px-3 py-3 text-left transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary text-on-primary shadow-[0_12px_24px_rgba(15,118,110,0.18)]"
                        : "border-outline-variant/25 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="block text-sm font-bold uppercase tracking-[0.16em]">
                      {method.label}
                    </span>
                    <span
                      className={`mt-1 block text-[11px] font-medium ${
                        paymentMethod === method.id
                          ? "text-on-primary/80"
                          : "text-on-secondary-container"
                      }`}
                    >
                      {method.hint}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.label
              layout
              className="block rounded-lg border border-emerald-200/70 bg-emerald-50/85 p-4 shadow-sm"
            >
              <div className="flex cursor-pointer items-start gap-3">
                <input
                  className="mt-1 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600"
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(event) => setSendWhatsApp(event.target.checked)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-emerald-900">
                    Send bill on WhatsApp
                  </span>
                  <span className="mt-1 block break-words text-xs leading-relaxed text-emerald-800/80">
                    Uses {storeWhatsAppNumber} in the bill and opens the customer chat.
                  </span>
                </span>
              </div>

              <div className="mt-3">
                <input
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm text-on-surface shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-emerald-50 disabled:text-emerald-900/40"
                  type="tel"
                  inputMode="tel"
                  placeholder="Customer WhatsApp number"
                  value={customerPhone}
                  disabled={!sendWhatsApp}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
                {sendWhatsApp && !canSendWhatsApp ? (
                  <p className="mt-2 text-xs font-medium text-error">
                    Enter the customer&apos;s WhatsApp number before checkout.
                  </p>
                ) : null}
              </div>
            </motion.label>

            <motion.div
              layout
              className="rounded-lg border border-outline-variant/25 bg-white/90 p-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-on-secondary-container">Subtotal</span>
                  <span className="font-semibold tabular-nums text-on-surface">
                    Rs {summary.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-on-secondary-container">Manual + item discounts</span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    -Rs {summary.discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-on-secondary-container">Tax</span>
                  <span className="font-semibold tabular-nums text-on-surface">
                    +Rs {summary.taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3 border-t border-outline-variant/20 pt-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                      Payable
                    </span>
                    <span className="mt-1 block text-xs text-on-secondary-container">
                      Final amount for this bill
                    </span>
                  </div>
                  <span className="font-headline text-2xl font-bold tabular-nums text-primary">
                    Rs {summary.finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.button
              type="button"
              whileHover={checkoutPending || !canSendWhatsApp ? undefined : { y: -1 }}
              whileTap={checkoutPending || !canSendWhatsApp ? undefined : { scale: 0.99 }}
              onClick={() =>
                onCheckout({
                  paymentMethod,
                  customerPhone: customerPhone.trim(),
                  sendWhatsApp: sendWhatsApp && Boolean(customerPhone.trim())
                })
              }
              disabled={checkoutPending || !canSendWhatsApp}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary py-4 text-lg font-bold text-on-primary shadow-[0_20px_30px_rgba(15,118,110,0.2)] transition-all hover:bg-primary-container disabled:opacity-50 md:py-5 md:text-xl"
            >
              {checkoutPending ? "Processing..." : "Complete Checkout"}
              <span className="material-symbols-outlined">chevron_right</span>
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
}
