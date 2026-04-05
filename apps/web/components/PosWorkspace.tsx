"use client";

import { useEffect, useMemo, useState } from "react";
import { CartPanel } from "./CartPanel";
import { CreateProductModal } from "./CreateProductModal";
import { ProductGrid } from "./ProductGrid";
import { ScannerPanel } from "./ScannerPanel";
import { BillPrintPreview } from "./BillPrintPreview";
import { PrinterSettings } from "./PrinterSettings";
import { checkoutBill, createProduct, getProductByBarcode, getProducts } from "../lib/api";
import { calculateCart } from "../lib/cart-calculations";
import { useCartStore } from "../lib/cart-store";
import { parseBarcodeData } from "../lib/barcode-parser";
import { calculateCheckout } from "../lib/billing";
import type { Product } from "../types";

export type BillDataWithProducts = ReturnType<typeof calculateCheckout> & {
  items?: Array<{
    productName: string;
    productId: string;
    quantity: number;
    price: number;
    discountPercent: number;
    taxPercent: number;
    lineSubtotal: number;
    discountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    total: number;
  }>;
};

export function PosWorkspace() {
  const { addItem, items, clearCart, updateItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createBarcode, setCreateBarcode] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printerSettingsOpen, setPrinterSettingsOpen] = useState(false);
  const [billPreviewOpen, setBillPreviewOpen] = useState(false);
  const [billData, setBillData] = useState<BillDataWithProducts | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  const visibleProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }

    const query = search.toLowerCase();
    return products.filter((product) =>
      [product.name, product.category || "", product.barcode || ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, search]);

  const cartSummary = useMemo(() => calculateCart(items), [items]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const nextProducts = await getProducts();
      setProducts(nextProducts);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleProductAdd = (product: Product) => {
    addItem(product);
    setMessage(`${product.name} added to cart`);
    setError(null);
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    if (!barcode.trim()) {
      return;
    }

    try {
      const barcodeData = parseBarcodeData(barcode.trim());
      const product = await getProductByBarcode(barcodeData.barcode);
      handleProductAdd(product);

      const cartItem = items.find((item) => item.productId === product.id);
      if (cartItem) {
        if (barcodeData.price !== undefined) {
          updateItem(product.id, "price", barcodeData.price);
          setMessage(`${product.name} added (price: Rs ${barcodeData.price.toFixed(2)})`);
        } else {
          setMessage(`${product.name} added to cart`);
        }

        if (barcodeData.discount !== undefined && barcodeData.discount > 0) {
          updateItem(product.id, "discountPercent", barcodeData.discount);
        }

        if (barcodeData.quantity !== undefined && barcodeData.quantity > 1) {
          updateItem(product.id, "quantity", barcodeData.quantity);
        }
      }
      setBarcodeInput("");
    } catch {
      setCreateBarcode(barcode.trim().split("|")[0]);
      setCreateModalOpen(true);
      setMessage(null);
      setError("Barcode not found. Create the product and continue.");
    }
  };

  const handleCreateProduct = async (payload: {
    name: string;
    category?: string;
    barcode?: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
    discountPercent: number;
    taxPercent: number;
  }) => {
    const product = await createProduct(payload);
    setProducts((current) => [product, ...current]);
    addItem(product);
    setBarcodeInput("");
    setMessage(`${product.name} created and added to cart`);
    setError(null);
    return product;
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      setCheckoutPending(true);
      setError(null);
      setSelectedPaymentMethod(paymentMethod);

      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent
      }));

      const summary = calculateCheckout(checkoutItems);

      const billItems = summary.items.map((summaryItem) => ({
        ...summaryItem,
        productName: items.find((item) => item.productId === summaryItem.productId)?.name || "Item"
      }));

      setBillData({
        ...summary,
        items: billItems
      });
      setBillPreviewOpen(true);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
      setCheckoutPending(false);
    }
  };

  const handleConfirmCheckout = async (_customerPhone?: string) => {
    try {
      const result = await checkoutBill(items, selectedPaymentMethod);
      clearCart();
      setBillPreviewOpen(false);
      setBillData(null);
      setMessage(`Bill ${result.id.slice(0, 8)} saved successfully`);
      await loadProducts();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    } finally {
      setCheckoutPending(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="glass-panel p-4 md:p-6 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs md:text-sm text-on-secondary-container font-medium mb-1 md:mb-1 uppercase tracking-tighter">Catalog</p>
            <p className="text-2xl md:text-3xl font-headline text-on-background">
              {products.length} <span className="text-xs md:text-sm font-sans text-secondary">units</span>
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">inventory_2</span>
          </div>
        </div>
        
        <div className="glass-panel p-4 md:p-6 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs md:text-sm text-on-secondary-container font-medium mb-1 md:mb-1 uppercase tracking-tighter">Active Cart</p>
            <p className="text-2xl md:text-3xl font-headline text-on-background">
              {items.length} <span className="text-xs md:text-sm font-sans text-secondary">items</span>
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-fixed text-xl md:text-2xl">shopping_bag</span>
          </div>
        </div>
        
        <div className="glass-panel p-4 md:p-6 rounded-lg flex justify-between items-center shadow-sm sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-xs md:text-sm text-on-secondary-container font-medium mb-1 md:mb-1 uppercase tracking-tighter">Payable</p>
            <p className="text-2xl md:text-3xl font-headline text-primary font-bold">
              Rs {cartSummary.finalAmount.toFixed(2)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-xl md:text-2xl">payments</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scanner & Products */}
        <div className="lg:col-span-7 space-y-8">
          <ScannerPanel
            barcodeInput={barcodeInput}
            setBarcodeInput={setBarcodeInput}
            onBarcodeSubmit={handleBarcodeSubmit}
          />
          
          <div className="glass-panel p-6 md:p-8 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
              <div>
                <h3 className="font-headline text-xl md:text-2xl font-bold flex items-center gap-2">
                  New Collections
                  {loading && <span className="material-symbols-outlined text-sm animate-spin">refresh</span>}
                </h3>
              </div>
              
              <div className="w-full md:w-auto relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm md:text-base">search</span>
                <input
                  className="w-full md:w-64 bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body text-sm md:text-base"
                  placeholder="Search catalog..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <ProductGrid products={visibleProducts} onAdd={handleProductAdd} />
          </div>
        </div>

        {/* Right Column: Cart Panel */}
        <div className="lg:col-span-5">
           <CartPanel
            onCheckout={handleCheckout}
            checkoutPending={checkoutPending}
            onOpenPrinterSettings={() => setPrinterSettingsOpen(true)}
          />
        </div>
      </div>

      {/* Global Alerts */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {message && (
          <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm shadow-lg pointer-events-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {message}
          </div>
        )}
        {error && (
          <div className="bg-error-container text-error px-6 py-3 rounded-full text-sm shadow-lg pointer-events-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
            <button 
              onClick={() => void loadProducts()}
              className="ml-2 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {billPreviewOpen && billData && (
        <BillPrintPreview
          bill={billData}
          billNumber={Math.random().toString(36).substring(7).toUpperCase()}
          paymentMethod={selectedPaymentMethod}
          confirmPending={checkoutPending}
          onPrint={() => void handleConfirmCheckout()}
          onConfirmCheckout={handleConfirmCheckout}
          onClose={() => {
            setBillPreviewOpen(false);
            setBillData(null);
            setCheckoutPending(false);
          }}
        />
      )}

      {printerSettingsOpen && (
        <PrinterSettings onClose={() => setPrinterSettingsOpen(false)} />
      )}

      <CreateProductModal
        barcode={createBarcode}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </>
  );
}
