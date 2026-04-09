import { motion } from "framer-motion";
import { DEFAULT_BILL_LAYOUT, getBillLayoutConfig, buildReceiptText } from "../lib/printer";
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#311300]/40 p-4 backdrop-blur-md"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-white/60 bg-surface-container-lowest shadow-[0_40px_100px_rgba(49,19,0,0.2)] ${receiptWidthClass}`}
      >
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

        <div className="hide-scrollbar flex flex-1 flex-col overflow-y-auto bg-white px-2 py-6 text-stone-900 justify-start items-center">
          <div 
            className="bg-white shadow-sm border border-stone-200 p-4 min-h-[300px]"
            style={{ width: `${layout.paperWidth || 80}mm` }}
          >
            <pre 
              className="m-0 whitespace-pre font-mono mx-auto overflow-hidden text-black"
              style={{
                fontSize: `calc((${layout.paperWidth || 80}mm - 4mm) / ${layout.itemsPerLine || 32} * 1.6)`,
                lineHeight: 1.2,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }}
            >
              {buildReceiptText({ ...bill, paymentMethod }, billNumber, layout, paymentMethod)}
            </pre>
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
      </motion.div>
    </motion.div>
  );
}
