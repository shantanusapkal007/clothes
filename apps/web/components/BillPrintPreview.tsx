import { DEFAULT_BILL_LAYOUT, getBillLayoutConfig } from "../lib/printer";
import type { BillDataWithProducts } from "./PosWorkspace";

interface BillPrintPreviewProps {
  bill: BillDataWithProducts;
  billNumber: string;
  paymentMethod: string;
  printerStatus: string;
  onConfirmCheckout: (shouldPrint: boolean) => void;
  onClose: () => void;
  confirmPending?: boolean;
}

export function BillPrintPreview({
  bill,
  billNumber,
  paymentMethod,
  printerStatus,
  onConfirmCheckout,
  onClose,
  confirmPending
}: BillPrintPreviewProps) {
  const layout = getBillLayoutConfig();
  const receiptWidthClass = layout.paperWidth <= 58 ? "sm:max-w-[22rem]" : layout.paperWidth >= 110 ? "sm:max-w-[32rem]" : "sm:max-w-md";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#311300]/60 p-4 backdrop-blur-sm">
      <div className={`relative flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_40px_80px_rgba(49,19,0,0.2)] ${receiptWidthClass}`}>
        <div className="relative -mb-2 flex h-6 justify-center gap-2 overflow-hidden bg-surface-container-lowest pt-2">
          <div className="absolute top-0 flex h-2 w-full justify-between space-x-[2px] bg-transparent">
            {[...Array(30)].map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 origin-top-left -translate-y-1 rotate-45 bg-[#311300]/60"
              />
            ))}
          </div>
        </div>

        <div className="absolute right-2 top-2 z-10 flex justify-end p-4">
          <button
            className="material-symbols-outlined cursor-pointer rounded-full border border-outline-variant/20 bg-surface-container-highest p-2 text-secondary shadow-sm transition-colors hover:text-error"
            onClick={onClose}
            disabled={confirmPending}
          >
            close
          </button>
        </div>

        <div className="border-b border-outline-variant/20 bg-surface-container-high px-4 py-3 text-xs text-on-secondary-container sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold uppercase tracking-[0.18em]">Print Path</span>
            <span>{printerStatus}</span>
          </div>
        </div>

        <div className="hide-scrollbar flex flex-1 flex-col overflow-y-auto px-4 py-5 font-mono text-xs text-stone-800 sm:px-6 md:px-8 md:py-6 md:text-sm">
          <div className="mb-6 text-center">
            <h2 className="mb-1 font-serif text-2xl font-bold leading-tight tracking-tight text-stone-900">
              {layout.companyName || DEFAULT_BILL_LAYOUT.companyName}
            </h2>
            {layout.companyAddress ? (
              <div className="whitespace-pre-wrap text-[10px] uppercase tracking-widest text-stone-600">
                {layout.companyAddress}
              </div>
            ) : null}
            {layout.companyPhone ? (
              <div className="mt-1 text-[10px] uppercase tracking-widest text-stone-600">
                TEL: {layout.companyPhone}
              </div>
            ) : null}
          </div>

          <div className="mb-4 flex justify-between border-y border-dashed border-stone-300 py-3 text-[10px] uppercase sm:text-xs">
            <div>
              <div className="mb-0.5 opacity-60">Transaction</div>
              <div className="font-bold">#{billNumber}</div>
            </div>
            <div className="text-right">
              <div className="mb-0.5 opacity-60">Date / Time</div>
              <div className="font-bold">
                {new Date().toLocaleString("en-IN", {
                  hour12: true,
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <table className="mb-4 w-full">
              <thead>
                <tr className="border-b border-stone-200 text-left text-[10px] uppercase opacity-70">
                  <th className="pb-2 font-normal">Item</th>
                  <th className="pb-2 text-center font-normal">Qty</th>
                  <th className="pb-2 text-right font-normal">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-stone-200">
                {bill.items?.map((item, index) => (
                  <tr key={`${item.productId}-${index}`}>
                    <td className="py-3 pr-2">
                      <div className="max-w-[120px] truncate font-bold sm:max-w-[160px]">{item.productName}</div>
                      {layout.showItemDetails ? (
                        <div className="mt-1 text-[9px] uppercase opacity-70">
                          {item.discountPercent > 0 ? <span>Disc -{item.discountPercent}% </span> : null}
                          {item.taxPercent > 0 ? <span>Tax +{item.taxPercent}%</span> : null}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 text-center opacity-80">{item.quantity}</td>
                    <td className="w-16 py-3 text-right font-bold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto space-y-2 border-t border-dashed border-stone-300 pt-4">
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Subtotal</span>
              <span>{bill.totalAmount.toFixed(2)}</span>
            </div>

            {layout.showDiscountBreakdown && bill.discountAmount > 0 ? (
              <div className="flex justify-between text-xs">
                <span className="opacity-80">Discount Total</span>
                <span>-{bill.discountAmount.toFixed(2)}</span>
              </div>
            ) : null}

            {layout.showTaxBreakdown && bill.taxAmount > 0 ? (
              <div className="flex justify-between text-xs">
                <span className="opacity-80">Tax</span>
                <span>+{bill.taxAmount.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="mt-3 flex justify-between border-t border-stone-300 pt-3">
              <span className="font-bold uppercase text-stone-500">Method</span>
              <span className="font-bold uppercase text-stone-800">{paymentMethod}</span>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-sm font-bold uppercase text-stone-500">Total</span>
              <span className="font-serif text-2xl font-bold leading-none text-stone-900">
                Rs {bill.finalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-dashed border-stone-300 pt-4 text-center">
            <p className="italic opacity-80">{layout.footerText || DEFAULT_BILL_LAYOUT.footerText}</p>
            <div className="mt-4 flex justify-center opacity-60">
              <span className="material-symbols-outlined text-4xl">receipt_long</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 rounded-b-3xl border-t border-outline-variant/30 bg-surface-container-high p-4">
          <button
            onClick={() => onConfirmCheckout(true)}
            disabled={confirmPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-70"
          >
            {confirmPending ? (
              <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-xl">print</span>
            )}
            {confirmPending ? "Processing..." : "Confirm & Print Receipt"}
          </button>

          <button
            onClick={() => onConfirmCheckout(false)}
            disabled={confirmPending}
            className="w-full rounded-xl border border-outline-variant/30 bg-transparent py-3 text-sm font-bold text-primary transition-all hover:bg-surface-container-highest"
          >
            Save without printing
          </button>
        </div>
      </div>
    </div>
  );
}
