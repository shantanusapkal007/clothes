"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CartPanel, type CheckoutRequest } from "./CartPanel";
import { CreateProductModal } from "./CreateProductModal";
import { ProductGrid } from "./ProductGrid";
import { ScannerPanel } from "./ScannerPanel";
import { BillPrintPreview } from "./BillPrintPreview";
import { PrinterSettings } from "./PrinterSettings";
import { checkoutBill, createProduct, getProductByBarcode, getProducts } from "../lib/api";
import { calculateCart } from "../lib/cart-calculations";
import { useCartStore } from "../lib/cart-store";
import { parseBarcodeData, type BarcodeData } from "../lib/barcode-parser";
import { calculateCheckout } from "../lib/billing";
import {
  STORE_WHATSAPP_NUMBER,
  getBillLayoutConfig,
  getPrinterConfig,
  isIosBrowser,
  printReceipt
} from "../lib/printer";
import { buildWhatsAppBillMessage, openWhatsAppShare } from "../lib/whatsapp";
import type { Product } from "../types";

import { ProductSkeleton } from "./Skeleton";

export type BillDataWithProducts = Omit<ReturnType<typeof calculateCheckout>, "items"> & {
  items: Array<{
    productName: string;
    productId: string;
    quantity: number;
    price: number;
    discountPercent: number;
    manualDiscountAmount: number;
    taxPercent: number;
    lineSubtotal: number;
    discountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    total: number;
  }>;
};

function createPreviewBillNumber() {
  return `PRE-${Date.now().toString().slice(-6)}`;
}

function describePrinterRoute() {
  const printerConfig = getPrinterConfig();
  if (!printerConfig.connected || printerConfig.connectionType === "none") {
    return isIosBrowser() ? "Safari print / AirPrint" : "Browser print fallback";
  }

  if (printerConfig.connectionType === "rawbt") {
    return "RawBT Android bridge";
  }

  return `${printerConfig.connectionType.toUpperCase()} printer: ${printerConfig.name}`;
}

