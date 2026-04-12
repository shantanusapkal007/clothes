import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useCartStore } from "../lib/cart-store";
import { calculateCart } from "../lib/cart-calculations";

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

export function CartPanel({
  onCheckout,
  checkoutPending,
  onOpenPrinterSettings,
  storeWhatsAppNumber
}: CartPanelProps) {
  const { items, removeItem, updateItem, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const summary = calculateCart(items);
  const lineMap = useMemo(
    () => new Map(summary.lines.map((line) => [line.productId, line])),
    [summary.lines]
  );
  const normalizedCustomerPhone = customerPhone.replace(/[^\d]/g, "");
  const canSendWhatsApp = !sendWhatsApp || normalizedCustomerPhone.length >= 10;

  // A basic hash function to get a consistent image from Unsplash based on product name/id
  const getProductImage = (name: string) => {
    // We'll use a placeholder for now since we don't have images in the DB
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ccfbf1&color=0f766e&size=128`;
  };

  return (
    <div className="glass-panel flex h-full flex-col rounded-lg p-4 md:p-6 xl:sticky xl:top-24">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h3 className="font-headline text-xl md:text-2xl font-bold flex items-center gap-2">
          Checkout
          <button 
            onClick={onOpenPrinterSettings}
            className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-xl p-1"
            title="Printer Settings"
          >
            print
          </button>
        </h3>
        
        {items.length > 0 && (
          <button 
            onClick={clearCart}
            className="text-primary text-xs md:text-sm font-semibold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="flex-1 flex flex-col items-center justify-center opacity-50 py-12"
        >
          <span className="material-symbols-outlined text-5xl mb-3 opacity-80">shopping_basket</span>
          <p className="text-sm font-bold tracking-widest uppercase">Cart is empty</p>
        </motion.div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mb-6 max-h-[42vh] flex-1 space-y-4 overflow-y-auto pr-1 md:mb-8 md:max-h-[50vh] md:space-y-6 hide-scrollbar">
            <AnimatePresence>
            {items.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, height: 0, overflow: 'hidden' }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                key={item.productId} 
                className="group rounded-lg border border-white/80 bg-white/70 p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] backdrop-blur-md md:gap-4"
              >
                {(() => {
                  const line = lineMap.get(item.productId);

                  return (
                    <>
                      <div className="sm:flex sm:gap-3">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden ring-1 ring-white/80 shadow-sm">
                  <img
                    alt={item.name}
                    src={getProductImage(item.name)}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                  />
                </div>
                <div className="mt-3 min-w-0 flex-1 sm:mt-0">
                  <div className="flex justify-between gap-2">
                    <h5 className="font-semibold text-on-surface truncate text-sm md:text-base">{item.name}</h5>
                    <p className="font-headline font-bold text-sm md:text-base shrink-0 text-primary">
                      Rs {(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="truncate text-[10px] font-medium uppercase tracking-widest text-secondary md:text-xs">
                      {item.barcode ? `SKU: ${item.barcode}` : 'NO SKU'}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 bg-white/70 p-1.5 rounded-lg ring-1 ring-white/80 shadow-sm">
                      <button
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-surface-container-low transition-colors"
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeItem(item.productId);
                          } else {
                            updateItem(item.productId, "quantity", item.quantity - 1);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">remove</span>
                      </button>
                      <span className="font-bold w-6 text-center text-xs md:text-sm">{item.quantity}</span>
                      <button
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-surface-container-low transition-colors"
                        onClick={() => updateItem(item.productId, "quantity", item.quantity + 1)}
                      >
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                  {/* Optional mobile-only price + discount inputs */}
                  {(item.discountPercent > 0 || item.taxPercent > 0) && (
                    <div className="flex gap-2 mt-2 text-[10px] uppercase font-bold tracking-widest text-secondary">
                      {item.discountPercent > 0 && <span className="bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-lg backdrop-blur-md">-{item.discountPercent}%</span>}
                      {item.taxPercent > 0 && <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded-lg backdrop-blur-md">+{item.taxPercent}% tax</span>}
                    </div>
                  )}
                </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <label className="rounded-lg bg-white/80 p-3 ring-1 ring-white/80 shadow-sm transition hover:bg-white">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Price
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-secondary font-bold">Rs</span>
                            <input
                              className="w-full border-none bg-transparent p-0 text-right font-headline text-lg font-bold focus:ring-0 text-primary"
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

                        <div className="rounded-lg bg-white/80 p-3 ring-1 ring-white/80 shadow-sm transition hover:bg-white">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Discount
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] shrink-0 transition ${
                                item.discountPercent === 10
                                  ? "bg-primary text-on-primary shadow-sm scale-105"
                                  : "bg-surface-container-high/60 text-secondary hover:bg-white"
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
                              className="w-full border-none bg-transparent p-0 text-right font-headline text-lg font-bold focus:ring-0 text-primary"
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

                        <label className="rounded-lg bg-white/80 p-3 ring-1 ring-white/80 shadow-sm transition hover:bg-white">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Tax %
                          </span>
                          <input
                            className="w-full border-none bg-transparent p-0 text-right font-headline text-lg font-bold focus:ring-0 text-primary"
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
                        </label>

                        <div className="rounded-lg bg-primary/5 p-3 ring-1 ring-primary/10 shadow-sm">
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                            Line total
                          </span>
                          <div className="text-right flex flex-col justify-end h-full mt-auto">
                            <div className="font-headline text-lg font-bold text-primary">
                              Rs {line?.total.toFixed(2) ?? "0.00"}
                            </div>
                            {line && line.discountAmount > 0 ? (
                              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mt-1">
                                Saved Rs {line.discountAmount.toFixed(2)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>

          {/* Payment & Checkout */}
          <div className="pt-6 md:pt-8 border-t border-outline-variant/30 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3 md:p-4">
                <span className="text-sm font-medium text-on-secondary-container md:text-base">Payment Method</span>
                <div className="hide-scrollbar flex overflow-x-auto rounded-lg bg-surface-container-high p-1">
                  {["cash", "card", "upi"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`min-w-[72px] rounded-md px-3 py-2 text-[10px] font-bold uppercase md:px-4 md:text-xs ${
                        paymentMethod === method
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'text-on-secondary-container'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/80 p-3 shadow-sm md:p-4">
                <label className="flex cursor-pointer items-start gap-3">
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
                    <span className="mt-1 block text-xs leading-relaxed text-emerald-800/80">
                      Uses {storeWhatsAppNumber} in the bill and opens the customer chat.
                    </span>
                  </span>
                </label>

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
                      Enter the customer's WhatsApp number before checkout.
                    </p>
                  ) : null}
                </div>
              </div>
              
              <div className="flex justify-between items-center px-4">
                <span className="text-on-secondary-container text-sm">Subtotal</span>
                <span className="font-medium text-sm">Rs {summary.totalAmount.toFixed(2)}</span>
              </div>
              
              {summary.discountAmount > 0 && (
                <div className="flex justify-between items-center px-4">
                  <span className="text-on-secondary-container text-sm">Discount</span>
                  <span className="font-medium text-emerald-600 text-sm">-Rs {summary.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              {summary.taxAmount > 0 && (
                <div className="flex justify-between items-center px-4">
                  <span className="text-on-secondary-container text-sm">Tax</span>
                  <span className="font-medium text-sm">+Rs {summary.taxAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() =>
                onCheckout({
                  paymentMethod,
                  customerPhone: customerPhone.trim(),
                  sendWhatsApp: sendWhatsApp && Boolean(customerPhone.trim())
                })
              }
              disabled={checkoutPending || !canSendWhatsApp}
              className="w-full bg-primary text-on-primary py-4 md:py-6 rounded-lg text-lg md:text-xl font-bold hover:bg-primary-container transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {checkoutPending ? "Processing..." : "Complete Checkout"} 
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
