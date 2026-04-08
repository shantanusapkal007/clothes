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
import { parseBarcodeData, type BarcodeData } from "../lib/barcode-parser";
import { calculateCheckout } from "../lib/billing";
import { getBillLayoutConfig, getPrinterConfig, printReceipt } from "../lib/printer";
import type { Product } from "../types";

export type BillDataWithProducts = Omit<ReturnType<typeof calculateCheckout>, "items"> & {
  items: Array<{
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

function createPreviewBillNumber() {
  return `PRE-${Date.now().toString().slice(-6)}`;
}

function describePrinterRoute() {
  const printerConfig = getPrinterConfig();
  if (!printerConfig.connected || printerConfig.connectionType === "none") {
    return "Browser print fallback";
  }

  return `${printerConfig.connectionType.toUpperCase()} printer: ${printerConfig.name}`;
}

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

  const handleProductAdd = (product: Product) => {
    addItem(product);
    setMessage(`${product.name} added to cart`);
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
      let nextMessage = `Bill ${savedBillNumber} saved successfully`;

      if (shouldPrint && printableBill) {
        const printRoute = await printReceipt(
          {
            ...printableBill,
            paymentMethod: selectedPaymentMethod,
            createdAt: result.createdAt
          },
          savedBillNumber,
          getPrinterConfig(),
          getBillLayoutConfig()
        );

        if (printRoute === "device") {
          nextMessage = `${nextMessage} and sent to the configured printer`;
        } else if (printRoute === "browser") {
          nextMessage = `${nextMessage}. Browser print preview opened because no direct printer connection was available.`;
        } else {
          setError("Bill saved, but printing failed. Check the printer connection and try again.");
        }
      }

      clearCart();
      setBillPreviewOpen(false);
      setBillData(null);
      setPreviewBillNumber("");
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
          <strong>Rs {cartSummary.finalAmount.toFixed(2)}</strong>
          <span className="ops-help">live checkout total</span>
        </div>
      </section>

      <div className="workspace-grid">
        <div className="workspace-left">
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
              {loading ? <span className="badge badge-muted">Loading</span> : null}
            </div>
            <input
              className="text-input"
              placeholder="Search by name, category, or barcode"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </section>

          <ProductGrid products={visibleProducts} onAdd={handleProductAdd} />
        </div>

        <div className="workspace-right">
          <div className="panel-options">
            <button
              className="button button-secondary button-small"
              onClick={() => setPrinterSettingsOpen(true)}
              title="Configure thermal printer and bill layout"
            >
              Printer Settings
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
          />
        </div>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? (
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void loadProducts()}
          >
            Retry loading
          </button>
        </div>
      ) : null}

      {billPreviewOpen && billData ? (
        <BillPrintPreview
          bill={billData}
          billNumber={previewBillNumber}
          paymentMethod={selectedPaymentMethod}
          printerStatus={printerStatus}
          confirmPending={checkoutPending}
          onConfirmCheckout={handleConfirmCheckout}
          onClose={() => {
            setBillPreviewOpen(false);
            setBillData(null);
            setPreviewBillNumber("");
            setCheckoutPending(false);
          }}
        />
      ) : null}

      {printerSettingsOpen ? (
        <PrinterSettings onClose={() => setPrinterSettingsOpen(false)} />
      ) : null}

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



