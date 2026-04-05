import { getBillLayoutConfig, DEFAULT_BILL_LAYOUT, type BillLayoutConfig, printData } from "../lib/printer";
import type { BillDataWithProducts } from "./PosWorkspace";

interface BillPrintPreviewProps {
  bill: BillDataWithProducts;
  billNumber: string;
  paymentMethod: string;
  onPrint: () => void;
  onConfirmCheckout: (customerPhone?: string) => void;
  onClose: () => void;
  confirmPending?: boolean;
}

export function BillPrintPreview({
  bill,
  billNumber,
  paymentMethod,
  onPrint,
  onConfirmCheckout,
  onClose,
  confirmPending
}: BillPrintPreviewProps) {
  const layout = getBillLayoutConfig();

  const handlePrint = () => {
    // Legacy support logic is abstracted in printData, 
    // but the main confirm checkout is primary here.
    onPrint();
  };

  return (
    <div className="fixed inset-0 bg-[#311300]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="w-full max-w-sm max-h-[90vh] bg-surface-container-lowest rounded-3xl shadow-[0_40px_80px_rgba(49,19,0,0.2)] flex flex-col border border-outline-variant/30 overflow-hidden relative">
        
        {/* Receipt Header Style Element Component */}
        <div className="h-6 bg-surface-container-lowest relative flex gap-2 justify-center pt-2 -mb-2 overflow-hidden">
             {/* Zig zag cut top simulation - purely css borders */}
             <div className="absolute top-0 w-full h-2 flex justify-between space-x-[2px] bg-transparent">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-[#311300]/60 rotate-45 transform origin-top-left -translate-y-1"></div>
                  ))}
             </div>
        </div>

        <div className="flex justify-end p-4 absolute top-2 right-2 z-10">
          <button 
            className="material-symbols-outlined text-secondary bg-surface-container-highest hover:text-error transition-colors p-2 rounded-full cursor-pointer shadow-sm border border-outline-variant/20"
            onClick={onClose}
            disabled={confirmPending}
          >
            close
          </button>
        </div>

        {/* The Receipt content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 font-mono text-xs md:text-sm text-stone-800 flex flex-col hide-scrollbar">
          
          <div className="text-center mb-6">
             <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1 leading-tight tracking-tight">
               {layout.companyName || DEFAULT_BILL_LAYOUT.companyName}
             </h2>
             {layout.companyAddress && (
               <div className="text-[10px] text-stone-600 uppercase tracking-widest whitespace-pre-wrap">{layout.companyAddress}</div>
             )}
             {layout.companyPhone && (
               <div className="text-[10px] text-stone-600 mt-1 uppercase tracking-widest">TEL: {layout.companyPhone}</div>
             )}
          </div>

          <div className="border-t border-b border-dashed border-stone-300 py-3 mb-4 flex justify-between uppercase text-[10px] sm:text-xs">
            <div>
              <div className="opacity-60 mb-0.5">Transaction</div>
              <div className="font-bold">#{billNumber}</div>
            </div>
            <div className="text-right">
              <div className="opacity-60 mb-0.5">Date / Time</div>
              <div className="font-bold">{new Date().toLocaleString('en-US', { hour12: false, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div className="flex-1">
             <table className="w-full mb-4">
               <thead>
                 <tr className="border-b border-stone-200 text-left text-[10px] uppercase opacity-70">
                   <th className="pb-2 font-normal">Item</th>
                   <th className="pb-2 font-normal text-center">Qty</th>
                   <th className="pb-2 font-normal text-right">Price</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-dotted divide-stone-200">
                  {bill.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 pr-2">
                        <div className="font-bold truncate max-w-[120px]">{item.productName}</div>
                        {layout.showItemDetails && (
                           <div className="text-[9px] opacity-70 mt-1 uppercase">
                             {item.discountPercent > 0 && <span>Disc -{item.discountPercent}% </span>}
                             {item.taxPercent > 0 && <span>Tax +{item.taxPercent}%</span>}
                           </div>
                        )}
                      </td>
                      <td className="py-3 text-center opacity-80">{item.quantity}</td>
                      <td className="py-3 text-right font-bold w-16">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>

          <div className="border-t border-dashed border-stone-300 pt-4 space-y-2 mt-auto">
             <div className="flex justify-between text-xs">
               <span className="opacity-80">Subtotal</span>
               <span>{bill.subtotal.toFixed(2)}</span>
             </div>
             
             {layout.showDiscountBreakdown && bill.totalDiscount > 0 && (
               <div className="flex justify-between text-xs">
                 <span className="opacity-80">Discount Total</span>
                 <span>-{bill.totalDiscount.toFixed(2)}</span>
               </div>
             )}
             
             {layout.showTaxBreakdown && bill.totalTax > 0 && (
               <div className="flex justify-between text-xs">
                 <span className="opacity-80">Tax ({Math.round((bill.totalTax / bill.totalTaxable) * 100)}%)</span>
                 <span>+{bill.totalTax.toFixed(2)}</span>
               </div>
             )}
             
             <div className="flex justify-between border-t border-stone-300 pt-3 mt-3">
               <span className="font-bold uppercase text-stone-500">Method</span>
               <span className="font-bold uppercase text-stone-800">{paymentMethod}</span>
             </div>

             <div className="flex justify-between items-end mt-4">
               <span className="font-bold uppercase text-stone-500 text-sm">Total</span>
               <span className="font-serif text-2xl font-bold text-stone-900 leading-none">
                 $ {bill.finalAmount.toFixed(2)}
               </span>
             </div>
          </div>

          <div className="text-center mt-8 pt-4 border-t border-dashed border-stone-300">
             <p className="italic opacity-80">{layout.footerText || DEFAULT_BILL_LAYOUT.footerText}</p>
             <div className="mt-4 flex justify-center opacity-60">
                <span className="material-symbols-outlined text-4xl">barcode_scanner</span>
             </div>
          </div>

        </div>
        
        {/* Actions Footer */}
        <div className="p-4 bg-surface-container-high border-t border-outline-variant/30 flex flex-col gap-3 shrink-0 rounded-b-3xl">
           <button 
             onClick={() => onConfirmCheckout()}
             disabled={confirmPending}
             className="w-full py-4 rounded-xl font-bold bg-primary text-on-primary flex items-center justify-center gap-2 shadow-md hover:bg-primary-container transition-all disabled:opacity-70 active:scale-[0.98]"
           >
             {confirmPending ? (
               <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
             ) : (
               <span className="material-symbols-outlined text-xl">payments</span>
             )}
             {confirmPending ? 'Processing...' : 'Confirm & Print Receipt'}
           </button>
           <button 
             onClick={() => onConfirmCheckout()}
             disabled={confirmPending}
             className="w-full py-3 rounded-xl font-bold bg-transparent text-primary hover:bg-surface-container-highest transition-all text-sm border border-transparent shadow-none"
           >
             Save without printing
           </button>
        </div>
      </div>
    </div>
  );
}