type MobileView = "products" | "cart";

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
  const [createSeed, setCreateSeed] = useState<BarcodeData | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printerSettingsOpen, setPrinterSettingsOpen] = useState(false);
  const [billPreviewOpen, setBillPreviewOpen] = useState(false);
  const [billData, setBillData] = useState<BillDataWithProducts | null>(null);
  const [previewBillNumber, setPreviewBillNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [mobileView, setMobileView] = useState<MobileView>("products");
  const [pendingWhatsApp, setPendingWhatsApp] = useState<{
    customerPhone: string;
    sendWhatsApp: boolean;
  }>({
    customerPhone: "",
    sendWhatsApp: false
  });

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
  const printerStatus = useMemo(() => describePrinterRoute(), [printerSettingsOpen, billPreviewOpen]);

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

  // Auto-clear messages after 4s
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleProductAdd = (product: Product) => {
    addItem(product);
    setMessage(`${product.name} added`);
    setError(null);
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    if (!barcode.trim()) {
      return;
    }

    const barcodeData = parseBarcodeData(barcode.trim());

    try {
      const product = await getProductByBarcode(barcodeData.barcode);

      addItem(product);

      const cartItem = useCartStore
        .getState()
        .items.find((item) => item.productId === product.id);

      if (!cartItem) {
        setMessage(`${product.name} added to cart`);
      } else {
        if (barcodeData.price !== undefined) {
          updateItem(product.id, "price", barcodeData.price);
        }

        if (barcodeData.discount !== undefined) {
          updateItem(product.id, "discountPercent", barcodeData.discount);
        }

        if (barcodeData.quantity !== undefined && barcodeData.quantity > 0) {
          updateItem(product.id, "quantity", barcodeData.quantity);
        }

        const messageBits = [`${product.name} added`];
        if (barcodeData.price !== undefined) {
          messageBits.push(`price Rs ${barcodeData.price.toFixed(2)}`);
        }
        if (barcodeData.discount !== undefined) {
          messageBits.push(`discount ${barcodeData.discount}%`);
        }
        if (barcodeData.quantity !== undefined && barcodeData.quantity > 1) {
          messageBits.push(`qty ${barcodeData.quantity}`);
        }

        setMessage(messageBits.join(" | "));
      }

      setError(null);
      setBarcodeInput("");
    } catch {
      setCreateBarcode(barcodeData.barcode);
      setCreateSeed(barcodeData);
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

  const handleCheckout = async ({
    paymentMethod,
    customerPhone,
    sendWhatsApp
  }: CheckoutRequest) => {
    try {
      setCheckoutPending(true);
      setError(null);
      setSelectedPaymentMethod(paymentMethod);
      setPendingWhatsApp({
        customerPhone,
        sendWhatsApp
      });

      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discountPercent: item.discountPercent,
        manualDiscountAmount: item.manualDiscountAmount,
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
      setPreviewBillNumber(createPreviewBillNumber());
      setBillPreviewOpen(true);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    } finally {
      setCheckoutPending(false);
    }
  };

  const handleConfirmCheckout = async (shouldPrint: boolean) => {
    const printableBill = billData
      ? {
          ...billData,
          paymentMethod: selectedPaymentMethod
        }
      : null;

    try {
      setCheckoutPending(true);
      setError(null);

      const result = await checkoutBill(items, selectedPaymentMethod);
      const savedBillNumber = result.id.slice(0, 8).toUpperCase();
      const billLayout = getBillLayoutConfig();
      const savedPrintableBill = printableBill
        ? {
            ...printableBill,
            paymentMethod: selectedPaymentMethod,
            createdAt: result.createdAt
          }
        : null;
      let nextMessage = `Bill ${savedBillNumber} saved`;

      if (shouldPrint && savedPrintableBill) {
        const printRoute = await printReceipt(
          savedPrintableBill,
          savedBillNumber,
          getPrinterConfig(),
          billLayout
        );

        if (printRoute === "device") {
          nextMessage = `${nextMessage} — sent to printer`;
        } else if (printRoute === "browser") {
          nextMessage = `${nextMessage} — print preview opened`;
        } else {
          setError("Bill saved, but printing failed. Check the printer connection.");
        }
      }

      if (pendingWhatsApp.sendWhatsApp && pendingWhatsApp.customerPhone && savedPrintableBill) {
        const whatsAppMessage = buildWhatsAppBillMessage(
          savedPrintableBill,
          savedBillNumber,
          billLayout,
          selectedPaymentMethod
        );
        const opened = openWhatsAppShare(whatsAppMessage, pendingWhatsApp.customerPhone);
        nextMessage = opened
          ? `${nextMessage}. WhatsApp opened.`
          : `${nextMessage}. WhatsApp ready.`;
      }

      clearCart();
      setBillPreviewOpen(false);
      setBillData(null);
      setPreviewBillNumber("");
      setPendingWhatsApp({ customerPhone: "", sendWhatsApp: false });
      setMobileView("products");
      setMessage(nextMessage);
      await loadProducts();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    } finally {
      setCheckoutPending(false);
    }
  };

  return (
    <>
      {/* ─── Stats Strip ─── */}
      <section className="ops-strip">
        <div className="ops-card">
          <span className="ops-label">Catalog</span>
          <strong>{products.length}</strong>
          <span className="ops-help">products loaded</span>
        </div>
        <div className="ops-card">
          <span className="ops-label">Cart</span>
          <strong>{items.length}</strong>
          <span className="ops-help">line items</span>
        </div>
        <div className="ops-card">
          <span className="ops-label">Payable</span>
          <strong>₹{cartSummary.finalAmount.toFixed(0)}</strong>
          <span className="ops-help">live checkout total</span>
        </div>
      </section>

      {/* ─── Mobile Tab Switcher (visible < xl) ─── */}
      <div className="mb-3 xl:hidden">
        <div className="mobile-tab-bar">
          <button
            type="button"
            className={`mobile-tab ${mobileView === "products" ? "mobile-tab--active" : "mobile-tab--inactive"}`}
            onClick={() => setMobileView("products")}
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Products
          </button>
          <button
            type="button"
            className={`mobile-tab ${mobileView === "cart" ? "mobile-tab--active" : "mobile-tab--inactive"}`}
            onClick={() => setMobileView("cart")}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Cart
            {items.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Workspace Grid ─── */}
      <div className="workspace-grid">
        {/* Left: Products — hidden on mobile when cart tab is active */}
        <div className={`workspace-left ${mobileView === "cart" ? "hidden xl:block" : ""}`}>
          <ScannerPanel
            barcodeInput={barcodeInput}
            setBarcodeInput={setBarcodeInput}
            onBarcodeSubmit={handleBarcodeSubmit}
          />

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Search</p>
                <h2>Fast product lookup</h2>
              </div>
            </div>
            <input
              className="text-input"
              placeholder="Search by name, category, or barcode"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </section>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ProductGrid products={visibleProducts} onAdd={handleProductAdd} />
          )}
        </div>

        {/* Right: Cart — hidden on mobile when products tab is active */}
        <div className={`workspace-right ${mobileView === "products" ? "hidden xl:block" : ""}`}>
          <div className="panel-options">
            <button
              className="button button-secondary button-small"
              onClick={() => setPrinterSettingsOpen(true)}
              title="Configure thermal printer and bill layout"
            >
              <span className="material-symbols-outlined text-[16px] mr-1.5">print</span>
              Printer
            </button>
            <button
              className="button button-ghost button-small"
              type="button"
              onClick={() => void loadProducts()}
            >
              Refresh
            </button>
          </div>

          <CartPanel
            onCheckout={handleCheckout}
            checkoutPending={checkoutPending}
            onOpenPrinterSettings={() => setPrinterSettingsOpen(true)}
            storeWhatsAppNumber={STORE_WHATSAPP_NUMBER}
          />
        </div>
      </div>

      {/* ─── Floating Cart Badge (mobile only, when on products tab with items) ─── */}
      {mobileView === "products" && items.length > 0 && (
        <button
          type="button"
          className="floating-cart-badge xl:hidden"
          onClick={() => setMobileView("cart")}
        >
          <span className="material-symbols-outlined text-xl">shopping_cart</span>
          <span>{items.length} — ₹{cartSummary.finalAmount.toFixed(0)}</span>
        </button>
      )}

      {/* ─── Status Messages ─── */}
      <AnimatePresence>
        {message ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="success-text"
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {error ? (
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void loadProducts()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* ─── Modals ─── */}
      <AnimatePresence>
      {billPreviewOpen && billData ? (
        <BillPrintPreview
          bill={billData}
          billNumber={previewBillNumber}
          paymentMethod={selectedPaymentMethod}
          printerStatus={printerStatus}
          whatsAppCustomerPhone={
            pendingWhatsApp.sendWhatsApp ? pendingWhatsApp.customerPhone : undefined
          }
          whatsappSenderPhone={STORE_WHATSAPP_NUMBER}
          confirmPending={checkoutPending}
          onConfirmCheckout={handleConfirmCheckout}
          onClose={() => {
            setBillPreviewOpen(false);
            setBillData(null);
            setPreviewBillNumber("");
            setCheckoutPending(false);
            setPendingWhatsApp({ customerPhone: "", sendWhatsApp: false });
          }}
        />
      ) : null}
      </AnimatePresence>

      <AnimatePresence>
      {printerSettingsOpen ? (
        <PrinterSettings onClose={() => setPrinterSettingsOpen(false)} />
      ) : null}
      </AnimatePresence>

      <CreateProductModal
        barcode={createBarcode}
        seed={createSeed}
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateSeed(null);
        }}
        onCreate={handleCreateProduct}
      />
    </>
  );
}
