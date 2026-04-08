import { useState } from "react";
import { useCartStore } from "../lib/cart-store";
import { calculateCart } from "../lib/cart-calculations";

interface CartPanelProps {
  onCheckout: (paymentMethod: string) => void;
  checkoutPending: boolean;
  onOpenPrinterSettings: () => void;
}

export function CartPanel({
  onCheckout,
  checkoutPending,
  onOpenPrinterSettings
}: CartPanelProps) {
  const { items, removeItem, updateItem, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const summary = calculateCart(items);

  // A basic hash function to get a consistent image from Unsplash based on product name/id
  const getProductImage = (name: string, seed: string) => {
    // We'll use a placeholder for now since we don't have images in the DB
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e9e1d7&color=67625a&size=128`;
  };

  return (
    <div className="glass-panel flex h-full flex-col rounded-[28px] border border-outline-variant/20 p-4 shadow-sm md:p-6 xl:sticky xl:top-24">
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
        <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-12">
          <span className="material-symbols-outlined text-4xl mb-2">shopping_basket</span>
          <p className="text-sm">Cart is empty</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mb-6 max-h-[42vh] flex-1 space-y-4 overflow-y-auto pr-1 md:mb-8 md:max-h-[50vh] md:space-y-6">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group rounded-2xl border border-outline-variant/15 bg-surface-container-low/35 p-3 sm:flex sm:gap-3 md:gap-4"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden ring-1 ring-outline-variant/20">
                  <img
                    alt={item.name}
                    src={getProductImage(item.name, item.productId)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 min-w-0 flex-1 sm:mt-0">
                  <div className="flex justify-between gap-2">
                    <h5 className="font-semibold text-on-background truncate text-sm md:text-base">{item.name}</h5>
                    <p className="font-headline font-bold text-sm md:text-base shrink-0">
                      Rs {(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="truncate text-[10px] font-medium uppercase tracking-widest text-secondary md:text-xs">
                      {item.barcode ? `SKU: ${item.barcode}` : 'NO SKU'}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 bg-surface-container-low p-1 rounded-full ring-1 ring-outline-variant/20">
                      <button
                        className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeItem(item.productId);
                          } else {
                            updateItem(item.productId, "quantity", item.quantity - 1);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px] md:text-[16px]">remove</span>
                      </button>
                      <span className="font-bold w-4 text-center text-xs md:text-sm">{item.quantity}</span>
                      <button
                        className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                        onClick={() => updateItem(item.productId, "quantity", item.quantity + 1)}
                      >
                        <span className="material-symbols-outlined text-[14px] md:text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                  {/* Optional mobile-only price + discount inputs */}
                  {(item.discountPercent > 0 || item.taxPercent > 0) && (
                    <div className="flex gap-2 mt-1 text-[10px] text-secondary">
                      {item.discountPercent > 0 && <span>-{item.discountPercent}%</span>}
                      {item.taxPercent > 0 && <span>+{item.taxPercent}% tax</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Checkout */}
          <div className="pt-6 md:pt-8 border-t border-outline-variant/30 space-y-4 md:space-y-6">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3 md:p-4">
                <span className="text-sm font-medium text-on-secondary-container md:text-base">Payment Method</span>
                <div className="hide-scrollbar flex overflow-x-auto rounded-full bg-surface-container-high p-1">
                  {["cash", "card", "upi"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`min-w-[72px] rounded-full px-3 py-2 text-[10px] font-bold uppercase md:px-4 md:text-xs ${
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
              onClick={() => onCheckout(paymentMethod)}
              disabled={checkoutPending}
              className="w-full bg-primary text-on-primary py-4 md:py-6 rounded-xl text-lg md:text-xl font-bold hover:bg-primary-container transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
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
